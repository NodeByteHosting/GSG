import { cs2 } from "./cs2";
import { dontStarveTogether } from "./dontstarvetogether";
import { enshrouded } from "./enshrouded";
import { fivem } from "./fivem";
import { gmod } from "./gmod";
import { hytale } from "./hytale";
import { l4d2 } from "./l4d2";
import { minecraft } from "./minecraft";
import { palworld } from "./palworld";
import { redm } from "./redm";
import { rust } from "./rust";
import { satisfactory } from "./satisfactory";
import { terraria } from "./terraria";
import { valheim } from "./valheim";
import { vrising } from "./vrising";

export { steamHeader } from "./steam";

export const games = [
  cs2,
  minecraft,
  rust,
  l4d2,
  hytale,
  fivem,
  redm,
  gmod,
  terraria,
  palworld,
  satisfactory,
  dontStarveTogether,
  enshrouded,
  valheim,
  vrising,
];

export type Game = (typeof games)[number];

export const getGame = (id: string): Game | undefined =>
  games.find((g) => g.id === id);

export {
  type ComposeConfig,
  type GamePort,
  buildUfwRules,
  GAME_CONTAINER_NAME,
} from "./compose";
export {
  defineSettings,
  getDefaults,
  hasRequiredFields,
  missingRequiredFields,
  resolveSettings,
  type SettingField,
  type SettingsSchema,
  type SettingsValues,
  validateSettings,
} from "./settings";
