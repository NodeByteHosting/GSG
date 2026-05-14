import type { ComposeConfig } from "../compose";
import { escapeComposeValue } from "../compose";
import type { HytaleSettings } from "./settings";

export const dockerImage = "ghcr.io/pterodactyl/games:hytale";

// Default game port for Hytale.
const GAME_PORT = 25_565;
// Source Query port (A2S) — one above the game port.
const QUERY_PORT = 25_566;

export const buildHytaleCompose = (
  config: ComposeConfig,
  settings: HytaleSettings
): string => {
  const timezone = config.timezone ?? "UTC";
  const escape = escapeComposeValue;

  // Build the java flags list so the startup command is readable.
  const jvmFlags: string[] = [];
  if (settings.useAotCache) {
    jvmFlags.push("-XX:AOTCache=Server/HytaleServer.aot");
  }
  jvmFlags.push("-Xms128M", `-Xmx${settings.maxMemoryMb}M`);

  // Build the server arg list.
  const serverArgs: string[] = [];
  if (settings.allowOp) {
    serverArgs.push("--allow-op");
  }
  if (settings.acceptEarlyPlugins) {
    serverArgs.push("--accept-early-plugins");
  }
  if (settings.disableSentry) {
    serverArgs.push("--disable-sentry");
  }
  serverArgs.push(
    `--auth-mode ${escape(settings.authMode)}`,
    "--assets Assets.zip",
    `--bind 0.0.0.0:${GAME_PORT}`
  );

  const command = [
    "java",
    ...jvmFlags,
    "-jar Server/HytaleServer.jar",
    ...serverArgs,
  ].join(" ");

  return `services:
  hytale:
    image: ${dockerImage}
    container_name: nodebyte-game
    hostname: nodebyte-game
    restart: unless-stopped
    stop_grace_period: 30s
    security_opt:
      - seccomp=unconfined
    sysctls:
      - net.ipv6.conf.all.disable_ipv6=1
      - net.ipv6.conf.default.disable_ipv6=1
    ports:
      - "${GAME_PORT}:${GAME_PORT}/tcp"
      - "${QUERY_PORT}:${QUERY_PORT}/udp"
    environment:
      TZ: "${timezone}"
      HYTALE_PATCHLINE: "${escape(settings.patchline)}"
    command: ["sh", "-c", "${escape(command)}"]
    volumes:
      - /var/lib/nodebyte/game/data:/mnt/server
`;
};
