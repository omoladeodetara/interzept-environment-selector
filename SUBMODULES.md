# Git Submodules in This Repository

## Overview

This repository uses Git submodules to include external repositories as dependencies. Submodules allow us to keep a reference to specific versions of external code while maintaining clean separation.

## Active Submodules

### `/shadcn-ui` - shadcn/ui Reference Repository

- **URL**: https://github.com/omoladeodetara/ui.git
- **Purpose**: Contains a shadcn/ui reference implementation that serves as inspiration for component development
- **Usage**: The `/ui` directory in this repository contains our custom UI implementation based on shadcn/ui patterns. The submodule provides access to reference shadcn/ui code and patterns for guidance when developing or updating components.

## Working with Submodules

### Cloning This Repository

When cloning this repository, use the `--recurse-submodules` flag to automatically initialize and update submodules:

```bash
git clone --recurse-submodules https://github.com/omoladeodetara/last-price.git
```

### If You Already Cloned Without Submodules

Initialize and update submodules manually:

```bash
cd last-price
git submodule update --init --remote
```

### Updating Submodules

To update submodules to their latest versions:

```bash
# Update all submodules to the latest commit on their tracked branch
git submodule update --remote

# Commit the updated submodule references
git add .
git commit -m "Update submodules to latest versions"
```

### Checking Submodule Status

```bash
# View status of all submodules
git submodule status

# View detailed information
git submodule foreach 'git status'
```

## Directory Structure

```
last-price/
├── ui/              # Our custom UI implementation (actively developed)
│   └── src/
│       └── components/
│           ├── ui/  # shadcn/ui-inspired components
│           └── ...
└── shadcn-ui/       # Submodule: Original shadcn/ui source (reference only)
    ├── apps/
    ├── packages/
    └── ...
```

## Important Notes

- **Do not modify files in `/shadcn-ui`** - This is a read-only reference to the external repository
- **Develop UI components in `/ui`** - This is our working directory for custom components
- The submodule is pinned to a specific commit for stability
- When updating the submodule, review changes carefully before committing the new reference

## Troubleshooting

### Submodule directory is empty

```bash
git submodule update --init --remote
```

### Detached HEAD state in submodule

This is normal for submodules. They are pinned to specific commits rather than tracking branches.

### Submodule conflicts during merge/rebase

```bash
# Accept incoming changes
git checkout --theirs .gitmodules
git submodule update --init --remote

# Or accept current changes
git checkout --ours .gitmodules
git submodule update --init
```

## Learn More

- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
