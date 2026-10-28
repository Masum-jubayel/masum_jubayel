---
title: "Shipping a Website as One HTML File with a Python Build Step"
excerpt: "Inline the CSS, JavaScript and images into a single index.html that uploads anywhere — GitHub Pages, Netlify Drop or Firebase — with a 40-line Python script."
date: "2026-10-18"
category: "Web Development"
tags: ["HTML", "CSS", "JavaScript", "Python", "Static Sites"]
coverStyle: "terminal"
---

For a company brochure site you often don't need a framework, a server or a database. You need a page that **loads fast, never breaks, and can be uploaded by anyone.** I built the Expert Mobile site this way: edit a template, run one build command, upload one file.

## Project layout

```text
src/
  template.html   ← the page, with placeholders
  styles.css
  app.js
  images/         ← logos and photos
  build.py
dist/
  index.html      ← the single finished file
```

## The build script

The script reads the template, inlines the stylesheet and script, and converts each image into a `data:` URI so the final file has **no external dependencies**.

```python
import base64, mimetypes, pathlib, re

SRC = pathlib.Path(__file__).parent
OUT = SRC.parent / "dist" / "index.html"

def data_uri(path: pathlib.Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()

html = (SRC / "template.html").read_text(encoding="utf-8")
html = html.replace("{{CSS}}", (SRC / "styles.css").read_text(encoding="utf-8"))
html = html.replace("{{JS}}", (SRC / "app.js").read_text(encoding="utf-8"))
html = re.sub(r'src="images/([^"]+)"', lambda m: f'src="{data_uri(SRC / "images" / m.group(1))}"', html)

OUT.parent.mkdir(exist_ok=True)
OUT.write_text(html, encoding="utf-8")
print(f"Built {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")
```

Run it with `python3 src/build.py` — standard library only, nothing to install.

## Keep the file small

- Resize photos **before** inlining; base64 adds about a third to their size.
- Prefer SVG for logos and icons — they compress well and stay sharp.
- Use modern formats (WebP) where supported.

## Hosting options

| Host | How |
|---|---|
| Netlify Drop | Drag the `dist` folder onto the page |
| GitHub Pages | Commit `dist/index.html` and enable Pages |
| Firebase Hosting | `firebase deploy` with `public` set to `dist` |

## When to outgrow it

Once you need logins, shared data or many pages edited by several people, move to a framework with a real backend — like this portfolio, which uses Next.js with a database-backed admin console.
