import type { ComposeConfig } from "../compose";
import { resolveSettings } from "../settings";
import { buildRedmCompose, dockerImage } from "./install";
import { redmSettings } from "./settings";

const buildCompose = (config: ComposeConfig, raw: unknown): string =>
  buildRedmCompose(config, resolveSettings(redmSettings, raw));

export const redm = {
  buildCompose,
  description:
    "A multiplayer modification for Red Dead Redemption 2, bringing custom roleplay, hunting, and Wild West servers to life.",
  dockerImage,
  enabled: true,
  gamedigId: "redm",
  howToConnect: [
    "Open RedM and press F8 to open the console, or use the server browser.",
    "In the console, type `connect {address}` to join directly.",
    "Alternatively, search for your server name in the RedM server list.",
  ],
  id: "redm",
  image: "/games/redm.png",
  name: "RedM",
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
  settings: redmSettings,
  usesJoinPassword: false,
} as const;
