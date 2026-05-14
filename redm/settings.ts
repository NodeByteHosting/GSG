import { defineSettings } from "../settings";
import type { SettingsValues } from "../settings";

export const redmSettings = defineSettings({
  cfxVersion: {
    default: "latest",
    help:
      'CFX artifact version to install. Use "recommended", "latest", or a specific build ID such as "1383-e5ea0403". Find builds at runtime.fivem.net/artifacts/fivem/build_proot_linux/master/',
    label: "CFX version",
    maxLength: 50,
    type: "string",
  },
  license: {
    default: "",
    help: "Your CFX server license key from keymaster.fivem.net. Required to start the server.",
    label: "CFX license key",
    required: true,
    type: "string",
  },
  maxPlayers: {
    default: 32,
    label: "Max players",
    max: 32,
    min: 1,
    type: "number",
  },
  serverHostname: {
    default: "My RedM Server",
    help: "The server name shown in the RedM server browser.",
    label: "Server hostname",
    maxLength: 100,
    type: "string",
  },
  steamWebApiKey: {
    default: "none",
    help:
      'Steam Web API key for player identification. Leave as "none" to disable. Get one at steamcommunity.com/dev/apikey.',
    label: "Steam Web API key",
    type: "string",
  },
});

export type RedmSettings = SettingsValues<typeof redmSettings>;
