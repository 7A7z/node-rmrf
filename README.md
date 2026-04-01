# node-rmrf

A simple Bun CLI tool to find and delete `node_modules` folders interactively.

## Installation

```bash
bun install
```

## Usage

### Run directly with Bun

```bash
# Check current directory
bun run index.ts

# Check specific directory
bun run index.ts ./my-project
```

### Install globally

```bash
bun install -g .

# Then use it anywhere
node-rmrf ./my-project
nmrmrf ./my-project
```

## How it works

1. The tool accepts an optional directory path (defaults to current directory)
2. It checks if the directory exists and contains a `node_modules` folder
3. If found, it asks for confirmation before deletion
4. Type `yes` or `y` to delete, anything else to cancel

## Example

```bash
$ bun run index.ts ./my-project
Scanning: C:\Users\User\my-project
Found node_modules at C:\Users\User\my-project\node_modules
Delete it? (yes/no): yes
Deleted: C:\Users\User\my-project\node_modules
```

## License

MIT
