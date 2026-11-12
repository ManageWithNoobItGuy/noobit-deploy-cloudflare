// Worker: /api/* talks to the D1 database, everything else is the website.
// env.DB     = D1 database (binding "DB" in wrangler.jsonc)
// env.ASSETS = files in ./public (or ./dist)

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    try {
      // Health check - used to test the deploy
      if (url.pathname === "/api/health") {
        const row = await env.DB.prepare("SELECT 1 AS ok").first();
        return json({ ok: row?.ok === 1 });
      }

      // List items
      if (url.pathname === "/api/items" && request.method === "GET") {
        const { results } = await env.DB
          .prepare("SELECT id, text, created_at FROM items ORDER BY id DESC LIMIT 100")
          .all();
        return json(results);
      }

      // Add an item
      if (url.pathname === "/api/items" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const text = String(body.text || "").trim().slice(0, 500);
        if (!text) return json({ error: "text is required" }, 400);
        const row = await env.DB
          .prepare("INSERT INTO items (text) VALUES (?) RETURNING id, text, created_at")
          .bind(text)
          .first();
        return json(row, 201);
      }

      // Delete an item
      const m = url.pathname.match(/^\/api\/items\/(\d+)$/);
      if (m && request.method === "DELETE") {
        await env.DB.prepare("DELETE FROM items WHERE id = ?").bind(Number(m[1])).run();
        return json({ deleted: Number(m[1]) });
      }

      return json({ error: "not found" }, 404);
    } catch (err) {
      // Shows up in `npx wrangler tail`
      console.error(err);
      return json({ error: String(err?.message || err) }, 500);
    }
  },
};
