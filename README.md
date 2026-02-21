# bfast-tools

Command-line tools for local **bfast-functions** development.

Scope: create a local FaaS workspace and serve it locally.

## Install

Prerequisites:
- Node.js 18+
- npm

Install globally:

```bash
npm install -g bfast-tools
```

Verify:

```bash
bfast --version
```

## Quickstart

1. Create a local functions workspace:

```bash
bfast fs create my-functions
cd my-functions
```

2. Run locally:

```bash
bfast fs serve --port 3000
```

You can also run the same flow with `bfast-functions`:

```bash
bfast-functions create my-functions
bfast-functions serve --port 3000
```

## Command Map

- `bfast functions` / `bfast fs`
- `bfast-functions`

Only these commands are available:
- `create`
- `serve`

## Documentation

- [Functions commands](./docs/commands/functions.md)
- [Workspace format](./docs/workspace-format.md)
- [Configuration](./docs/configuration.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Validation scenarios](./docs/validation-scenarios.md)
