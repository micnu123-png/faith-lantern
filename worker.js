const UPDATE_KEY = "site:update-mode";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ==============================
    // ADMIN API
    // ==============================
    if (url.pathname === "/api/update-mode") {
      return handleUpdateModeAPI(request, env);
    }

    // ==============================
    // WEBSITE ROOT
    // ==============================
    if (
      url.pathname === "/" ||
      url.pathname === "/index.html"
    ) {
      const updateMode = await getUpdateMode(env);

      const target = updateMode
        ? "/update.html"
        : "/index.html";

      const targetURL = new URL(
        target,
        request.url
      );

      const assetRequest = new Request(
        targetURL,
        request
      );

      const response = await env.ASSETS.fetch(
        assetRequest
      );

      const headers = new Headers(
        response.headers
      );

      headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );

      headers.set(
        "Pragma",
        "no-cache"
      );

      headers.set(
        "Expires",
        "0"
      );

      return new Response(
        response.body,
        {
          status: response.status,
          statusText: response.statusText,
          headers
        }
      );
    }

    // ==============================
    // EVERYTHING ELSE
    // ==============================

    return env.ASSETS.fetch(request);
  }
};


// ==========================================
// UPDATE MODE API
// ==========================================

async function handleUpdateModeAPI(
  request,
  env
) {
  if (!env.ADMIN_TOKEN) {
    return json(
      {
        error:
          "ADMIN_TOKEN is not configured."
      },
      500
    );
  }

  const authorization =
    request.headers.get("Authorization") || "";

  const expected =
    `Bearer ${env.ADMIN_TOKEN}`;

  if (authorization !== expected) {
    return json(
      {
        error: "Unauthorized."
      },
      401
    );
  }

  // GET STATUS
  if (request.method === "GET") {
    return json({
      updateMode:
        await getUpdateMode(env)
    });
  }

  // ONLY GET/POST
  if (request.method !== "POST") {
    return json(
      {
        error: "Method not allowed."
      },
      405
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        error: "Invalid JSON."
      },
      400
    );
  }

  if (
    typeof body.enabled !== "boolean"
  ) {
    return json(
      {
        error:
          "`enabled` must be true or false."
      },
      400
    );
  }

  await env.UPDATE_STATE.put(
    UPDATE_KEY,
    JSON.stringify({
      enabled: body.enabled,
      changedAt:
        new Date().toISOString()
    })
  );

  return json({
    success: true,
    updateMode: body.enabled
  });
}


// ==========================================
// GET UPDATE STATE
// ==========================================

async function getUpdateMode(env) {
  const value =
    await env.UPDATE_STATE.get(
      UPDATE_KEY,
      "json"
    );

  return value?.enabled === true;
}


// ==========================================
// JSON RESPONSE
// ==========================================

function json(
  data,
  status = 200
) {
  return new Response(
    JSON.stringify(
      data,
      null,
      2
    ),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",

        "Cache-Control":
          "no-store"
      }
    }
  );
}
