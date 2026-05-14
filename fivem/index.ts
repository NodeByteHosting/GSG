import type { ComposeConfig } from "../compose";
import { resolveSettings } from "../settings";
import { buildFivemCompose, dockerImage } from "./install";
import { fivemSettings } from "./settings";

const buildCompose = (config: ComposeConfig, raw: unknown): string =>
  buildFivemCompose(config, resolveSettings(fivemSettings, raw));

export const fivem = {
  buildCompose,
  description:
    "A multiplayer modification for Grand Theft Auto V, letting you play on custom roleplay, racing, and game-mode servers.",
  dockerImage,
  enabled: true,
  gamedigId: "fivem",
  howToConnect: [
    "Open FiveM and press F8 to open the console, or use the server browser.",
    "In the console, type `connect {address}` to join directly.",
    "Alternatively, search for your server name in the FiveM server list.",
  ],
  id: "fivem",
  image: "/games/fivem.webp",
  name: "FiveM",
  ports: [
    // Game traffic — TCP and UDP.
    {
      from: 30_120,
      protocol: "tcp",
      to: 30_120,
    },
    {
      from: 30_120,
      protocol: "udp",
      to: 30_120,
    },
  ],
  requirements: {
    cpu: 2,
    disk: 20,
    memory: 4,
  },
  settings: fivemSettings,
  usesJoinPassword: false,
} as const;
