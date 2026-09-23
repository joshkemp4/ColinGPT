# ColinGPT

A mobile-first, iMessage-style chat site. Text "Colin" and get a random canned catchphrase (text or GIF) back.

**Live site:** https://joshkemp4.github.io/ColinGPT/

## Features

- iOS Messages look and feel: blue/gray bubbles, typing indicator, timestamp grouping
- Colin replies with a random catchphrase — plain text or a GIF — picked from an editable list
- Header avatar rotates through Colin's real photos each time he replies
- Conversation is saved to `localStorage`, so it survives reloads on the same device
- Reset button (top right of the header) clears the conversation
- Gated behind an iOS-style lock screen passcode prompt on every visit (cosmetic only — not real security, since the passcode lives in a plain-text file anyone can view)

## Editing content

| What | Edit this file | Notes |
|---|---|---|
| Catchphrases (text or GIF) | [`catchphrases.js`](catchphrases.js) | Each entry is a string, or `{ gif: "gifs/filename.gif" }` |
| GIF files | [`gifs/`](gifs/) folder | Drop `.gif` files here, then reference them from `catchphrases.js` |
| Contact photos | [`photos.js`](photos.js) | List of filenames picked at random for the header avatar |
| Photo files | [`photos/`](photos/) folder | Drop image files here, then list them in `photos.js` |
| Lock screen passcode | [`lock.js`](lock.js) | Any string — the on-screen entry accepts letters, not just digits |

Changes take effect on the next page load (see the cache-busting note below when deploying).

## Running locally

```
python3 -m http.server
```

Then open http://localhost:8000 in a browser (use device emulation / a narrow window to preview the mobile layout).

## Pushing updates to GitHub Pages

The site is hosted via GitHub Pages from the `main` branch root, so pushing to `main` deploys it — but browsers (especially mobile Safari) aggressively cache `style.css` and the `.js` files by filename. To make sure phones pick up your changes instead of serving a stale cached copy, **bump the cache-busting version query string in `index.html` on every deploy** before committing:

```
NEW_VERSION=$(date +%Y%m%d%H%M%S)
sed -i '' "s/v=[0-9]\{14\}/v=$NEW_VERSION/g" index.html
```

Then commit and push as usual:

```
git add -A
git commit -m "Describe your change"
git push
```

GitHub Pages typically goes live within a minute or two of the push.
