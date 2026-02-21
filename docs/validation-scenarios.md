# Validation Scenarios (Docs QA)

Use these to confirm the documentation is actionable.

## Scenario 1: New Local Workspace

1. `npm install -g bfast-tools`
2. `bfast fs create docs-smoke`
3. `cd docs-smoke`
4. `bfast fs serve --port 3000`
5. call function/health endpoint

Expected:
- local engine starts
- endpoints respond

## Scenario 2: Static Mode

1. `bfast fs create docs-static`
2. `cd docs-static`
3. `bfast fs serve --static --port 3001`

Expected:
- server starts once
- no watcher restart logs

## Scenario 3: Failure Path Coverage

- run `bfast fs serve` outside workspace -> `bfast.json is missing`
- remove `functions/` and run serve -> `functions folder not found`
- break JSON syntax in `bfast.json` -> `bfast.json is invalid JSON`
