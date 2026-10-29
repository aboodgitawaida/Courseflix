# Contributing

CourseFlix is a solo project, but it is run like a team one. This is the workflow.

## Setup

```bash
npm ci
cp .env.example .env      # fill in the Supabase values
npm run hooks:install     # enables the commit-message check below
npm run dev
```

## Before you push

```bash
npm run check   # typecheck, lint, formatting and unit tests, the same as CI
```

CI runs the same steps plus a production build on every pull request.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <what changed, in the imperative>
```

| Type       | Use it for                                     |
| ---------- | ---------------------------------------------- |
| `feat`     | Something new for students                     |
| `fix`      | A bug fix                                      |
| `perf`     | Faster or lighter, same behaviour              |
| `refactor` | Code change with no behaviour change           |
| `test`     | Adding or fixing tests                         |
| `docs`     | README, docs and comments                      |
| `build`    | Dependencies, bundling                         |
| `ci`       | GitHub Actions                                 |
| `chore`    | Everything else (data refreshes, config, tidy) |

Examples: `feat(eagle): power up on gold courses`, `fix(auth): reject redirect targets with control characters`.

Scopes in use: `eagle`, `auth`, `reviews`, `shortlist`, `friends`, `catalog`, `db`, `ui`.

## Pull requests

- One topic per PR, with a title in the same format as a commit message.
- Prefer **squash merging**, so `main` gets one clean, conventional commit per PR.
- Database changes follow the rules in [CLAUDE.md](CLAUDE.md): migrations only add things,
  and nothing removes or rewrites real students' data.
