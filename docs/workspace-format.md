# Workspace Format

`bfast fs create <name>` creates a project scaffold from `src/res/backend`.

## Generated structure

```text
<workspace>/
  bfast.json
  package.json
  functions/
    index.mjs
```

## `bfast.json`

Default content:

```json
{
  "ignore": [
    "**/node_modules/**",
    "**/specs/**",
    "**/*.specs.js",
    "**/*.specs.mjs"
  ]
}
```

Fields:
- `ignore`: glob patterns for function discovery ignore behavior.

## Function Authoring Starter

The template includes descriptor exports in `functions/index.mjs` for:
- HTTP request handlers
- Socket event handlers
- Guards (middleware)
- Scheduled jobs

Each descriptor includes a `created` metadata field.
