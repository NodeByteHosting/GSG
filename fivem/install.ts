import type { ComposeConfig } from "../compose";
import { escapeComposeValue } from "../compose";
import type { FivemSettings } from "./settings";

// Runtime image matches the Pterodactyl yolks project.
export const dockerImage = "ghcr.io/ptero-eggs/yolks:debian";

// Working directory inside the container — all paths are relative to this.
const DATA = "/data";

// Indents each line for embedding in a YAML |- block scalar.
const yamlBlock = (lines: string[], indent = 10) =>
  lines.map((l) => `${" ".repeat(indent)}${l}`).join("\n");

export const buildFivemCompose = (
  config: ComposeConfig,
  settings: FivemSettings
): string => {
  const timezone = config.timezone ?? "UTC";
  const escape = escapeComposeValue;
  const hostname = escape(settings.serverHostname || config.name);
  // Version is baked in at deploy time.
  const version = escape(settings.fivemVersion || "recommended");

  // ── Install script ──────────────────────────────────────────────────────────
  // Mirrors the Pterodactyl egg installation script exactly.
  // Skipped on container restart if FXServer binary is already present.
  const installScript = yamlBlock([
    "set -e",
    `if [ -f ${DATA}/alpine/opt/cfx-server/FXServer ]; then`,
    "  echo 'FXServer already installed — skipping.'",
    "  exit 0",
    "fi",
    "apt-get update -y",
    "apt-get install -y tar xz-utils file jq curl git",
    `mkdir -p ${DATA}/resources ${DATA}/logs`,
    `cd ${DATA}`,
    "# Clone default cfx-server-data resources",
    "git clone --depth=1 https://github.com/citizenfx/cfx-server-data.git /tmp/cfx-data",
    `cp -Rf /tmp/cfx-data/resources/* ${DATA}/resources/`,
    "rm -rf /tmp/cfx-data",
    "# Resolve artifact download URL via changelogs API",
    "CHANGELOGS=$(curl -sSL https://changelogs-live.fivem.net/api/changelog/versions/linux/server)",
    `VERSION='${version}'`,
    `if [ "$VERSION" = 'recommended' ] || [ -z "$VERSION" ]; then`,
    "  DOWNLOAD_LINK=$(echo $CHANGELOGS | jq -r '.recommended_download')",
    `elif [ "$VERSION" = 'latest' ]; then`,
    "  DOWNLOAD_LINK=$(echo $CHANGELOGS | jq -r '.latest_download')",
    "else",
    "  RELEASE_PAGE=$(curl -sSL https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/)",
    `  VERSION_LINK=$(echo "$RELEASE_PAGE" | grep -Eo '"[^"]+\\.tar\\.xz"' | sed 's/"//g' | grep -i "$VERSION" | head -1)`,
    `  if [ -z "$VERSION_LINK" ]; then`,
    `    echo "Version $VERSION not found — falling back to recommended."`,
    "    DOWNLOAD_LINK=$(echo $CHANGELOGS | jq -r '.recommended_download')",
    "  else",
    `    DOWNLOAD_LINK="https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/$VERSION_LINK"`,
    "  fi",
    "fi",
    `echo "Downloading $DOWNLOAD_LINK ..."`,
    `curl -sSL "$DOWNLOAD_LINK" -o /tmp/fx.tar.xz`,
    "echo 'Extracting...'",
    `tar xvf /tmp/fx.tar.xz -C ${DATA}`,
    "rm -f /tmp/fx.tar.xz",
    `if [ ! -f ${DATA}/server.cfg ]; then`,
    "  echo 'Downloading default server.cfg...'",
    `  curl -sSL https://raw.githubusercontent.com/ptero-eggs/game-eggs/main/gta/fivem/server.cfg >> ${DATA}/server.cfg`,
    `  echo 'set gamename "gta5"' >> ${DATA}/server.cfg`,
    "fi",
    "echo 'FiveM installation complete.'",
  ]);

  // ── Runtime startup ─────────────────────────────────────────────────────────
  // Startup command mirrors the Pterodactyl egg startup exactly.
  // The musl dynamic linker bootstraps the Alpine-packaged FXServer binary.
  // When txAdmin is disabled, +exec server.cfg is passed so the server reads
  // configuration on startup. When txAdmin is enabled, txAdmin handles that
  // itself — omitting +exec server.cfg lets txAdmin take over.
  const noTxAdminSuffix = settings.enableTxAdmin
    ? ""
    : " \\\n  +exec server.cfg";
  const startupLines = [
    `exec ${DATA}/alpine/opt/cfx-server/ld-musl-x86_64.so.1 \\`,
    `  --library-path "${DATA}/alpine/usr/lib/v8/:${DATA}/alpine/lib/:${DATA}/alpine/usr/lib/" \\`,
    `  -- ${DATA}/alpine/opt/cfx-server/FXServer \\`,
    `  +set citizen_dir ${DATA}/alpine/opt/cfx-server/citizen/ \\`,
    `  +set sv_licenseKey ${escape(settings.license)} \\`,
    `  +set steam_webApiKey ${escape(settings.steamWebApiKey)} \\`,
    `  +set sv_maxplayers ${settings.maxPlayers}${noTxAdminSuffix}`,
  ];
  const startupScript = yamlBlock(startupLines);

  // txAdmin requires its own port and additional env vars.
  const txAdminEnvLines = settings.enableTxAdmin
    ? [
        `      TXADMIN_ENABLE: "1"`,
        `      TXHOST_GAME_NAME: "fivem"`,
        `      TXHOST_TXA_PORT: "40120"`,
        `      TXHOST_DATA_PATH: "${DATA}/txData"`,
      ].join("\n")
    : `      TXADMIN_ENABLE: "0"`;

  const txAdminPort = settings.enableTxAdmin
    ? `\n      - "40120:40120/tcp"`
    : "";

  return `services:
  # Bootstrap: downloads FXServer + cfx-server-data on first deploy.
  install:
    image: ${dockerImage}
    user: root
    working_dir: ${DATA}
    command:
      - bash
      - -c
      - |-
${installScript}
    volumes:
      - /var/lib/nodebyte/game/data:${DATA}

  fivem:
    image: ${dockerImage}
    container_name: nodebyte-game
    restart: unless-stopped
    depends_on:
      install:
        condition: service_completed_successfully
    ports:
      - "30120:30120/tcp"
      - "30120:30120/udp"
      - "30110:30110/udp"${txAdminPort}
    environment:
      TZ: "${timezone}"
      FIVEM_LICENSE: "${escape(settings.license)}"
      SERVER_HOSTNAME: "${hostname}"
      MAX_PLAYERS: "${settings.maxPlayers}"
      STEAM_WEBAPIKEY: "${escape(settings.steamWebApiKey)}"
${txAdminEnvLines}
    working_dir: ${DATA}
    command:
      - bash
      - -c
      - |-
${startupScript}
    volumes:
      - /var/lib/nodebyte/game/data:${DATA}
`;
};
