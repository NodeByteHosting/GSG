import { defineSettings } from "../settings";
import type { SettingsValues } from "../settings";

export const fivemSettings = defineSettings({
  enableTxAdmin: {
    default: false,
    help: "Enables the txAdmin web panel. Your server will not go online until it is started from txAdmin on first run. Exposes port 40120 for the txAdmin UI.",
    label: "Enable txAdmin",
    type: "boolean",
  },
  fivemVersion: {
    default: "recommended",
    help: 'FiveM artifact version to install. Use "recommended", "latest", or a specific build ID such as "6013-d8ae399d". Find builds at runtime.fivem.net/artifacts/fivem/build_proot_linux/master/',
    label: "FiveM version",
    maxLength: 50,
    type: "string",
  },
  license: {
    default: "",
    help: "Your FiveM server license key from portal.cfx.re (keymaster.fivem.net). Required to start the server.",
    label: "FiveM license key",
    maxLength: 33,
    required: true,
    type: "string",
  },
  maxPlayers: {
    default: 48,
    label: "Max players",
    max: 48,
    min: 1,
    type: "number",
  },
  serverHostname: {
    default: "My FiveM Server",
    help: "The server name shown in the FiveM server browser.",
    label: "Server hostname",
    maxLength: 100,
    type: "string",
  },
  steamWebApiKey: {
    default: "none",
    help: 'Steam Web API key for player identification. Leave as "none" to disable. Get one at steamcommunity.com/dev/apikey.',
    label: "Steam Web API key",
    type: "string",
  },
});

export type FivemSettings = SettingsValues<typeof fivemSettings>;
