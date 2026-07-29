"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { seedVideos, type VideoRecord, type VideoStatus } from "@/data/seed";

const filters = ["全部", "军旅文案", "军旅情感", "个人成长", "军营轻内容"];

function compactNumber(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 1 : 2)}万`;
  return String(value);
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
  const [videos, setVideos] = useState<VideoRecord[]>(seedVideos);
  const [activeFilter, setActiveFilter] = useState("全部");
  const [selected, setSelected] = useState<VideoRecord | null>(null);
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    fetch("/api/feed")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload: { videos?: VideoRecord[] }) => {
        if (payload.videos?.length) setVideos(payload.videos);
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

  const hero = videos[1] ?? videos[0];

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
              <span>07.29</span>
              <small>今日 · 6条</small>
            </button>
            <button className="date-item" type="button"><span>07.28</span><small>6条</small></button>
            <button className="date-item" type="button"><span>07.27</span><small>6条</small></button>
            <button className="date-item" type="button"><span>07.23</span><small>6条</small></button>
          </div>
          <div className="rail-block rail-summary">
            <span className="rail-label">今日筛选</span>
            <strong>92</strong>
            <small>条推荐流粗刷</small>
            <div><span>入选率</span><b>6.5%</b></div>
          </div>
        </aside>

        <div className="content">
          <section className="intro">
            <div>
              <span className="eyebrow">2026年7月29日 · 星期三</span>
              <h1>今天值得拍的<br /><em>六条内容</em></h1>
            </div>
            <p>从抖音推荐流里筛掉大场面和空洞热闹，只留下能被乘归讲出来、也能被普通人听进去的内容。</p>
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
                  <span className="source-label">推荐流推送</span>
                </div>
                <h2>{hero.title}</h2>
                <blockquote>“{hero.viralLine}”</blockquote>
                <p>{hero.insight}</p>
                <div className="stats-row">
                  <span>♥ {compactNumber(hero.likes)}</span>
                  <span>● {compactNumber(hero.comments)}</span>
                  <span>★ {compactNumber(hero.favorites)}</span>
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
                    {video.mediaUrl ? <span className="media-ready">站内可播</span> : <span className="media-ready media-ready--link">原页播放</span>}
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
                        <span>● {compactNumber(video.comments)}</span>
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
                    <span>打开抖音播放<small>已保留站内播放器位置，抓取文件后自动切换</small></span>
                  </a>
                </>
              )}
            </div>
            <div className="detail-content">
              <div className="detail-header">
                <div>
                  <span className="category-tag">{selected.category}</span>
                  <span className="source-label">推荐流 · @{selected.author}</span>
                </div>
                <h2>{selected.title}</h2>
                <div className="stats-row">
                  <span>♥ {compactNumber(selected.likes)}</span>
                  <span>● {compactNumber(selected.comments)}</span>
                  <span>★ {compactNumber(selected.favorites)}</span>
                  <span>↗ {compactNumber(selected.shares)}</span>
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
