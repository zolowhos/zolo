# Vibe Coding Bible

A guide for AI-assisted development: spend less of your time and money arguing with a computer :sob:


```
 __________/ Index \__________
 1) Requirements
 2) Basics on how to prompt
 3) Advanced ways to prompt
 4) How to use tools/commands
 5) Resources to use
 6) Pre defined prompts
 7) Examples
 8) Files & sources
 _____________________________
```

---

## 1) Requirements

You do not need every tool right now, eventually you will start to use these.

### Hardware / software

- A decent machine 
- A brain
- [Git](https://git-scm.com/install/windows) / [GitHub](https://github.com/)
- [GitHub CLI (`gh`)](https://cli.github.com/) if you ship to GitHub (repos, PRs, Pages)
- A AI-IDE [Cursor](https://cursor.com) is the default for this guide

### Accounts worth having

| Tool | Why you care |
|------|----------------|
| [Cursor](https://cursor.com) | Editor + Agent + rules + MCP |
| [Context7](https://context7.com) | Live library docs inside the model (optional API key for higher limits) |
| [Codex](https://github.com/openai/codex) | AI-IDE similar to cursor |
| [Claude Code](https://code.claude.com/docs/en) | AI-IDE similar to cursor not recommended |
| [OpenCode](https://opencode.ai/) or [Ollama](https://ollama.com/) | Free / local path when you do not want paid API bills |
| [GitHub CLI](https://cli.github.com/) | Create repos, PRs, issues, Pages from the terminal |

If your broke but still want to vibe code, I recommend just using open code and if thats not enough get cursor for 10$.

### Mentality

Treat ai like a terry davis ~ zolo

3 Habits: 

1. Know the goal in one sentence
2. Know which files matter
3. Know what "done" looks like 


### Before you open the agent (product first)

1. **Write the vision down.** Vague input = vague app. Sketch product goals and user flows before code. If planning is hard dont fucking vibe code :sob:
2. **Learn how to use git.** please for the love of god this will save you so much time I promise, AI makes tons of mistakes and those can completly ruin your codebase. trust me ik.
4. **Prefer a popular stack.** Models write better code for stacks they have seen a lot. A common starter: Next.js + Supabase + Tailwind + Vercel. Obscure stacks mean more hallucinations and more Context7.

---

## 2) The basics

### How systematic prompts work

Put hard constraints first. Models weight the start and end of context.

```
Context: Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui
Task: Add a /pricing page with monthly/yearly toggle
Constraints:
- Match existing layout in app/(marketing)/
- No new dependencies
- Mobile first
Done when: npm run build passes and the toggle updates prices without a full reload
```

### Rules of thumb

- One job per message. "Build auth and redesign the landing and fix CI" is three chats.
- Break big features into 3-5 prompts (phases), not one "build the whole thing" dump. Huge prompts hallucinate.
- Name files with `@` instead of pasting walls of code when the file is already in the repo. Too much context hurts as much as too little.
- When building something new, @ an existing component that already looks right so the agent copies your patterns.
- Say what not to do ("don't add Redux", "don't rewrite the folder structure").
- Prefer "change X to Y" over "make it better".
- If the model invents an API, stop and fetch docs (Context7) before the next turn.
- If the first reply goes off the rails, revert and rewrite the prompt. Do not keep stacking fixes on bad output. The model will defend its mistakes.
- End implementation prompts with a scope lock, e.g. `Do only what I asked. Do not change anything else.`
- Ban fallback stacks in every kind of project (apps, APIs, games, CLIs, systems, hardware, scripts). If the right method needs a dependency, tool, permission, or config, use that method — do not ship a weaker backup path "just in case."

### Bad vs good

Bad:

> make a cool dashboard

Good:

> Create `app/dashboard/page.tsx` using our existing `DashboardShell` from `@/components/shell`. Show three metric cards fed by mock data in `lib/metrics.ts`. No charts library. Match spacing tokens in `globals.css`.

### Saving money

- Start a new chat when the topic changes. Old context is dead weight you still pay for.
- Keep always-on rules short (under ~200 words for the forever-loaded ones).
- Do not dump the whole repo into chat. Point at paths and let the agent grep.
- Use a cheaper / faster model for renames, boilerplate, and "explain this file". Save the heavy model for architecture and hard bugs.

---

## 3) Advanced Prompting

### Context engineering = clever wording

Prompt engineering is how you ask. Context engineering is what the model is allowed to see.

Layers that work:

1. **Persistent** - `.cursor/rules/*.mdc`, `AGENTS.md`, or `CLAUDE.md`
2. **Session** - what you @-mention and what the agent already read
3. **Task** - the current ask and acceptance checks
4. **Live docs** - Context7 / MCP when APIs change often

Put naming, banned patterns, and "never touch these folders" at the top of always-on rules. Instructions buried at line 400 get ignored.

### Spec first, code second

For anything bigger than a one-file tweak, spend 5–10 minutes on a short plan in chat:

```
Plan only. Do not write code yet.
1) List files you would touch
2) List risks
3) Propose the smallest change that ships the feature
4) Wait till you have a full plan ready then build
```

### Plan -> implement -> verify

1. Agent proposes a plan
2. You approve or cut scope
3. Agent implements
4. Agent run the real check: build, test, or browser


### Scoped rules 

Modern Cursor project rules live in `.cursor/rules/` as `.mdc` files with frontmatter. Use activation modes so you are not paying for React rules.

| Mode | When it loads |
|------|----------------|
| Always Apply | Every chat (`alwaysApply: true`) - keep tiny |
| Apply to Specific Files | When globs match files in context |
| Apply Intelligently | Agent picks it from `description` |
| Apply Manually | You `@rule-name` it |

Official docs: [cursor.com/docs/rules](https://cursor.com/docs/rules.md)

### Frontend workflow

[21st.dev community templates](https://21st.dev/community/templates) is a registry of React / Tailwind / shadcn-style UI (components and full templates). Typical flow:

1. Find a template or component that matches the vibe
2. Copy the AI prompt from the page, or install via shadcn CLI when a registry URL is provided
3. Paste into Cursor / Claude Code and ask it to wire the piece into *your* tokens and layout
4. Edit the source in your repo 

Do not ask the model to "invent a hero from scratch" when a solid template already exists.

### When the session goes soft

Symptoms: shorter answers, forgotten constraints, weird APIs.

Fixes:

- Summarize decisions into a note file, then `/clear` or new chat
- Re-@ the 2–3 files that still matter
- Re-state the acceptance check in one line

Long chats feel productive. Fresh chats with a written summary are usually cheaper and sharper.

### Errors: three strikes, then reset

1. Paste the console/terminal error and ask for a fix.
2. If it still fails after ~3 tries, stop the rabbit hole. Revert, tighten the prompt, re-@ the right files.
3. For stubborn bugs, ask for an overview of the involved components, a ranked list of suspects, then temporary logs. Feed the log output back in. Do not let it rewrite half the app guessing.

### Second-pass review 

After a feature lands:

1. Paste the feature (or key files) into a long-context model and ask for security holes and bad patterns.
2. In a separate pass, ask for performance / stack-specific issues.
3. Bring those findings back into Cursor / Claude and fix them.
4. Re-check until the review pass is quiet.

### Security checklist [IMPORTANT]

Ai loves the "works on my machine" so erm dont do that

1. Never trust form/URL input - validate and sanitize on the server; escape output.
2. No secrets in client code
3. Auth is not enough - check permission for each action and resource.
4. Generic errors to users; detailed logs for you.
5. Ownership checks on every ID (no IDOR via `/api/thing/123`).
6. Use DB rules when you have them (e.g. Supabase RLS).
7. Rate-limit APIs; encrypt sensitive data at rest; HTTPS everywhere.

---

## 4) How to use tools/commands

### Cursor

- **Agent chat** for multi-file work
- **@files / @folders** for scoped context
- **`/create-rule`** to turn a repeated complaint into a real `.mdc` rule
- **MCP** for docs, browsers, databases, issue trackers
- **Rules** in `.cursor/rules/` (prefer `.mdc` over legacy `.cursorrules`)

Commit `.cursor/rules/` so the whole team gets the same agent behavior.

### Cursor Directory (rules + plugins)

Browse community rules and MCP-style plugins at [cursor.directory](https://cursor.directory/) by stack (Next.js, Expo, FastAPI, etc.). Copy a starting rule, then trim it to *your* repo. Blind-paste of a 2,000-line community file will bloat every request.

Also useful: [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) for curated `.mdc` examples.

### Context7 (docs for LLMs)

Docs: [overview](https://context7.com/docs/overview) · [site](https://context7.com)

Wires current, version-specific library docs into the assistant via MCP (or CLI). Stops a lot of "this API does not exist" loops.

Usage pattern:

```
Add Next.js middleware that validates a JWT cookie and redirects to /login.
use context7
```

Install the Context7 MCP for Cursor (remote `https://mcp.context7.com/mcp` or local `@upstash/context7-mcp`). Optional API key from the Context7 dashboard raises rate limits.

### OpenAI Codex

Install / source: [github.com/openai/codex](https://github.com/openai/codex)

Terminal / IDE / cloud coding agent from OpenAI. Strong fit when you want sandboxing and CLI-first loops. Auth via ChatGPT plan or API key. Use it for long terminal sessions, PR-oriented work, and when you already live in the OpenAI ecosystem.

Install sketch:

```bash
npm install -g @openai/codex
codex
```

### Claude Code

Docs: [code.claude.com/docs](https://code.claude.com/docs/en)

Anthropic's agent across terminal, IDE, desktop, and web. Reads the repo, edits files, runs commands. Project memory often lives in `CLAUDE.md`. Custom subagents go in `.claude/agents/` with YAML frontmatter (name, description, tool allowlists).

Daily CLI patterns:

```bash
claude                  # interactive
claude "fix the failing test"
claude -c               # continue last session in this dir
claude -p "explain auth.ts"   # one-shot then exit
```

Pin cheaper models for mechanical passes; keep Opus-class models for hard reasoning if your plan allows it.

### OpenCode (free / open source)

Docs: [models](https://opencode.ai/v2/docs/models) · [Ollama setup](https://docs.ollama.com/integrations/opencode)

Open-source coding agent for terminal, desktop, and IDE. Model-agnostic: free models included, or plug in Claude / GPT / Gemini / Copilot / local models. Good fit when you want agent workflows without a Cursor or Claude subscription.

Ways to keep cost near zero:

1. Use OpenCode's free included models
2. Run [Ollama](https://ollama.com/) locally and point OpenCode at it (code stays on your machine)
3. Reuse a sub you already pay for (GitHub Copilot, ChatGPT) if you have one - still no separate OpenCode license fee

Install sketch:

```bash
curl -fsSL https://opencode.ai/install | bash
opencode
```

Local Ollama path (zero API spend; you pay in RAM/GPU and electricity):

```bash
# install Ollama, then pull a coding-capable model
ollama pull qwen2.5-coder
# or launch OpenCode already wired to Ollama:
ollama launch opencode
```

Manual provider snippet in `opencode.json` when you need it:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": {
        "baseURL": "http://localhost:11434/v1"
      },
      "models": {
        "qwen2.5-coder": { "name": "qwen2.5-coder" }
      }
    }
  }
}
```

Honest limits: local / free models are weaker at hard multi-file refactors than paid frontier models. Compensate with tighter prompts, smaller phases, Context7, and more verify steps. Give local agents a large context window (Ollama often needs 32k–64k+ for tool use to behave).

Same bible rules still win: plan first, one job per chat, Git commits, scope lock, mistakes file.

### GitHub CLI (`gh`)

Docs: [cli.github.com](https://cli.github.com/) · manual: [cli.github.com/manual](https://cli.github.com/manual/)

`git` tracks files. `gh` talks to GitHub itself: create repos, open PRs, check CI, flip Pages on. Pair it with Cursor so the agent can ship without you clicking around github.com.

Install (pick one):

```bash
# Windows (winget)
winget install --id GitHub.cli -e

# macOS
brew install gh

# or grab an installer from https://cli.github.com/
```

Sign in once:

```bash
gh auth login
gh auth status
```

Use HTTPS + login in browser if you are new. After that, `git push` and `gh` both use the same account.

**Create a repo and push what you already built**

```bash
cd your-project
git init -b main
git add -A
git commit -m "Initial commit"
gh repo create my-cool-thing --public --source=. --remote=origin --push
```

Flags you will actually use:

- `--public` / `--private`
- `--source=.` (this folder is the repo)
- `--remote=origin`
- `--push` (upload `main` immediately)
- `--description "one line about the project"`

**Day-to-day commands**

```bash
gh repo view                          # open repo metadata
gh repo view --web                    # open in browser
gh status                             # PRs + issues that need you
gh pr create --fill                   # PR from current branch
gh pr create --title "..." --body "..."
gh pr list
gh pr checks                          # CI status for this PR
gh pr merge
gh issue create --title "..." --body "..."
gh issue list
gh run list                           # Actions runs
gh run view <id> --log                # failed job logs
```

**Static sites / GitHub Pages**

After the site is on `main`:

```bash
# turn on Pages from main branch, site root
gh api -X POST "repos/OWNER/REPO/pages" \
  -f build_type=legacy \
  -f "source[branch]=main" \
  -f "source[path]=/"
```

Put a `CNAME` file in the repo root with your domain (example: `zolo.mov`). DNS still happens at your registrar (A records to GitHub IPs, `www` CNAME to `OWNER.github.io`).

**Vibe coding rules for `gh`**

1. Commit with `git` first. `gh` does not replace commits.
2. Never paste tokens into chat. `gh auth login` stores them locally.
3. Tell the agent the exact `gh` command you want, or say "create a public repo named X and push." Vague "put it on github" burns turns.
4. Prefer `gh pr create` over the agent inventing a web URL workflow.
5. If auth fails in Cursor's terminal, run `gh auth status` yourself. PATH issues on Windows are common after install (restart the terminal).

**Agent prompt that works**

```
Create a public GitHub repo named [name] with gh.
Use this folder as the source.
Commit if needed, push main, print the repo URL.
Do not force-push. Do not change git user config.
```

### 21st.dev (UI container)

- Components / themes: [21st.dev](https://21st.dev/)
- Templates: [21st.dev/community/templates](https://21st.dev/community/templates)

Use for landing pages, dashboards, portfolios, SaaS shells. Pair with Cursor rules so the agent restyles to your design tokens instead of inventing a third visual language.

### Instructions folder + common mistakes file

Keep a small `instructions/` (or `docs/ai/`) tree with markdown the agent can @-mention:

- stack notes and "how we do X here"
- example components that show the house style
- `common-ai-mistakes.md` - every repeated agent screw-up you had to correct

When you start a feature, @ that mistakes file. It stops you from retyping the same rant. Pair it with Context7 for library truth, not for project taste.

### Suggested daily loop

1. Vision / UI sketch first (notes, v0, or 21st)
2. One-sentence goal + acceptance check
3. Rules from [cursor.directory](https://cursor.directory/) (trimmed) + project `.mdc` + mistakes file
4. `use context7` when touching libraries that change often
5. Implement in small phases in Cursor, Codex, Claude Code, or OpenCode (free/local)
6. Commit when the feature works
7. `gh` push / PR when it should leave your machine
8. Security / pattern review pass, then polish

---

## 5) Resources to use

### Core (bookmark these)

| Resource | Link | Use for |
|----------|------|---------|
| Cursor | [cursor.com](https://cursor.com) | Main IDE agent |
| Cursor Rules | [docs](https://cursor.com/docs/rules.md) | Official `.mdc` behavior |
| Cursor Directory | [cursor.directory](https://cursor.directory/) | Community rules & plugins |
| Context7 | [context7.com](https://context7.com) | Up-to-date lib docs for LLMs |
| Context7 overview | [docs](https://context7.com/docs/overview) | How `use context7` works |
| 21st.dev | [21st.dev](https://21st.dev/) | React UI registry |
| 21st templates | [community/templates](https://21st.dev/community/templates) | Full page / app starters |
| OpenAI Codex | [GitHub](https://github.com/openai/codex) | CLI install & releases |
| Claude Code | [docs](https://code.claude.com/docs/en) | CLI, agents, hooks |
| OpenCode | [opencode.ai](https://opencode.ai/) | Free / open-source agent |
| GitHub CLI | [cli.github.com](https://cli.github.com/) | Repos, PRs, issues, Pages from terminal |
| Reddit vibe guide | [r/ClaudeAI thread](https://www.reddit.com/r/ClaudeAI/comments/1kivv0w/the_ultimate_vibe_coding_guide/) | Field tips from heavy Cursor use |

### Extra (worth knowing)

| Resource | Link | Use for |
|----------|------|---------|
| gh manual | [cli.github.com/manual](https://cli.github.com/manual/) | Full command reference |
| GitHub Pages domains | [docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) | A / CNAME setup |
| Ollama | [ollama.com](https://ollama.com/) | Local models for OpenCode ($0 API) |
| OpenCode + Ollama | [setup guide](https://docs.ollama.com/integrations/opencode) | Official local setup |
| OpenCode models | [docs](https://opencode.ai/v2/docs/models) | Providers incl. local |
| v0 | [v0.dev](https://v0.dev/) | UI layout experiments before code |
| Google AI Studio | [aistudio.google.com](https://aistudio.google.com/) | Long-context planning / review passes |
| Context7 MCP | [npm](https://www.npmjs.com/package/@upstash/context7-mcp) | Local MCP install |
| Context7 | [GitHub](https://github.com/upstash/context7) | Source / setup notes |
| awesome-cursorrules | [GitHub](https://github.com/PatrickJS/awesome-cursorrules) | Curated rule packs |
| 21st | [GitHub](https://github.com/serafimcloud/21st) | Registry project |

### Reading on context / cost

These are not product pages; they explain why small context wins:

- [Context engineering for coding agents](https://readysolutions.ai/guides/context-engineering-for-ai-coding-agents/)
- [Context window patterns (Claude Code)](https://claudelab.net/en/articles/claude-code/claude-code-context-budget-optimization-guide)
- [Four-layer context framework](https://collinwilkins.com/articles/context-engineering.html)

---

## 6) Pre defined prompts

Copy, paste, fill the brackets.

### A. New feature (plan gate)

```
You are working in [repo / stack].
Goal: [one sentence]
Constraints: [list]
Out of scope: [list]

Plan only:
- files to touch
- data flow
- test / verify steps
Do not edit files until I say "go".
```

### B. Implement after approval

```
Implement the approved plan exactly.
Do not expand scope.
After edits, run: [build/test command]
If something fails, fix it or report the blocker - do not hide it.
```

### C. UI from 21st / registry

```
I pasted a component / template prompt from 21st.dev below.
Integrate it into [path].
Reuse our tokens / fonts / spacing from [files].
Remove demo copy. Wire real props from [data source].
No new UI library.
use context7
```

### D. Docs-backed API work

```
Implement [feature] using [library @ version if known].
use context7
Prefer current docs over training memory.
Show the final file paths and a short verify command.
```

### E. Bug hunt

```
Bug: [what you see]
Expected: [what should happen]
Repro: [steps]
Suspect area: @[file] @[file]
Do not refactor unrelated code.
Add a failing test or a minimal repro if possible, then fix.
```

### F. Rule writer

```
I keep correcting the agent about [pattern].
Create a Cursor project rule in .cursor/rules/[name].mdc
Use globs: [patterns]
alwaysApply: false
Write concrete do/don't bullets and point at @[example-file] instead of pasting a style guide.
```

### G. Cheap cleanup pass

```
Mechanical pass only:
- rename [old] -> [new]
- remove unused imports in touched files
- no behavior changes
Diff should be boring.
```

### H. Session handoff

```
Write a handoff note to docs/agent-handoff.md:
- goal
- done
- not done
- decisions
- exact next prompt to run in a fresh chat
Then stop.
```

### I. Scope lock (append to almost every implement prompt)

```
Do only what I asked.
Do not refactor, rename, or "improve" unrelated code.
Do not add files I did not request.
```

### J. Stubborn bug (after ~3 failed fixes)

```
Stop guessing patches.
1) List the components involved in this error
2) Rank top suspects with one-line reasons
3) Add temporary logs at the likely failure points
4) Tell me exactly what to run
Wait for the log output before changing more code.
```

### K. Security / pattern review

```
Act as a security-minded reviewer for [stack].
Review these files / this feature for:
- client-trusted input
- secrets in the client
- missing permission / ownership checks
- leaky errors
- missing rate limits
Return a short list of concrete findings only. No praise.
```

### M. Ship with GitHub CLI

```
Repo goal: [public/private] GitHub repo named [name]
Folder: current project root
Steps:
1) git status; commit only if there are real changes
2) gh repo create [name] --[public|private] --source=. --remote=origin --push
   (if origin already exists: git push -u origin HEAD)
3) Print the https://github.com/... URL
Constraints:
- Do not force-push
- Do not edit git config
- Do not put tokens in the chat
```

### N. No fallbacks — best method only (append or save as a rule)

Works for **any** project type: websites, APIs, games, CLIs, desktop/mobile apps, systems code, hardware tooling, scripts, reverse engineering, etc. Use on feature work, or drop it into `.cursor/rules/no-fallbacks.mdc` with `alwaysApply: true`.

```
No fallback-based systems for any feature, in any domain (UI, API, game, CLI, systems, hardware, tooling, scripts).

- Pick the single best method / API / library / algorithm / protocol for the job and implement that path only.
- Do not add "if X fails, try Y, then Z" chains, stubbed substitutes, or degraded backup flows unless I explicitly ask for resilience, redundancy, offline mode, or graceful degradation.
- Do not invent a weaker substitute when the correct approach needs a package, tool, driver, SDK, env var, permission, or hardware capability — ask or add what is required instead.
- Prefer one clear happy path + honest errors / hard failures over silent downgrades or "works somehow" paths.
- If two approaches are close, choose the one this repo already uses (@[example-file]) or the one current docs recommend (use context7). Explain the choice in one line.
```

Example Cursor rule file:

```md
---
description: Ban fallback stacks — use the best method only (any project type)
alwaysApply: true
---

# No fallbacks (all project types)

Applies to websites, APIs, games, CLIs, desktop/mobile, systems, hardware, tooling, and scripts.

- Implement the best option for each feature. One primary path.
- Do not add fallback / backup / "just in case" alternate implementations.
- Do not silently degrade. Bad examples (any stack): mock data when the real source is missing; a second renderer/physics/path when the first should be fixed; polling when events/hooks exist; busy-wait when a proper wait/signal exists; software stubs when the real SDK/driver/API is required; "compat shims" that hide a broken primary path.
- If the best method needs a dependency, tool, env, permission, or hardware feature — request it or add it. Do not ship a weaker substitute.
- Fail loudly with a clear error when the primary path cannot run. Do not hide gaps behind fallbacks.
- Resilience, redundancy, offline mode, or graceful degradation only when the user asks for them by name.
```

### L. IL2CPP Runtime Mod Framework (Advanced)
Put this in plan mode for cursor

```
Goal: Design a robust, extensible runtime modification framework for IL2CPP applications.
Target Application: An IL2CPP-compiled Unity game .
Description: This framework should handle core components for runtime analysis, memory manipulation, function hooking, and feature implementation, suitable for developing a comprehensive 'product'.
Important: ask the user for any feature or core component that you may not understand.

Key Components & Design Considerations:
- Injection & Bootstrap:
  - Discuss common injection techniques (e.g., DLL injection via `LoadLibrary`).
  - Describe the bootstrap process within the target application (e.g., detaching console, initializing custom modules).
- IL2CPP Internals Handling:
  - How to locate and interpret `il2cpp_domain`, `il2cpp_class`, `il2cpp_method` structures.
  - Strategy for reverse-engineering game-specific types and methods at runtime.
- Function Hooking System:
  - Design for a generic hooking manager (e.g., using MinHook, Detours).
  - How to apply, enable, and disable hooks on native IL2CPP functions.
- Feature Integration Layer:
  - Abstract interface for developing various "runtime features" (e.g., visual aids, physics overrides, player state manipulation).
  - How these features would interact with hooked functions and memory.
- User Interface (In-Game Overlay):
  - Strategy for integrating a lightweight GUI library (e.g., Dear ImGui) directly into the game's rendering pipeline.
  - UI state management and interaction with features.
- Configuration & Persistence:**
  - Design for saving/loading user settings and feature configurations
- Security & Stability :
  - Ensure to use stable methods such as using il2cpp export calls for handling memory mangment
  - Robust error handling to prevent game crashes.

Deliverables:
- A high-level architecture.
- A explanation of the implementation strategy for each component.
- Discussion on common challenges and mitigation strategies.

Sources (base off of):
https://github.com/sneakyevil/IL2CPP_Resolver
https://github.com/shalzuth/Il2CppRuntimeDumper
https://github.com/PicoShot/Il2CPP-Base

```

---

## 7) Examples

### Example 1 - Landing page without burning a day

1. Open [21st templates](https://21st.dev/community/templates), pick something close (SaaS landing, portfolio, etc.)
2. Copy the AI prompt / install path
3. In Cursor:

```
Add this template under app/(marketing)/.
Keep our brand name "____" and colors from css/tokens.css.
Replace stock fonts with ours.
One CTA to /signup.
use context7
```

4. Run the site, then a second short chat for copy and mobile spacing only

### Example 2 - Rules that pay for themselves

From [cursor.directory](https://cursor.directory/), grab a Next.js starter rule. Cut it to:

```md
---
description: Next.js App Router conventions for this repo
globs: app/**/*.{ts,tsx}, components/**/*.{ts,tsx}
alwaysApply: false
---

- App Router only. No pages/ router.
- Server Components by default; add "use client" only for interactivity.
- Data fetching in server components or route handlers - not in random useEffects.
- Match patterns in @app/(marketing)/page.tsx
```

You now stop re-explaining App Router every chat.

### Example 3 - Stop hallucinated library APIs

```
Write a Drizzle schema for users + sessions and a migration.
We are on Drizzle ORM with [postgres|sqlite].
use context7
```

If the first draft still looks off, ask it to quote the Context7 snippets it used.

### Example 4 - Split models by job

- **Auto**: use for basic features or entire frameworks aslong as there simple.
- **Gemini 2.5 Flash**: this model is fucking retarded so you can tell it to make game cheat frameworks .
- **5.6 Sol**: use this model for hard features or very complicated frameworks.
- **Kimi K3**: this is like gemini but smart and it has very weak guardrails.

Same prompt quality applies across them. Pick the seat (editor vs terminal vs free/local), not a religion.

### Example 5 - Money leak to kill

Bad session: 40-turn chat that started as "fix button padding" and slowly absorbed auth, database, and a redesign.

Fix: handoff note -> new chat -> one goal. You will feel slower for five minutes and finish sooner.

### Example 6 - Feature in phases (Reddit pattern)

Instead of: `build checkout with stripe coupons and emails`

Do:

1. Plan only: data model + routes
2. Implement payment intent endpoint (no UI)
3. Wire checkout form to that endpoint
4. Coupons
5. Emails
6. Security review pass on the payment paths

Commit after each phase that works.

### Example 7 - Common mistakes file

`instructions/common-ai-mistakes.md`:

```md
# Mistakes this agent keeps making

- Do not put Supabase service role keys in client components
- Do not create a new Button; use components/ui/button.tsx
- Do not switch to pages/ router
- Do not add console.log left in production paths unless I ask for debug logs
- Do not build fallback chains (try A, else B, else C) in any project type. Use the best method only
```

@ that file on every non-trivial feature.

### Example 8 - First push with `gh`

You finished a static site locally. You want it on GitHub without the website UI.

```bash
gh auth status
git init -b main
git add -A
git commit -m "Initial commit: static site"
gh repo create my-site --public --source=. --remote=origin --description "My site" --push
```

Then open Pages in the repo settings (or use the `gh api` Pages call from section 4). Add a `CNAME` if you have a domain.

---

## 8) Files & sources

### Files you should keep in a real project

```
project/
  AGENTS.md                 # simple always-on notes (optional)
  CLAUDE.md                 # if you use Claude Code
  .cursor/
    rules/
      stack.mdc             # tiny alwaysApply truths
      frontend.mdc          # globs: app/**, components/**
      api.mdc               # globs: app/api/**, server/**
  instructions/             # or docs/ai/
    stack.md
    common-ai-mistakes.md
    examples/               # "looks like this" components / snippets
  docs/
    agent-handoff.md        # session summaries (gitignored if noisy)
```

Example always-on rule (keep short):

```md
---
alwaysApply: true
---

- Package manager: pnpm
- Do not edit /dist or generated Prisma clients by hand
- Ask before adding dependencies
- Prefer editing existing files over creating new ones
- When implementing, do only what was asked
- No fallback stacks (any project type): use the best method only; fail loudly instead of degrading
```

### Sources used for this bible

**Products & docs**

- [Cursor](https://cursor.com)
- [Cursor rules docs](https://cursor.com/docs/rules.md)
- [Cursor Directory](https://cursor.directory/)
- [Context7](https://context7.com)
- [Context7 overview](https://context7.com/docs/overview)
- [Context7 MCP (npm)](https://www.npmjs.com/package/@upstash/context7-mcp)
- [Context7 (GitHub)](https://github.com/upstash/context7)
- [21st.dev](https://21st.dev/)
- [21st templates](https://21st.dev/community/templates)
- [21st (GitHub)](https://github.com/serafimcloud/21st)
- [OpenAI Codex (GitHub)](https://github.com/openai/codex)
- [Claude Code docs](https://code.claude.com/docs/en)
- [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules)
- [OpenCode](https://opencode.ai/)
- [OpenCode models docs](https://opencode.ai/v2/docs/models)
- [OpenCode + Ollama](https://docs.ollama.com/integrations/opencode)
- [Ollama](https://ollama.com/)
- [GitHub CLI](https://cli.github.com/)
- [GitHub CLI manual](https://cli.github.com/manual/)
- [GitHub Pages custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [The Ultimate Vibe Coding Guide (Reddit)](https://www.reddit.com/r/ClaudeAI/comments/1kivv0w/the_ultimate_vibe_coding_guide/) — u/PhraseProfessional54
- [v0](https://v0.dev/)
- [Google AI Studio](https://aistudio.google.com/)

**Background reading**

- [Context engineering for coding agents](https://readysolutions.ai/guides/context-engineering-for-ai-coding-agents/)
- [Context window patterns (Claude Code)](https://claudelab.net/en/articles/claude-code/claude-code-context-budget-optimization-guide)
- [Four-layer context framework](https://collinwilkins.com/articles/context-engineering.html)
- [Vibe coding guide 2026](https://0xminds.com/blog/guides/vibe-coding-complete-guide-2026)
- [Cursor rules guide](https://trinitytuts.com/cursor-rules-explained-complete-cursorrules-guide-2026)

---

## Closing note

Ai is an amazing tool but a tool is useless with a person that dosnt have a brain.