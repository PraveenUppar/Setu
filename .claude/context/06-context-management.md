# Context management

This project has more domain knowledge than fits comfortably in one session. The structure here exists so that **no session ever needs to re-derive what an earlier one already worked out.**

---

## The layered model

```
  ALWAYS LOADED           CLAUDE.md            ~200 lines
  (every session,         · identity, mental models, hard rules
   costs context)         · pointers to everything else
        │
  READ ON DEMAND          .claude/context/*.md
  (only when relevant)    · domain primer, architecture, decisions,
                            rule sources
        │
  LOADED BY TASK          .claude/skills/*/SKILL.md
  (only when the work     · sme-domain, template-extraction,
   matches)                 rule-authoring
        │
  ON DISK, NEVER          fixtures/ · corpus/ · code
  IN CONTEXT              · read the specific file you need
```

**The rule:** if something is needed in *every* session it goes in `CLAUDE.md`. Everything else lives deeper and gets pulled in when relevant. `CLAUDE.md` staying short is what makes long sessions possible.

---

## Session sizing

**Work one build stage per session where you can.** S0, S1, S2… are natural boundaries — each ends with a test gate, which is exactly the right moment to stop.

A stage that clearly won't fit (S4's template extraction, S8's eight modules) should be split by sub-item, not carried across a bloated session.

---

## Start-of-session ritual

`CLAUDE.md` loads automatically. Then:

```
Read .claude/context/04-session-handoff.md and continue from there.
```

If the work is domain-heavy, add what's relevant:

```
Also read .claude/context/01-domain-primer.md — working on the section registry.
```

Don't load everything reflexively. Loading the architecture doc to fix a CSS bug wastes context you'll want later.

---

## End-of-session ritual

**Do this before the session gets tight, not after.** A handoff written from a compacted session is worse than one written at 60% full.

1. **Overwrite `04-session-handoff.md`** — current stage, what's done, next action, open questions, gotchas discovered
2. **Append to `03-decision-log.md`** if anything was decided
3. **Append to `05-rule-sources.md`** if any regulation was verified
4. **Update `TODO.md`** checkboxes and the progress line
5. **Commit** — `git add -A && git commit`

The handoff file is the single most valuable artifact in this repo for continuity. Treat writing it as part of the work, not overhead after it.

---

## When the session fills up

Claude Code summarises automatically when context runs out, and work continues — you won't lose the thread. But an auto-summary keeps what the summariser judged important, not necessarily what *you* need. Better to control the transition.

### Warning signs

- Responses start missing details you established earlier
- You're re-explaining something from earlier in the same session
- You've been going for hours across several stages
- Large files have been read into context (a 300-page PDF's extracted text, a long corpus dump)

### Two options

**`/compact` — keep going, same session.** Summarises the conversation so far and continues. Use when mid-stage and the thread genuinely matters. You can steer what it keeps:

```
/compact Keep the section registry design and the three template
extraction decisions. Drop the corpus file listings.
```

**`/clear` + fresh start — clean break.** Better at a stage boundary. Update the handoff first, then:

```
/clear
```
```
Read .claude/context/04-session-handoff.md and continue with S5.
```

**Prefer `/clear` at stage boundaries and `/compact` mid-stage.** A fresh session that reads a good handoff file starts sharper than a compacted one carrying three stages of residue.

### If a session ended badly

`claude --continue` resumes the most recent session; `claude --resume` lets you pick one. But if the handoff file is current, starting fresh is usually better than resuming a session that was already struggling.

---

## Keeping sessions lean

**Don't paste large files into chat.** Say "read `fixtures/truth/vardhman-capital.json`" and let the file be read. Pasted content sits in context forever; a file read can at least be re-read later if compaction drops it.

**Don't read whole PDFs into context.** Extract to a fixture once, then work against the fixture. This is the same discipline that controls API cost (D14) — it controls context too.

**Don't re-read files you just edited.** The harness tracks file state; Edit and Write error out if they fail.

**Ask for specific files, not exploration**, when you already know where something is. "Read `src/rules/eligibility.ts`" beats "find where the eligibility rules are."

**Write findings to disk immediately.** A regulation verified in conversation but not written to `05-rule-sources.md` is lost at the next compaction. Anything that took real work to establish should land in a file the same turn it's established.

---

## What each file is for

| File | Lifecycle | Rule |
|---|---|---|
| `CLAUDE.md` | Rarely changes | Keep under ~200 lines. It costs context every session. |
| `04-session-handoff.md` | **Overwritten every session** | A snapshot, not a log |
| `03-decision-log.md` | **Append-only** | Supersede by adding, never edit |
| `05-rule-sources.md` | **Append-only** | Old issuers were assessed under old rules |
| `01-domain-primer.md` | Stable | Orientation only — never a citation source |
| `02-architecture.md` | Updated when a shape changes | Data shapes and engine contracts |
| `TODO.md` | Checkboxes as you go | Progress line at the top |

---

## Anti-patterns

| Don't | Why |
|---|---|
| Let `CLAUDE.md` grow to 800 lines | It's loaded every session; bloat there is the most expensive bloat in the repo |
| Keep a running log in `04-session-handoff.md` | It's a snapshot. History goes in the decision log. |
| Re-derive regulation because the primer "has it" | The primer is unverified. Only `05-rule-sources.md` counts. |
| Carry one session across five stages | Quality degrades well before the hard limit |
| Skip the handoff because the session went well | That's exactly when it's cheapest to write and most worth having |
