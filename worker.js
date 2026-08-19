/**
 * Faith Lantern — Update Mode Worker
 *
 * Root URL:
 *   /                  -> index.html normally
 *   /                  -> update.html while update mode is ON
 *
 * Admin API:
 *   POST /api/update-mode
 *   GET  /api/update-mode
 *
 * The ADMIN_TOKEN should be stored as a Cloudflare Worker secret.
 */

const UPDATE_KEY = "site:update-mode";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Admin API
    if (url.pathname === "/api/update-mode") {
      return handleUpdateModeAPI(request, env);
    }

    // Only the website root is switched.
    // readings.html, style.css, script.js, etc. continue to work normally.
    if (url.pathname === "/") {
      const mode = await getUpdateMode(env);

      const target = mode ? "/update.html" : "/index.html";
      const assetURL = new URL(target, request.url);

      // Fetch the selected HTML through the static asset binding.
      const assetRequest = new Request(assetURL, request);
      const response = await env.ASSETS.fetch(assetRequest);

      // Prevent browsers/CDNs from keeping the old root page during a switch.
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    // Everything else is served normally.
    return env.ASSETS.fetch(request);
  }
};

async function handleUpdateModeAPI(request, env) {
  if (!env.ADMIN_TOKEN) {
    return json({ error: "ADMIN_TOKEN is not configured." }, 500);
  }

  const suppliedToken = request.headers.get("Authorization") || "";
  const expected = `Bearer ${env.ADMIN_TOKEN}`;

  if (suppliedToken !== expected) {
    return json({ error: "Unauthorized." }, 401);
  }

  if (request.method === "GET") {
    return json({
      updateMode: await getUpdateMode(env)
    });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  if (typeof body.enabled !== "boolean") {
    return json({ error: "`enabled` must be true or false." }, 400);
  }

  await env.UPDATE_STATE.put(
    UPDATE_KEY,
    JSON.stringify({
      enabled: body.enabled,
      changedAt: new Date().toISOString()
    })
  );

  return json({
    success: true,
    updateMode: body.enabled
  });
}

async function getUpdateMode(env) {
  const value = await env.UPDATE_STATE.get(UPDATE_KEY, "json");
  return value?.enabled === true;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
