import type { ComposeConfig } from "../compose";
import { resolveSettings } from "../settings";
import { steamHeader } from "../steam";
import { buildGmodCompose, dockerImage } from "./install";
import { gmodSettings } from "./settings";

const buildCompose = (config: ComposeConfig, raw: unknown): string =>
  buildGmodCompose(config, resolveSettings(gmodSettings, raw));

export const gmod = {
  buildCompose,
  description:
    "The ultimate sandbox game. Build contraptions, play custom gamemodes, or just mess around with the physics engine.",
  dockerImage,
  enabled: true,
  gamedigId: "garrysmod",
  howToConnect: [
    "Open Garry's Mod and go to the Multiplayer menu.",
    'Click "Legacy Browser" or use the console command `connect {address}`.',
    "If a password is set, enter it when prompted.",
  ],
  id: "gmod",
  image: steamHeader(4000),
  name: "Garry's Mod",
  ports: [
    // Game traffic.
    {
      from: 27_015,
      protocol: "udp",
      to: 27_015,
    },
    // RCON / TCP query.
    {
      from: 27_015,
      protocol: "tcp",
      to: 27_015,
    },
    // Client port.
    {
      from: 27_005,
      protocol: "udp",
      to: 27_005,
    },
  ],
  requirements: {
    cpu: 2,
    disk: 15,
    memory: 2,
  },
  settings: gmodSettings,
  usesJoinPassword: true,
} as const;
