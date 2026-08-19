# Faith Lantern Update Mode System

## Architecture

The Python GUI does NOT edit, rename, delete, or replace `index.html`.

Instead:

1. Python sends `POST /api/update-mode` to the Cloudflare Worker.
2. The Worker stores the state in Cloudflare KV.
3. When visitors request `/`, the Worker checks the KV state.
4. OFF -> `index.html`
5. ON -> `update.html`

Other files such as `readings.html`, CSS, JavaScript, images, etc. continue to be served normally.

## Project structure

```text
faith-lantern-update-system/
├── worker.js
├── wrangler.json
├── admin.py
└── public/
    ├── index.html       <-- copy your existing file here unchanged
    ├── update.html
    ├── readings.html    <-- copy your existing file
    ├── style.css
    ├── script.js
    ├── readings.js
    ├── newsletter.js
    ├── logo.png
    └── ...all other website files
```

## 1. Create a Cloudflare KV namespace

Using Wrangler:

```bash
npx wrangler kv namespace create UPDATE_STATE
```

Copy the returned namespace ID into `wrangler.json`.

## 2. Create the admin secret

```bash
npx wrangler secret put ADMIN_TOKEN
```

Enter a long random secret when prompted.

Do NOT put the token inside `worker.js`.

## 3. Copy your website

Put your current website files into `public/`.

Important:
- Keep `index.html` exactly as it is.
- Add `update.html`.
- Keep `readings.html` and all its supporting files.

## 4. Deploy

From this project folder:

```bash
npx wrangler deploy
```

## 5. Run the Python controller

No third-party Python package is required.

```bash
python admin.py
```

Enter:
- Worker URL, for example `https://faith-lantern.micnu123.workers.dev`
- The same ADMIN_TOKEN used with Wrangler

Then use:
- Turn Update Mode ON
- Return Website to Normal
- Check Current Status

## Security

The control API requires the secret token.

Never put the admin token in:
- `index.html`
- `update.html`
- public JavaScript
- GitHub repositories
- the Cloudflare public assets folder

The token belongs only in the Cloudflare Worker secret and your private Python controller.

## Important caching behavior

The Worker sends `Cache-Control: no-store` for the root HTML so switching modes does not intentionally leave the old root page cached.

Static assets such as CSS, JS and images remain ordinary Cloudflare static assets.
