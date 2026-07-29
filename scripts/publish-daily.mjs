import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const [, , inputPath] = process.argv;

if (!inputPath) {
  console.error("用法：node scripts/publish-daily.mjs <daily-report.json>");
  process.exit(1);
}

const endpoint =
  process.env.CHENGGUI_SITE_URL ??
  "https://chenggui-daily-library.jianghongliang0816.chatgpt.site";
const token =
  process.env.CHENGGUI_INGEST_TOKEN ??
  execFileSync(
    "security",
    [
      "find-generic-password",
      "-a",
      process.env.USER,
      "-s",
      "chenggui-daily-library-ingest",
      "-w",
    ],
    { encoding: "utf8" },
  ).trim();

const report = JSON.parse(await readFile(path.resolve(inputPath), "utf8"));
const videos = Array.isArray(report) ? report : report.videos;

if (!Array.isArray(videos) || videos.length === 0) {
  throw new Error("JSON 中没有 videos 数组");
}

for (const item of videos) {
  const { file, ...video } = item;
  const ingest = await fetch(`${endpoint}/api/ingest`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(video),
  });

  if (!ingest.ok) {
    throw new Error(`写入 ${video.id} 失败：${ingest.status} ${await ingest.text()}`);
  }

  if (file) {
    const bytes = await readFile(path.resolve(file));
    const upload = await fetch(`${endpoint}/api/media/${video.id}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": video.mediaType ?? "video/mp4",
      },
      body: bytes,
    });

    if (!upload.ok) {
      throw new Error(`上传 ${video.id} 视频失败：${upload.status} ${await upload.text()}`);
    }
  }

  console.log(`已发布：${video.id} ${video.title}`);
}
