import { defineSettings } from "../settings";
import type { SettingsValues } from "../settings";

export const gmodSettings = defineSettings({
  gamemode: {
    default: "sandbox",
    help: "The gamemode to start the server with.",
    label: "Gamemode",
    options: [
      { label: "Sandbox", value: "sandbox" },
      { label: "DarkRP", value: "darkrp" },
      { label: "TTT (Trouble in Terrorist Town)", value: "terrortown" },
      { label: "Prophunt", value: "prop_hunt" },
      { label: "Deathrun", value: "deathrun" },
      { label: "Murder", value: "murder" },
    ],
    type: "select",
  },
  luaRefresh: {
    default: false,
    help:
      "Enables Lua auto-refresh. Useful for development but has a performance impact in production.",
    label: "Lua auto-refresh",
    type: "boolean",
  },
  map: {
    default: "gm_flatgrass",
    help: "The map to load on server start.",
    label: "Starting map",
    options: [
      { label: "Flatgrass", value: "gm_flatgrass" },
      { label: "Construct", value: "gm_construct" },
      { label: "Big City", value: "gm_bigcity" },
      { label: "Fork", value: "gm_fork" },
      { label: "Excess", value: "gm_excess_island" },
    ],
    type: "select",
  },
  maxPlayers: {
    default: 32,
    label: "Max players",
    max: 128,
    min: 2,
    type: "number",
  },
  steamToken: {
    default: "",
    help:
      "Steam Game Server Login Token (GSLT). Required for public servers — get one at steamcommunity.com/dev/managegameservers (App ID 4000).",
    label: "Steam GSLT",
    maxLength: 64,
    type: "string",
  },
  tickrate: {
    default: 22,
    help: "Server tick rate. Higher values improve smoothness at the cost of CPU and bandwidth.",
    label: "Tick rate",
    max: 100,
    min: 10,
    type: "number",
  },
  workshopId: {
    default: "",
    help:
      "Steam Workshop collection ID to automatically download addons from. Leave blank to disable.",
    label: "Workshop collection ID",
    type: "string",
  },
});

export type GmodSettings = SettingsValues<typeof gmodSettings>;
