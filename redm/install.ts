import type { ComposeConfig } from "../compose";
import { escapeComposeValue } from "../compose";
import type { RedmSettings } from "./settings";

// Same runtime image as FiveM — both use the CFX framework.
export const dockerImage = "ghcr.io/ptero-eggs/yolks:debian";

const DATA = "/data";

const yamlBlock = (lines: string[], indent = 10) =>
  lines.map((l) => `${" ".repeat(indent)}${l}`).join("\n");

export const buildRedmCompose = (
  config: ComposeConfig,
  settings: RedmSettings
): string => {
  const timezone = config.timezone ?? "UTC";
  const escape = escapeComposeValue;
  const hostname = escape(settings.serverHostname || config.name);
  const version = escape(settings.cfxVersion || "latest");

  // ── Install script ──────────────────────────────────────────────────────────
  // Same install process as FiveM — both use the same CFX artifact.
  // Sets gamename to rdr3 in server.cfg on first install.
  const installScript = yamlBlock([
    "set -e",
    `if [ -f ${DATA}/alpine/opt/cfx-server/FXServer ]; then`,
    "  echo 'CFX server already installed — skipping.'",
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
    `    echo "Version $VERSION not found — falling back to latest."`,
    "    DOWNLOAD_LINK=$(echo $CHANGELOGS | jq -r '.latest_download')",
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
    `  echo 'set gamename "rdr3"' >> ${DATA}/server.cfg`,
    "fi",
    "echo 'RedM installation complete.'",
  ]);

  // ── Runtime startup ─────────────────────────────────────────────────────────
  // Mirrors the Pterodactyl RedM egg startup exactly.
  // +set gamename rdr3 is appended so FXServer runs in RDR2 mode.
  const startupLines = [
    `exec ${DATA}/alpine/opt/cfx-server/ld-musl-x86_64.so.1 \\`,
    `  --library-path "${DATA}/alpine/usr/lib/v8/:${DATA}/alpine/lib/:${DATA}/alpine/usr/lib/" \\`,
    `  -- ${DATA}/alpine/opt/cfx-server/FXServer \\`,
    `  +set citizen_dir ${DATA}/alpine/opt/cfx-server/citizen/ \\`,
    `  +set sv_licenseKey ${escape(settings.license)} \\`,
    `  +set steam_webApiKey ${escape(settings.steamWebApiKey)} \\`,
    `  +set sv_maxplayers ${settings.maxPlayers} \\`,
    "  +exec server.cfg \\",
    "  +set gamename rdr3",
  ];
  const startupScript = yamlBlock(startupLines);

  return `services:
  # Bootstrap: downloads CFX server + cfx-server-data on first deploy.
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

  redm:
    image: ${dockerImage}
    container_name: nodebyte-game
    restart: unless-stopped
    depends_on:
      install:
        condition: service_completed_successfully
    ports:
      - "30120:30120/tcp"
      - "30120:30120/udp"
      - "30110:30110/udp"
      - "30130:30130/tcp"
    environment:
      TZ: "${timezone}"
      CFX_LICENSE: "${escape(settings.license)}"
      SERVER_HOSTNAME: "${hostname}"
      MAX_PLAYERS: "${settings.maxPlayers}"
      STEAM_WEBAPIKEY: "${escape(settings.steamWebApiKey)}"
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
