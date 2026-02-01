# CLAUDE.md - AI Assistant Guidelines

This document provides essential information for AI assistants working with this codebase.

## Repository Overview

**Repository**: Claude_Test
**Master Branch**: `main` (production-ready code)
**Default Branch**: `develop` (development integration branch)
**Last Updated**: 2026-02-01

### Project Description

Learning web application built with Vite + React. This repository follows a Git Flow branching strategy.

## Project Structure

```
Claude_Test/
├── CLAUDE.md          # This file - AI assistant guidelines
└── .git/              # Git repository metadata
```

> **Note**: Update this section as the project structure grows.

## Development Setup

### Prerequisites

<!-- Update with actual prerequisites when project is initialized -->
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Claude_Test

# Install dependencies (update based on project type)
# npm install      # for Node.js projects
# pip install -r requirements.txt  # for Python projects
```

### Running the Project

<!-- Update with actual commands -->
```bash
# Add run commands here as the project develops
```

## Development Workflow

### Branching Strategy (Git Flow)

This repository uses a Git Flow branching strategy:

```
main (master)          <- Production-ready code (protected)
  │
  └── develop          <- Development integration branch (default)
        │
        ├── feature/*  <- New features
        ├── fix/*      <- Bug fixes
        └── docs/*     <- Documentation updates
```

#### Branch Descriptions

| Branch | Purpose | Base Branch | Merge Target |
|--------|---------|-------------|--------------|
| `main` | Production-ready, stable code | - | - |
| `develop` | Integration branch for development | `main` | `main` |
| `feature/*` | New feature development | `develop` | `develop` |
| `fix/*` | Bug fixes | `develop` | `develop` |
| `docs/*` | Documentation updates | `develop` | `develop` |
| `claude/*` | Claude AI session branches | `develop` | `develop` |

### Branch Naming Convention

- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- Documentation: `docs/<description>`
- Hotfixes: `hotfix/<description>` (branch from `main`, merge to both `main` and `develop`)
- Claude AI branches: `claude/<session-id>`

### Commit Message Format

Follow conventional commits:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

#### For Feature/Fix branches -> develop

1. Create a feature branch from `develop`
2. Make changes and commit with descriptive messages
3. Push branch and create a pull request to `develop`
4. Ensure all checks pass
5. Request review if required
6. Merge after approval

#### For develop -> main (Release)

1. Ensure `develop` is stable and ready for release
2. Create a pull request from `develop` to `main`
3. **Required**: At least one reviewer approval
4. Merge after approval (creates a release)

## Code Conventions

### General Guidelines

- Write clear, self-documenting code
- Keep functions small and focused
- Add comments for complex logic only
- Follow the principle of least surprise

### File Organization

<!-- Update based on project language/framework -->
- Group related files together
- Use meaningful file and directory names
- Keep test files close to source files

## Testing

### Running Tests

<!-- Update with actual test commands -->
```bash
# Add test commands here
# npm test
# pytest
# go test ./...
```

### Test Coverage

- Aim for meaningful test coverage
- Test critical paths and edge cases
- Include both unit and integration tests where appropriate

## Build and Deployment

### Building

<!-- Update with build commands -->
```bash
# Add build commands here
```

### Deployment

<!-- Update with deployment process -->
- Document deployment targets
- Include environment-specific configurations

## Important Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | AI assistant guidelines (this file) |
<!-- Add more files as project grows -->

## Key Dependencies

<!-- Update when dependencies are added -->
| Dependency | Purpose | Version |
|------------|---------|---------|
| - | - | - |

## Common Tasks for AI Assistants

### When Adding New Features

1. Understand the existing code structure
2. Follow established patterns and conventions
3. Write tests for new functionality
4. Update documentation as needed
5. Create descriptive commit messages

### When Fixing Bugs

1. Reproduce the issue first
2. Identify the root cause
3. Write a test that catches the bug
4. Implement the fix
5. Verify the fix resolves the issue

### When Refactoring

1. Ensure tests exist before refactoring
2. Make incremental changes
3. Run tests after each change
4. Keep commits atomic and focused

## Environment Variables

<!-- Update with actual environment variables -->
| Variable | Description | Required |
|----------|-------------|----------|
| - | - | - |

## GitHub Repository Settings

### Required Setup (Manual Configuration)

The following settings must be configured in GitHub repository settings:

#### 1. Create `develop` Branch

```bash
# From the repository root
git checkout main
git checkout -b develop
git push -u origin develop
```

#### 2. Set Default Branch to `develop`

1. Go to **Settings** > **General** > **Default branch**
2. Click the switch button next to the current default branch
3. Select `develop` from the dropdown
4. Click **Update**
5. Confirm the change

#### 3. Configure Branch Protection Rules

##### For `main` branch (Required):

1. Go to **Settings** > **Branches** > **Add branch protection rule**
2. Branch name pattern: `main`
3. Enable the following:
   - [x] **Require a pull request before merging**
     - [x] Require approvals: **1** (minimum)
     - [x] Dismiss stale pull request approvals when new commits are pushed
   - [x] **Require status checks to pass before merging** (if CI is configured)
   - [x] **Do not allow bypassing the above settings**
4. Click **Create** / **Save changes**

##### For `develop` branch (Recommended):

1. Go to **Settings** > **Branches** > **Add branch protection rule**
2. Branch name pattern: `develop`
3. Enable the following:
   - [x] **Require a pull request before merging**
   - [x] **Require status checks to pass before merging** (if CI is configured)
4. Click **Create** / **Save changes**

### Branch Protection Summary

| Branch | Approval Required | Direct Push | Delete Allowed |
|--------|-------------------|-------------|----------------|
| `main` | Yes (1+) | No | No |
| `develop` | Optional | No | No |
| `feature/*` | No | Yes | Yes |

## Troubleshooting

### Common Issues

<!-- Add common issues and solutions as they arise -->

## Additional Resources

- [Project Documentation](#) <!-- Update with actual links -->
- [Contributing Guidelines](#)
- [Code of Conduct](#)

---

## Notes for AI Assistants

### Do's

- Read existing code before making changes
- Follow the established patterns in the codebase
- Write clear commit messages
- Test changes before committing
- Ask for clarification when requirements are unclear

### Don'ts

- Don't introduce breaking changes without discussion
- Don't add unnecessary dependencies
- Don't ignore existing conventions
- Don't skip tests for "simple" changes
- Don't over-engineer solutions

### Context-Specific Instructions

When working on this repository:

1. **Check the current branch** before making changes
2. **Always branch from `develop`** for new features and fixes (not from `main`)
3. **Create PRs to `develop`** unless it's a hotfix
4. **Review recent commits** to understand ongoing work
5. **Run existing tests** to ensure baseline functionality
6. **Update this CLAUDE.md** when significant changes are made to the project structure or conventions
7. **Never push directly to `main`** - always use a pull request with approval

---

*This document should be kept up-to-date as the project evolves. Last reviewed: 2026-02-01*
