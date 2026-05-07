# 🤖 Claude Workflow Rules — Auto-Apply Every Session

**This file is read at the start of every Claude session. All rules below are MANDATORY and applied automatically without asking.**

---

## RULE 1: Always push to GitHub

After every code change:
1. `git add` the changed files
2. `git commit` with descriptive message
3. **`git push`** immediately
4. **`git push --tags`** when tagging
5. Verify "up to date with 'origin/main'" before reporting done

Never leave changes only on local. If push fails, surface it immediately.

---

## RULE 2: Auto ring-fence after every major change

A "major change" = new feature, significant fix, or anything the user confirms works.

When triggered, automatically (no asking):
1. Create git tag `vX.Y-feature-name`
2. Create `/locked-vX.Y/` folder containing the working files (frozen URL)
3. Create `_CHECKPOINTS/vX.Y-feature-name/` snapshot
4. Create inline backup `<active-file>-LOCKED-vX.Y-feature-name.html` (or equivalent)
5. Commit + push everything to GitHub
6. Update `CHECKPOINT-ACCESS.md` with new entry
7. Report new locked URL to user

Skip ring-fencing only for: typos, comment edits, mid-WIP commits.

---

## RULE 3: Always test after every change

After any code change:
1. Static audit:
   - Verify all `onclick="fn(...)"` references point to defined functions
   - Verify all `getElementById('x')` reference an existing `id="x"`
   - Check function signatures match calls
   - Look for obvious logic errors / null deref
2. If browser automation available, do live tests
3. Report results in a clean table (✅ working / ❌ broken / ⚠️ needs check)
4. Fix any ❌ before reporting "done"
5. Never claim "should work" — only "tested and works" or "fix needed"

---

## RULE 4: Friendly UX defaults

- Replace blocking `alert()` with toast notifications where possible
- Auto-reload after destructive actions (Clear Data, etc.)
- Plain-English error messages explaining cause + fix
- Mobile-friendly tap targets (≥44px)
- Color-code state (green=ok, amber=warn, red=error)

---

## RULE 5: Honest reporting

- Never say "should work" without testing
- If unsure, say "I think X but haven't verified — please confirm"
- If a tool fails, surface it immediately, don't pretend it succeeded
- Show file paths and exact commands so user can verify

---

## VERSION NUMBERING

- `v0.x` — pre-launch, breaking changes ok
- `v1.0` — first shippable
- `v1.x` — additive features
- `v2.0` — breaking redesign

Tag format: `vX.Y-short-name` (e.g. `v1.5-graphical`)

---

## RING-FENCE LOCATIONS

Each major version creates:
- GitHub tag: `git push origin vX.Y-name`
- Locked folder: `/locked-vX.Y/` (deployed as live URL)
- Local snapshot: `_CHECKPOINTS/vX.Y-name/`
- Inline backup: `<active>-LOCKED-vX.Y-name.html`

---

**End of rules. Apply automatically. Do not ask permission.**
