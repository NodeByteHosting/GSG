import { defineSettings } from "../settings";
import type { SettingsValues } from "../settings";

export const hytaleSettings = defineSettings({
  acceptEarlyPlugins: {
    default: false,
    help: "Loading early plugins is unsupported by Hytale and may cause stability issues.",
    label: "Accept early plugins",
    type: "boolean",
  },
  allowOp: {
    default: false,
    label: "Allow operators",
    type: "boolean",
  },
  authMode: {
    default: "authenticated",
    help: "authenticated requires a valid Hytale account. offline disables account verification. insecure disables all authentication.",
    label: "Authentication mode",
    options: [
      { label: "Authenticated", value: "authenticated" },
      { label: "Offline", value: "offline" },
      { label: "Insecure", value: "insecure" },
    ],
    type: "select",
  },
  disableSentry: {
    default: false,
    help: "Disable Hytale's built-in Sentry crash reporting. Recommended during active plugin development.",
    label: "Disable Sentry",
    type: "boolean",
  },
  maxMemoryMb: {
    default: 2048,
    help: "Maximum heap memory allocated to the Hytale server process in megabytes.",
    label: "Max memory (MB)",
    max: 32_768,
    min: 512,
    type: "number",
  },
  patchline: {
    default: "release",
    help: "The Hytale branch to install. Use pre-release to access the latest development builds.",
    label: "Patchline",
    options: [
      { label: "Release", value: "release" },
      { label: "Pre-release", value: "pre-release" },
    ],
    type: "select",
  },
  useAotCache: {
    default: true,
    help: "Use the pre-trained Ahead-of-Time Java cache to significantly improve server boot times.",
    label: "Use AOT cache",
    type: "boolean",
  },
});

export type HytaleSettings = SettingsValues<typeof hytaleSettings>;
