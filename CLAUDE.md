# CLAUDE.md - AI Assistant Guidelines

This document provides essential information for AI assistants working with this codebase.

## Repository Overview

**Repository**: Claude_Test
**Status**: New/Empty Repository
**Primary Branch**: `main` (or as configured)
**Last Updated**: 2026-02-01

### Project Description

This repository is currently in its initial state with no code committed yet. This CLAUDE.md file serves as the foundational documentation that should be updated as the project develops.

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

### Branch Naming Convention

- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- Documentation: `docs/<description>`
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

1. Create a feature branch from `main`
2. Make changes and commit with descriptive messages
3. Push branch and create a pull request
4. Ensure all checks pass
5. Request review if required
6. Merge after approval

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
2. **Review recent commits** to understand ongoing work
3. **Run existing tests** to ensure baseline functionality
4. **Update this CLAUDE.md** when significant changes are made to the project structure or conventions

---

*This document should be kept up-to-date as the project evolves. Last reviewed: 2026-02-01*
