import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { seedVideos, type VideoRecord } from "../data/seed";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  MEDIA: R2Bucket;
  INGEST_TOKEN?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

async function ensureSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      rank INTEGER NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      poster_text TEXT NOT NULL,
      author TEXT NOT NULL,
      source_url TEXT NOT NULL,
      media_key TEXT,
      category TEXT NOT NULL,
      accent TEXT NOT NULL,
      likes INTEGER NOT NULL DEFAULT 0,
      comments INTEGER NOT NULL DEFAULT 0,
      favorites INTEGER NOT NULL DEFAULT 0,
      shares INTEGER NOT NULL DEFAULT 0,
      viral_line TEXT NOT NULL,
      comment_quote TEXT NOT NULL,
      why_it_works TEXT NOT NULL,
      insight TEXT NOT NULL,
      script TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT '待拍',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS videos_date_rank_idx ON videos (date DESC, rank ASC)"),
  ]);
}

async function seedDatabase(db: D1Database) {
  const count = await db.prepare("SELECT COUNT(*) AS count FROM videos").first<{ count: number }>();
  if ((count?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  await db.batch(
    seedVideos.map((video) =>
      db.prepare(`INSERT OR IGNORE INTO videos (
        id, rank, date, title, poster_text, author, source_url, media_key, category, accent,
        likes, comments, favorites, shares, viral_line, comment_quote, why_it_works,
        insight, script, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(
          video.id, video.rank, video.date, video.title, video.posterText, video.author,
          video.sourceUrl, video.category, video.accent, video.likes, video.comments,
          video.favorites, video.shares, video.viralLine, video.commentQuote,
          video.whyItWorks, video.insight, video.script, video.status, now, now,
        ),
    ),
  );
}

function rowToVideo(row: Record<string, unknown>): VideoRecord {
  return {
    id: String(row.id),
    rank: Number(row.rank),
    date: String(row.date),
    title: String(row.title),
    posterText: String(row.poster_text),
    author: String(row.author),
    sourceUrl: String(row.source_url),
    mediaUrl: row.media_key ? `/media/${row.id}` : null,
    category: String(row.category) as VideoRecord["category"],
    accent: String(row.accent),
    likes: Number(row.likes),
    comments: Number(row.comments),
    favorites: Number(row.favorites),
    shares: Number(row.shares),
    viralLine: String(row.viral_line),
    commentQuote: String(row.comment_quote),
    whyItWorks: String(row.why_it_works),
    insight: String(row.insight),
    script: String(row.script),
    status: String(row.status) as VideoRecord["status"],
  };
}

function authorized(request: Request, env: Env) {
  if (!env.INGEST_TOKEN) return false;
  return request.headers.get("authorization") === `Bearer ${env.INGEST_TOKEN}`;
}

async function apiFetch(request: Request, env: Env) {
  const url = new URL(request.url);
  await ensureSchema(env.DB);
  await seedDatabase(env.DB);

  if (url.pathname === "/api/feed" && request.method === "GET") {
    const result = await env.DB.prepare("SELECT * FROM videos ORDER BY date DESC, rank ASC").all();
    return new Response(JSON.stringify({ videos: result.results.map(rowToVideo) }), { headers: jsonHeaders });
  }

  const statusMatch = url.pathname.match(/^\/api\/videos\/([^/]+)\/status$/);
  if (statusMatch && request.method === "PATCH") {
    const body = (await request.json()) as { status?: string };
    if (!["待拍", "已拍", "放弃"].includes(body.status ?? "")) {
      return new Response(JSON.stringify({ error: "invalid status" }), { status: 400, headers: jsonHeaders });
    }
    await env.DB.prepare("UPDATE videos SET status = ?, updated_at = ? WHERE id = ?")
      .bind(body.status, new Date().toISOString(), statusMatch[1]).run();
    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
  }

  if (url.pathname === "/api/ingest" && request.method === "POST") {
    if (!authorized(request, env)) return new Response("Unauthorized", { status: 401 });
    const video = (await request.json()) as VideoRecord;
    const now = new Date().toISOString();
    await env.DB.prepare(`INSERT INTO videos (
      id, rank, date, title, poster_text, author, source_url, media_key, category, accent,
      likes, comments, favorites, shares, viral_line, comment_quote, why_it_works,
      insight, script, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      rank=excluded.rank, date=excluded.date, title=excluded.title, poster_text=excluded.poster_text,
      author=excluded.author, source_url=excluded.source_url, category=excluded.category,
      accent=excluded.accent, likes=excluded.likes, comments=excluded.comments,
      favorites=excluded.favorites, shares=excluded.shares, viral_line=excluded.viral_line,
      comment_quote=excluded.comment_quote, why_it_works=excluded.why_it_works,
      insight=excluded.insight, script=excluded.script, updated_at=excluded.updated_at`)
      .bind(
        video.id, video.rank, video.date, video.title, video.posterText, video.author,
        video.sourceUrl, video.category, video.accent, video.likes, video.comments,
        video.favorites, video.shares, video.viralLine, video.commentQuote,
        video.whyItWorks, video.insight, video.script, video.status ?? "待拍", now, now,
      ).run();
    return new Response(JSON.stringify({ ok: true, id: video.id }), { headers: jsonHeaders });
  }

  const uploadMatch = url.pathname.match(/^\/api\/media\/([^/]+)$/);
  if (uploadMatch && request.method === "PUT") {
    if (!authorized(request, env)) return new Response("Unauthorized", { status: 401 });
    if (!request.body) return new Response("Missing body", { status: 400 });
    const key = `videos/${uploadMatch[1]}.mp4`;
    await env.MEDIA.put(key, request.body, {
      httpMetadata: { contentType: request.headers.get("content-type") ?? "video/mp4" },
    });
    await env.DB.prepare("UPDATE videos SET media_key = ?, updated_at = ? WHERE id = ?")
      .bind(key, new Date().toISOString(), uploadMatch[1]).run();
    return new Response(JSON.stringify({ ok: true, mediaUrl: `/media/${uploadMatch[1]}` }), { headers: jsonHeaders });
  }

  return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: jsonHeaders });
}

async function mediaFetch(request: Request, env: Env, id: string) {
  await ensureSchema(env.DB);
  const row = await env.DB.prepare("SELECT media_key FROM videos WHERE id = ?").bind(id).first<{ media_key: string | null }>();
  if (!row?.media_key) return new Response("Video not mirrored yet", { status: 404 });

  const head = await env.MEDIA.head(row.media_key);
  if (!head) return new Response("Video not found", { status: 404 });
  const rangeHeader = request.headers.get("range");
  const headers = new Headers({
    "content-type": head.httpMetadata?.contentType ?? "video/mp4",
    "accept-ranges": "bytes",
    "cache-control": "private, max-age=86400",
  });

  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const start = Number(match[1]);
      const end = match[2] ? Math.min(Number(match[2]), head.size - 1) : head.size - 1;
      const object = await env.MEDIA.get(row.media_key, { range: { offset: start, length: end - start + 1 } });
      if (!object) return new Response("Video not found", { status: 404 });
      headers.set("content-range", `bytes ${start}-${end}/${head.size}`);
      headers.set("content-length", String(end - start + 1));
      return new Response(object.body, { status: 206, headers });
    }
  }

  const object = await env.MEDIA.get(row.media_key);
  if (!object) return new Response("Video not found", { status: 404 });
  headers.set("content-length", String(head.size));
  return new Response(object.body, { headers });
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) return apiFetch(request, env);
    const mediaMatch = url.pathname.match(/^\/media\/([^/]+)$/);
    if (mediaMatch) return mediaFetch(request, env, mediaMatch[1]);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
