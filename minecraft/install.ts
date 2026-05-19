import type { ComposeConfig } from "../compose";
import { escapeComposeValue } from "../compose";
import type { MinecraftSettings } from "./settings";

export const dockerImage = {
  "Java 25": "ghcr.io/pterodactyl/yolks:java_25",
  "Java 22": "ghcr.io/pterodactyl/yolks:java_22",
  "Java 21": "ghcr.io/pterodactyl/yolks:java_21",
  "Java 17": "ghcr.io/pterodactyl/yolks:java_17",
  "Java 16": "ghcr.io/pterodactyl/yolks:java_16",
  "Java 11": "ghcr.io/pterodactyl/yolks:java_11",
  "Java 8": "ghcr.io/pterodactyl/yolks:java_8"
};

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
      - /var/lib/nodebyte/game/data:/data
    restart: unless-stopped
`;
  // Note: CurseForge packs require CURSEFORGE_FILES or CF_API_KEY env vars.
  // Modpack-specific settings can be added as additional string fields if needed.
};
