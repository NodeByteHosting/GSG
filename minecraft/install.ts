import type { ComposeConfig } from "../compose";
import { escapeComposeValue } from "../compose";
import type { MinecraftSettings } from "./settings";

export const dockerImage = "ghcr.io/nodebytehosting/games:minecraft-dev";

export const buildMinecraftCompose = (
  config: ComposeConfig,
  settings: MinecraftSettings,
): string => {
  const timezone = config.timezone ?? "UTC";
  const escape = escapeComposeValue;
  const version = (settings.minecraftVersion || "LATEST").trim().toUpperCase();
  const type = settings.serverType || "PAPER";

  return `services:
  minecraft:
    image: ${dockerImage}
    container_name: nodebyte-game
    ports:
      - "25565:25565"
    environment:
      EULA: "TRUE"
      TYPE: "${type}"
      VERSION: "${version}"
      JAVA_VERSION: "${settings.javaVersion}"
      SERVER_NAME: "${escape(config.name)}"
      MOTD: "${escape(config.name)} - Powered by NodeByte"
      DIFFICULTY: "${settings.difficulty}"
      MODE: "${settings.mode}"
      MEMORY: "6G"
      TZ: "${timezone}"
      ENABLE_RCON: "true"
      RCON_PASSWORD: "${escape(config.rconPassword)}"
      OVERRIDE_SERVER_PROPERTIES: "true"
      ENABLE_COMMAND_BLOCK: "${settings.enableCommandBlock}"
      SPAWN_PROTECTION: "${settings.spawnProtection}"
      MAX_PLAYERS: "${settings.maxPlayers}"
      ALLOW_NETHER: "${settings.allowNether}"
      ONLINE_MODE: "${settings.onlineMode}"
      PVP: "${settings.pvp}"
      VIEW_DISTANCE: "${settings.viewDistance}"
    volumes:
      - /var/lib/nodebyte/game/data:/var/lib/nodebyte/game/data
    restart: unless-stopped
`;
  // Note: CurseForge packs require CURSEFORGE_FILES or CF_API_KEY env vars.
  // Modpack-specific settings can be added as additional string fields if needed.
};