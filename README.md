# NodeByte Game Recipes

This directory contains game server configuration recipes think of them as templates or profiles for each supported game. Each recipe defines how to provision, configure, and run a specific game server.

## Structure

Each game gets its own subdirectory with:

```
games/
├── minecraft/
│   ├── index.ts          # Game definition & metadata
│   ├── install.ts        # Docker image & installation setup
│   └── settings.ts       # User-configurable settings schema
├── rust/
│   ├── index.ts
│   ├── install.ts
│   └── settings.ts
└── ...
```

## Root Files

- **`index.ts`** — Exports the array of all supported games and helper functions (`getGame`, `getDefaults`, etc.)
- **`settings.ts`** — Type definitions and utilities for game settings (shared schema logic)
- **`compose.ts`** — Docker Compose builder utilities (UFW rules, port mapping, container names)
- **`steam.ts`** — SteamCMD integration for games that require Steam

## Local Quality Commands

The games repo can be validated standalone (no dependency on the main GSM repo tooling).

```bash
npm run fmt:check
npm run lint
npm run validate:recipes
npm run typecheck
```

Or run all checks in one command:

```bash
npm run ci
```

## Adding a New Game

### 1. Create the game directory

```bash
mkdir games/yourserver
cd games/yourserver
```

### 2. Create `index.ts`

This is the game definition. It exports a constant object with metadata, ports, resource requirements, and settings:

```typescript
import type { ComposeConfig } from "../compose";
import { resolveSettings } from "../settings";
import { buildYourServerCompose, dockerImage } from "./install";
import { yourServerSettings } from "./settings";

const buildCompose = (config: ComposeConfig, raw: unknown): string =>
  buildYourServerCompose(config, resolveSettings(yourServerSettings, raw));

export const yourserver = {
  // Required metadata
  id: "yourserver", // Unique slug used in URLs/APIs
  name: "Your Server", // Display name
  description: "Your server desc", // Marketing text
  enabled: true, // Toggle visibility in UI

  // Game identification
  gamedigId: "yourserver", // GameDig protocol ID for status checks
  image: "/games/yourserver.png", // UI icon (200x200px PNG)

  // Docker & compose
  buildCompose, // Function to generate docker-compose.yml
  dockerImage, // Base container image reference

  // Network ports exposed to players
  ports: [
    {
      from: 25_565, // Container internal port
      to: 25_565, // External listening port
      protocol: "tcp", // "tcp" or "udp"
    },
    // Add more ports as needed
  ],

  // Minimum host requirements
  requirements: {
    cpu: 2, // vCPU count
    memory: 8, // GB
    disk: 10, // GB
  },

  // Settings UI schema
  settings: yourServerSettings,

  // Auth behavior
  usesJoinPassword: false, // Does the game require a join password?
} as const;
```

### 3. Create `settings.ts`

Define user-configurable settings via Zod schema. Settings appear in the UI and are passed to the server container:

```typescript
import { defineSettings } from "../settings";

export const yourServerSettings = defineSettings({
  server_name: {
    type: "string",
    label: "Server Name",
    help: "Displayed in server browser",
    default: "Your Server",
    maxLength: 32,
  },
  difficulty: {
    type: "select",
    label: "Difficulty",
    default: "normal",
    options: [
      { value: "easy", label: "Easy" },
      { value: "normal", label: "Normal" },
      { value: "hard", label: "Hard" },
    ],
  },
  max_players: {
    type: "number",
    label: "Max Players",
    default: 32,
    min: 1,
    max: 128,
  },
  enable_pvp: {
    type: "boolean",
    label: "Enable PvP",
    default: true,
  },
});
```

Field types:

- `string` — Text input with optional `maxLength`
- `number` — Numeric input with optional `min`/`max`/`step`
- `boolean` — Toggle checkbox
- `select` — Dropdown with fixed options

Every field must have a `default` value.

### 4. Create `install.ts`

Define Docker image and build the `docker-compose.yml` for that game:

```typescript
import type { ComposeConfig } from "../compose";
import type { SettingsValues } from "../settings";
import { yourServerSettings } from "./settings";

export const dockerImage = "steamcmd/proton:latest";

export const buildYourServerCompose = (
  config: ComposeConfig,
  settings: SettingsValues<typeof yourServerSettings>
): string => {
  // Destructure settings passed from user
  const { server_name, difficulty, max_players } = settings;

  // Build environment variables
  const env = [
    `SERVER_NAME=${server_name}`,
    `DIFFICULTY=${difficulty}`,
    `MAX_PLAYERS=${max_players}`,
  ];

  // Return docker-compose YAML as a string
  return `
version: '3'
services:
  yourserver:
    image: ${dockerImage}
    container_name: ${config.containerName}
    environment:
${env.map((e) => `      - ${e}`).join("\n")}
    ports:
${config.ports.map((p) => `      - "${p.hostPort}:${p.containerPort}/${p.protocol}"`).join("\n")}
    volumes:
      - ${config.serverDir}:/data
    restart: unless-stopped
  `.trim();
};
```

## Key Integration Points

### 1. Adding to the Games Export

Once your game is ready, add it to `games/index.ts`:

```typescript
import { yourserver } from "./yourserver";

export const games = [
  minecraft,
  rust,
  yourserver, // ← Add here
  // ...
];
```

### 2. Docker Image Sources

Common sources for game server images:

- **Official**: `steamcmd/proton:latest`, `ubuntu:22.04` + manual install
- **Community**: DockerHub (`cm2network/csgo`, `itzg/minecraft-server`)
- **GameServers.com**: Pre-built images for managed games

### 3. SteamCMD Integration

For Steam-based games, use the `steam.ts` helpers:

```typescript
import { buildSteamCmdInstall } from "../steam";

export const buildYourServerCompose = (
  config: ComposeConfig,
  settings: SettingsValues<typeof yourServerSettings>
) => {
  const steamCmd = buildSteamCmdInstall({
    appId: 232330, // Steam App ID
    validateFiles: true,
  });

  return `
version: '3'
services:
  yourserver:
    image: steamcmd/proton:latest
    container_name: ${config.containerName}
    environment:
      - STEAM_APP_ID=232330
    command: ${steamCmd}
    # ...
  `.trim();
};
```

### 4. Port Mapping

The `ports` array defines what the player connects to:

```typescript
ports: [
  { from: 7777, to: 7777, protocol: "udp" },  // Game port
  { from: 27015, to: 27015, protocol: "udp" }, // Query port
],
```

Game ports must match what the container expects.

### 5. Docker Image Assets

Place game icons at:

```
public/games/yourserver.png    (200×200 PNG, max 50KB)
```

These are referenced in `index.ts` via `image: "/games/yourserver.png"`.

## Testing Your Recipe

### 1. Type checking

```bash
bun run types
```

### 2. Validating settings

Test your settings schema:

```typescript
import { resolveSettings } from "@/games/settings";
import { yourServerSettings } from "@/games/yourserver/settings";

const settings = resolveSettings(yourServerSettings, {
  server_name: "Test",
  difficulty: "hard",
  max_players: 64,
});
```

### 3. Build locally

Generate and validate the docker-compose output:

```bash
# In your app code, call buildCompose with mock ComposeConfig
const compose = buildYourServerCompose(
  {
    containerName: "test-yourserver",
    ports: [{ containerPort: 7777, hostPort: 7777, protocol: "udp" }],
    serverDir: "/data",
  },
  { server_name: "Test", difficulty: "normal", max_players: 32 }
);
console.log(compose);
```

## Resources

### Docker Image Inspiration

- [Awesome GameServers](https://github.com/topics/game-server-docker)
- [LinuxGSM](https://linuxgsm.com/) — Install scripts for many games
- [GameServers Dockerfiles](https://github.com/GameServers/Dockerfiles)

### GameDig IDs

GameDig is used for server status queries. Find supported game protocols:

- [GameDig Supported Games](https://github.com/gamedig/node-gamedig#games-list)
- Common IDs: `minecraft`, `rust`, `csgo`, `valheim`, `palworld`

### Docker Compose Reference

- [Official Docker Compose Spec](https://docs.docker.com/compose/compose-file/)

## Example: Minimal Recipe

Here's a minimal but complete recipe template:

**`games/example/index.ts`:**

```typescript
import type { ComposeConfig } from "../compose";
import { resolveSettings } from "../settings";
import { buildExampleCompose, dockerImage } from "./install";
import { exampleSettings } from "./settings";

const buildCompose = (config: ComposeConfig, raw: unknown): string =>
  buildExampleCompose(config, resolveSettings(exampleSettings, raw));

export const example = {
  buildCompose,
  description: "Example server",
  dockerImage,
  enabled: true,
  gamedigId: "example",
  id: "example",
  image: "/games/example.png",
  name: "Example",
  ports: [{ from: 7777, protocol: "udp", to: 7777 }],
  requirements: { cpu: 1, disk: 5, memory: 2 },
  settings: exampleSettings,
  usesJoinPassword: false,
} as const;
```

**`games/example/settings.ts`:**

```typescript
import { defineSettings } from "../settings";

export const exampleSettings = defineSettings({
  name: {
    type: "string",
    label: "Server Name",
    default: "My Server",
  },
});
```

**`games/example/install.ts`:**

```typescript
import type { ComposeConfig } from "../compose";
import type { SettingsValues } from "../settings";
import { exampleSettings } from "./settings";

export const dockerImage = "example/server:latest";

export const buildExampleCompose = (
  config: ComposeConfig,
  settings: SettingsValues<typeof exampleSettings>
): string => {
  return `
version: '3'
services:
  example:
    image: ${dockerImage}
    container_name: ${config.containerName}
    environment:
      - SERVER_NAME=${settings.name}
    ports:
      - "${config.ports[0]?.hostPort}:7777/udp"
    volumes:
      - ${config.serverDir}:/data
    restart: unless-stopped
  `.trim();
};
```

Then add to `games/index.ts`:

```typescript
import { example } from "./example";

export const games = [
  // ...
  example,
];
```

---

## Questions?

For implementation help or to discuss recipes:

- Community: https://discord.gg/nodebyte
- Maintainer: oss@nodebyte.co.uk
