# 🔒 LOCKED CHECKPOINT — Permanent Access Guide

The working demo version is locked in **5 different places** so you can always recover it.

---

## 1. Live URL (permanent — never changes)

**👉 https://comfy-donut-f8587d.netlify.app/locked/app**

This URL points to `/locked/app.html` which is frozen. Future code changes to `/bold/app.html` will NOT affect this URL.

You can also use the root: https://comfy-donut-f8587d.netlify.app/locked/

## 2. Local file (open offline anytime)

Double-click: `C:\Users\noel1\OneDrive\Desktop\claude code\spending-manager\locked\app.html`

Or run from terminal:
```
start "" "C:\Users\noel1\OneDrive\Desktop\claude code\spending-manager\locked\app.html"
```

## 3. Backup file in bold folder

`bold/app-LOCKED-v1.0-demo-working.html` — a duplicate of the working file kept next to the live one.

## 4. Snapshot folder

`_CHECKPOINTS/v1.0-demo-working/` — contains both `app.html` and `final.html` from this point in time.

## 5. Git tag on GitHub (immutable)

Tag name: **`v1.0-demo-working`**
Commit: `450da7e`

View on GitHub: https://github.com/noel123ie-del/noels-project/releases/tag/v1.0-demo-working

To restore from tag anywhere:
```
git checkout v1.0-demo-working -- bold/app.html
```

---

## How to keep developing without breaking the locked version

- **Edit:** `bold/app.html`, `final.html`, etc. — these are the active files
- **NEVER edit:** anything inside `/locked/` or `/_CHECKPOINTS/`
- The locked URL stays working no matter what you change in the active files

## If everything goes wrong

```
cd "C:\Users\noel1\OneDrive\Desktop\claude code\spending-manager"
cp locked/app.html bold/app.html
git add bold/app.html
git commit -m "Restore from locked checkpoint"
git push
```
