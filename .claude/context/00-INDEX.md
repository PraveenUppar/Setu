# Context index

`CLAUDE.md` (project root) loads automatically every session. Everything here is **read on demand** — don't load it all.

| File | Read when |
|---|---|
| **04-session-handoff.md** | **Start of every session.** Live status, next action, open questions. |
| 01-domain-primer.md | Working on sections, rules, terminology, or anything SEBI/IPO-specific |
| 02-architecture.md | Building an engine, defining a data shape, deciding where code goes |
| 03-decision-log.md | About to re-open a settled question, or unsure why something is the way it is |
| 05-rule-sources.md | Writing or changing any rule. **The only valid source of regulatory numbers.** |
| 07-section-map.md | Building the section registry or any template. **Evidence-based, from 5 real ToCs — supersedes the primer's section table.** |
| 06-context-management.md | Session is filling up, or starting fresh after a reset |

## Skills

| Skill | Use for |
|---|---|
| `sme-domain` | Section structure, disclosure requirements, terminology |
| `template-extraction` | Turning corpus prospectuses into Wave 1 templates |
| `rule-authoring` | Writing a rule with correct citation discipline |

## Maintenance

- `03-decision-log.md` and `05-rule-sources.md` are **append-only**. Never rewrite history; add a superseding entry.
- `04-session-handoff.md` is **overwritten every session**. It is a snapshot, not a log.
- Keep `CLAUDE.md` under ~200 lines. It costs context on every single session — anything that isn't needed every time belongs here instead.
