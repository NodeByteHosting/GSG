import { defineSettings } from "../settings";
import type { SettingsValues } from "../settings";

export const minecraftSettings = defineSettings({
  dockerImage: {
    default: "ghcr.io/pterodactyl/yolks:java_25",
    label: "Docker Image",
    options: [
      { value: "ghcr.io/pterodactyl/yolks:java_25" },
      { value: "ghcr.io/pterodactyl/yolks:java_22" },
      { value: "ghcr.io/pterodactyl/yolks:java_21" },
      { value: "ghcr.io/pterodactyl/yolks:java_17" },
      { value: "ghcr.io/pterodactyl/yolks:java_16" },
      { value: "ghcr.io/pterodactyl/yolks:java_11" },
      { value: "ghcr.io/pterodactyl/yolks:java_8" },
    ],
    type: "select",
  },
  allowNether: {
    default: true,
    label: "Allow Nether",
    type: "boolean",
  },
  difficulty: {
    default: "normal",
    label: "Difficulty",
    options: [
      { value: "peaceful" },
      { value: "easy" },
      { value: "normal" },
      { value: "hard" },
    ],
    type: "select",
  },
  enableCommandBlock: {
    default: true,
    label: "Enable command blocks",
    type: "boolean",
  },
  maxPlayers: {
    default: 20,
    label: "Max players",
    max: 100,
    min: 1,
    type: "number",
  },
  minecraftVersion: {
    default: "LATEST",
    help:
      "Minecraft version to run, e.g. 1.21.4. Leave as LATEST to always use the newest release.",
    label: "Minecraft version",
    placeholder: "LATEST",
    type: "string",
  },
  mode: {
    default: "survival",
    label: "Game mode",
    options: [
      { value: "survival" },
      { value: "creative" },
      { value: "adventure" },
      { value: "spectator" },
    ],
    type: "select",
  },
  onlineMode: {
    default: true,
    help: "Require a valid Mojang account to join. Disable to allow cracked clients.",
    label: "Online mode",
    type: "boolean",
  },
  pvp: {
    default: true,
    label: "PvP",
    type: "boolean",
  },
  serverType: {
    default: "PAPER",
    help:
      "Server software. Paper is recommended for plugins. Fabric/Forge for mods. Magma for both.",
    label: "Server type",
    options: [
      { label: "Vanilla", value: "VANILLA" },
      { label: "Paper", value: "PAPER" },
      { label: "Spigot", value: "SPIGOT" },
      { label: "Fabric", value: "FABRIC" },
      { label: "Forge", value: "FORGE" },
      { label: "NeoForge", value: "NEOFORGE" },
      { label: "Quilt", value: "QUILT" },
      { label: "Magma (Forge + Bukkit)", value: "MAGMA" },
      { label: "CurseForge", value: "CURSEFORGE" },
    ],
    type: "select",
  },
  spawnProtection: {
    default: 0,
    label: "Spawn protection radius",
    max: 64,
    min: 0,
    type: "number",
  },
  viewDistance: {
    default: 10,
    help: "Chunks rendered around each player. Higher values increase CPU load.",
    label: "View distance",
    max: 32,
    min: 3,
    type: "number",
  },
});

export type MinecraftSettings = SettingsValues<typeof minecraftSettings>;
