# `bfast functions` Command Reference

Alias: `bfast fs`

Standalone bin alias: `bfast-functions`

These commands are implemented in `src/functions.cli.mjs`.

## create

Create a new local functions workspace from the built-in template.

```bash
bfast fs create <name>
```

Example:

```bash
bfast fs create demo-faas
```

Name rules:
- allowed characters: letters, numbers, `.`, `-`, `_`
- path separators (`/`, `\`) and traversal (`..`) are rejected
- names starting with `.` are rejected

## serve

Run local development server for your functions.

```bash
bfast fs serve [--port <port>] [--static]
```

Options:
- `--port` default: `3000`
- `--static` disable file-watch restart (single run)

Behavior:
- Without `--static`, starts with `nodemon` (auto restart on file changes).

## Removed Commands

The following cloud/remote features are no longer part of `bfast-tools`:
- `config`
- `deploy`
- `env-add`
- `env-rm`
- `switch-on`
- `switch-off`
