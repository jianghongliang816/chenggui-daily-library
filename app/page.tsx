"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { seedVideos, type VideoRecord, type VideoStatus } from "@/data/seed";

const filters = ["全部", "军旅文案", "军旅情感", "个人成长", "军营轻内容"];

function compactNumber(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 1 : 2)}万`;
  return String(value);
}

function sourceLabel(video: VideoRecord) {
  if (video.id.startsWith("feed-")) return "推荐流推送 · 已互动收藏";
  return video.sourceUrl.includes("/search/") ? "搜索补充 · 已互动收藏" : "推荐流推送 · 已互动收藏";
}

function sortNewest(items: VideoRecord[]) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date) || a.rank - b.rank);
}

function dateHeading(date: string) {
  const parsed = new Date(`${date}T12:00:00+08:00`);
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "long", timeZone: "Asia/Shanghai" }).format(parsed);
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日 · ${weekday}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button className="copy-button" onClick={copy} type="button">
      {copied ? "已复制" : "复制口播稿"}
    </button>
  );
}

function VideoPoster({
  video,
  compact = false,
}: {
  video: VideoRecord;
  compact?: boolean;
}) {
  if (video.coverUrl) {
    return (
      <div className={`video-poster video-poster--image ${compact ? "video-poster--compact" : ""}`}>
        {/* Screenshots are first-party project assets captured from the selected Douyin post. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.coverUrl} alt={`${video.author} 的视频封面`} />
        <span className="cover-chip">封面预览</span>
        <span className="poster-author">@{video.author}</span>
      </div>
    );
  }

  return (
    <div
      className={`video-poster ${compact ? "video-poster--compact" : ""}`}
      style={{ "--poster-accent": video.accent } as CSSProperties}
    >
      <div className="poster-noise" />
      <span className="poster-index">CHENG GUI · {String(video.rank).padStart(2, "0")}</span>
      <strong>{video.posterText}</strong>
      <span className="poster-author">@{video.author}</span>
    </div>
  );
}

export default function Home() {
  const [videos, setVideos] = useState<VideoRecord[]>(sortNewest(seedVideos));
  const [activeFilter, setActiveFilter] = useState("全部");
  const [selected, setSelected] = useState<VideoRecord | null>(null);
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    fetch("/api/feed")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload: { videos?: VideoRecord[] }) => {
        if (payload.videos?.length) setVideos(sortNewest(payload.videos));
      })
      .catch(() => {
        // Local preview and a fresh deployment intentionally use the seed issue.
      });
  }, []);

  const filtered = useMemo(
    () =>
      activeFilter === "全部"
        ? videos
        : videos.filter((video) => video.category === activeFilter),
    [activeFilter, videos],
  );

  const latestDate = videos[0]?.date ?? "2026-08-04";
  const hero = videos.find((video) => video.id === "feed-20260804-pingfan") ?? videos[0];
  const todayCount = videos.filter((video) => video.date === latestDate).length;
  const railDate = latestDate.slice(5).replace("-", ".");

  async function updateStatus(video: VideoRecord, status: VideoStatus) {
    setVideos((current) =>
      current.map((item) => (item.id === video.id ? { ...item, status } : item)),
    );
    setSelected((current) => (current?.id === video.id ? { ...current, status } : current));
    await fetch(`/api/videos/${video.id}/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => undefined);
  }

  function openVideo(video: VideoRecord) {
    setSelected(video);
    setShowScript(false);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="乘归每日选题库首页">
          <span className="brand-mark">乘</span>
          <span>
            <strong>乘归每日选题库</strong>
            <small>DAILY FIELD NOTES</small>
          </span>
        </a>
        <div className="topbar-actions">
          <span className="sync-state"><i /> 今日已同步</span>
          <button className="avatar" type="button" aria-label="个人账号">归</button>
        </div>
      </header>

      <section className="shell" id="top">
        <aside className="rail">
          <div className="rail-block">
            <span className="rail-label">内容日期</span>
            <button className="date-item date-item--active" type="button">
              <span>{railDate}</span>
              <small>今日 · {todayCount}条</small>
            </button>
            <button className="date-item" type="button"><span>07.28</span><small>6条</small></button>
            <button className="date-item" type="button"><span>07.27</span><small>6条</small></button>
            <button className="date-item" type="button"><span>07.23</span><small>6条</small></button>
          </div>
          <div className="rail-block rail-summary">
            <span className="rail-label">今日筛选</span>
            <strong>100+</strong>
            <small>条推荐流与精准补充</small>
            <div><span>今日入选</span><b>{todayCount}条</b></div>
          </div>
        </aside>

        <div className="content">
          <section className="intro">
            <div>
              <span className="eyebrow">{dateHeading(latestDate)}</span>
              <h1>今天值得拍的<br /><em>{todayCount}条内容</em></h1>
            </div>
            <p>今日新增 10 条，重点收录入伍当天与退伍当天的真实情感。先看封面，再看爆点，最后直接拿走口播稿。</p>
          </section>

          {hero && (
            <section className="hero-card">
              <button className="hero-media" onClick={() => openVideo(hero)} type="button" aria-label={`播放 ${hero.title}`}>
                <VideoPoster video={hero} />
                <span className="play-button"><b>▶</b> 播放原视频</span>
              </button>
              <div className="hero-copy">
                <div className="card-topline">
                  <span className="rank-badge">今日首推</span>
                  <span className="source-label">{sourceLabel(hero)}</span>
                </div>
                <h2>{hero.title}</h2>
                <blockquote>“{hero.viralLine}”</blockquote>
                <p>{hero.insight}</p>
                <div className="stats-row">
                  <span>♥ {compactNumber(hero.likes)}</span>
                  {hero.comments > 0 && <span>● {compactNumber(hero.comments)}</span>}
                  {hero.favorites > 0 && <span>★ {compactNumber(hero.favorites)}</span>}
                </div>
                <button className="text-link" onClick={() => openVideo(hero)} type="button">查看完整拆解 →</button>
              </div>
            </section>
          )}

          <section className="feed-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">TODAY&apos;S SELECTION</span>
                <h2>今日入选</h2>
              </div>
              <div className="filters" aria-label="内容分类筛选">
                {filters.map((filter) => (
                  <button
                    className={activeFilter === filter ? "filter-active" : ""}
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    type="button"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="video-grid">
              {filtered.map((video) => (
                <article className="video-card" key={video.id}>
                  <button className="card-media" onClick={() => openVideo(video)} type="button">
                    <VideoPoster compact video={video} />
                    <span className="mini-play">▶</span>
                    {video.mediaUrl ? <span className="media-ready">站内可播</span> : <span className="media-ready media-ready--link">封面可预览</span>}
                  </button>
                  <div className="video-card-body">
                    <div className="card-topline">
                      <span className="category-tag">{video.category}</span>
                      <span className="source-label">@{video.author}</span>
                    </div>
                    <h3>{video.title}</h3>
                    <p>{video.viralLine}</p>
                    <div className="card-footer">
                      <div className="stats-row">
                        <span>♥ {compactNumber(video.likes)}</span>
                        {video.comments > 0 && <span>● {compactNumber(video.comments)}</span>}
                      </div>
                      <button onClick={() => openVideo(video)} type="button">拆解 →</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <section className="detail-modal" role="dialog" aria-modal="true" aria-label={selected.title} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} type="button" aria-label="关闭">×</button>
            <div className="detail-media">
              {selected.mediaUrl ? (
                <video controls autoPlay playsInline src={selected.mediaUrl} />
              ) : (
                <>
                  <VideoPoster video={selected} />
                  <a className="external-play" href={selected.sourceUrl} target="_blank" rel="noreferrer">
                    <b>▶</b>
                    <span>{selected.id.startsWith("feed-") ? "在抖音找回推荐视频" : selected.sourceUrl.includes("/search/") ? "在抖音精准找回" : "打开抖音原视频"}<small>站内先看封面，点击后进入抖音播放</small></span>
                  </a>
                </>
              )}
            </div>
            <div className="detail-content">
              <div className="detail-header">
                <div>
                  <span className="category-tag">{selected.category}</span>
                  <span className="source-label">{sourceLabel(selected)} · @{selected.author}</span>
                </div>
                <h2>{selected.title}</h2>
                <div className="stats-row">
                  <span>♥ {compactNumber(selected.likes)}</span>
                  {selected.comments > 0 && <span>● {compactNumber(selected.comments)}</span>}
                  {selected.favorites > 0 && <span>★ {compactNumber(selected.favorites)}</span>}
                  {selected.shares > 0 && <span>↗ {compactNumber(selected.shares)}</span>}
                </div>
              </div>

              <div className="detail-tabs">
                <button className={!showScript ? "tab-active" : ""} onClick={() => setShowScript(false)} type="button">内容拆解</button>
                <button className={showScript ? "tab-active" : ""} onClick={() => setShowScript(true)} type="button">乘归口播稿</button>
              </div>

              {!showScript ? (
                <div className="analysis-stack">
                  <section>
                    <span>爆点原文</span>
                    <blockquote>“{selected.viralLine}”</blockquote>
                  </section>
                  <section>
                    <span>评论共鸣</span>
                    <p className="comment-quote">“{selected.commentQuote}”</p>
                  </section>
                  <section>
                    <span>为什么爆</span>
                    <p>{selected.whyItWorks}</p>
                  </section>
                  <section>
                    <span>乘归怎么讲</span>
                    <p>{selected.insight}</p>
                  </section>
                </div>
              ) : (
                <div className="script-panel">
                  <div><span>可直接拍摄</span><CopyButton text={selected.script} /></div>
                  <p>{selected.script}</p>
                </div>
              )}

              <div className="workflow">
                <span>拍摄状态</span>
                <div>
                  {(["待拍", "已拍", "放弃"] as VideoStatus[]).map((status) => (
                    <button
                      className={selected.status === status ? "status-active" : ""}
                      onClick={() => updateStatus(selected, status)}
                      type="button"
                      key={status}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
