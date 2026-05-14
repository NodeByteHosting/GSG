import type { ComposeConfig } from "../compose";
import { escapeComposeValue } from "../compose";
import type { GmodSettings } from "./settings";

export const dockerImage = "ich777/garrysmod:latest";

export const buildGmodCompose = (
  config: ComposeConfig,
  settings: GmodSettings
): string => {
  const timezone = config.timezone ?? "UTC";
  const escape = escapeComposeValue;
  return `services:
  gmod:
    image: ${dockerImage}
    container_name: nodebyte-game
    restart: unless-stopped
    ports:
      - "27015:27015/udp"
      - "27015:27015/tcp"
      - "27005:27005/udp"
    environment:
      TZ: "${timezone}"
      GAME_PORT: "27015"
      STEAM_TOKEN: "${escape(settings.steamToken)}"
      MAXPLAYERS: "${settings.maxPlayers}"
      MAP: "${escape(settings.map)}"
      GAMEMODE: "${escape(settings.gamemode)}"
      WORKSHOPCOLLECTION: "${escape(settings.workshopId)}"
      TICKRATE: "${settings.tickrate}"
      LUA_REFRESH: "${settings.luaRefresh ? "1" : "0"}"
    volumes:
      - /var/lib/nodebyte/game/data:/serverdata/serverfiles
`;
};
