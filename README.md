# node-rmrf

A simple Bun CLI tool that helps you clean up old `node_modules` folders from multiple projects at once.

## What it does

Run `node-rmrf` or `nmrmrf` in the main folder where you keep all your project folders. It will:

- Scan up to **10 directory levels deep** to find all `node_modules` folders
- Present them in an interactive list for you to select
- Delete only the ones you choose

Perfect for reclaiming disk space from old projects or dependencies you no longer need.

## Installation

```bash
bun install -g @7a7z_/node-rmrf
```

## Usage

```bash
# Run in current directory
node-rmrf
nmrmrf
# Run in a specific directory
node-rmrf ./my-projects
nmrmrf ./my-projects
```

## Example

```bash
$ node-rmrf
Scanning: C:\Users\User\projects
Found 5 node_modules folders:

[ ] ./project-a/node_modules        (245 MB)
[x] ./project-b/node_modules        (1.2 GB)
[x] ./old-project/node_modules      (890 MB)
[ ] ./current-project/node_modules  (156 MB)
[x] ./test/node_modules             (45 MB)

Delete 3 selected folders? (yes/no): yes

Deleting...
✓ Deleted: ./project-b/node_modules (1.2 GB freed)
✓ Deleted: ./old-project/node_modules (890 MB freed)
✓ Deleted: ./test/node_modules (45 MB freed)

Total freed: 2.14 GB
```

## Requirements

- [Bun](https://bun.sh) runtime

## License

MIT
