"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { creatorProfile } from "@/data/creator-profile";
import {
  seedVideos,
  type ContentChannel,
  type DiscoveryType,
  type VideoRecord,
  type VideoStatus,
  type ViralDriver,
} from "@/data/seed";

type LibraryChannel = ContentChannel | "个人随身记";
type PersonalNote = { id: string; createdAt: string; raw: string; title: string; hook: string; angle: string; script: string; status: VideoStatus };

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const statusStorageKey = "chenggui-video-statuses-v2";
const notesStorageKey = "chenggui-personal-notes";
const stages: { value: VideoStatus; label: string; hint: string }[] = [
  { value: "待筛选", label: "每日筛选", hint: "先看原片，再决定是否要拍" },
  { value: "待拍", label: "待拍摄", hint: "已确认，拿着稿子就能拍" },
  { value: "已拍", label: "已拍摄", hint: "已完成的选题档案" },
];
const channels: { value: LibraryChannel | "全部"; label: string; description: string }[] = [
  { value: "全部", label: "全部", description: "当前阶段的所有内容" },
  { value: "军旅", label: "军旅垂直", description: "入伍、退伍、战友、青春与告别" },
  { value: "成长励志", label: "青年成长", description: "19—22岁的迷茫、选择与翻身" },
  { value: "热点观点", label: "热点观点", description: "从乘归视角回应社会情绪" },
  { value: "个人随身记", label: "个人随身记", description: "你当天遇到的事、看到的话和突然的观点" },
];

function assetUrl(url: string) { return url.startsWith("/") ? `${basePath}${url}` : url; }
function compactNumber(value: number) { return value >= 10000 ? `${(value / 10000).toFixed(value >= 100000 ? 1 : 2)}万` : String(value); }
function isOriginal(video: VideoRecord) { return video.sourceVerified ?? /douyin\.com\/(video|note)\//.test(video.sourceUrl); }
function discovery(video: VideoRecord): DiscoveryType { return video.discoveryType ?? (video.sourceUrl.includes("/search/") ? "搜索找回" : "推荐流"); }
function sourceLabel(video: VideoRecord) { return `${discovery(video)} · ${isOriginal(video) ? "原链已核验" : "原链待核验"}`; }
function channelOf(video: VideoRecord): ContentChannel { return video.channel ?? (video.category === "个人成长" ? "成长励志" : "军旅"); }
function driver(video: VideoRecord): ViralDriver {
  if (video.viralDriver) return video.viralDriver;
  const text = `${video.viralLine}${video.whyItWorks}`;
  if (/文案|字|句|措辞/.test(text)) return "文案爆";
  if (/故事|经历|人物|叙事/.test(text)) return "故事爆";
  if (/画面|镜头|反差|动作/.test(text)) return "画面爆";
  return video.category === "个人成长" ? "观点爆" : "综合";
}
function sortNewest(items: VideoRecord[]) { return [...items].sort((a, b) => b.date.localeCompare(a.date) || a.rank - b.rank); }

function VideoPoster({ video }: { video: VideoRecord }) {
  if (video.coverUrl) return <div className="video-poster video-poster--image">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={assetUrl(video.coverUrl)} alt={`${video.author} 的视频封面`} />
    <span className="cover-chip">封面预览</span><span className="poster-author">@{video.author}</span>
  </div>;
  return <div className="video-poster" style={{ "--poster-accent": video.accent } as CSSProperties}><span className="poster-index">CHENG GUI · {String(video.rank).padStart(2, "0")}</span><strong>{video.posterText}</strong><span className="poster-author">@{video.author}</span></div>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return <button className="copy-button" onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }} type="button">{copied ? "已复制" : "复制口播稿"}</button>;
}

export default function Home() {
  const [videos, setVideos] = useState<VideoRecord[]>(() => {
    const defaults = sortNewest(seedVideos).map((video) => ({ ...video, status: "待筛选" as VideoStatus }));
    if (typeof window === "undefined") return defaults;
    try {
      const saved = JSON.parse(localStorage.getItem(statusStorageKey) ?? "{}") as Record<string, VideoStatus>;
      return defaults.map((video) => saved[video.id] ? { ...video, status: saved[video.id] } : video);
    } catch { return defaults; }
  });
  const [notes, setNotes] = useState<PersonalNote[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(notesStorageKey) ?? "[]") as PersonalNote[]; }
    catch { return []; }
  });
  const [draft, setDraft] = useState("");
  const [activeStage, setActiveStage] = useState<VideoStatus>("待筛选");
  const [activeChannel, setActiveChannel] = useState<LibraryChannel | "全部">("全部");
  const [selected, setSelected] = useState<VideoRecord | null>(null);
  const [selectedNote, setSelectedNote] = useState<PersonalNote | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [runRequested, setRunRequested] = useState(false);
  const modalRef = useRef<HTMLElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selected && !selectedNote) return;
    lastFocused.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => modalRef.current?.querySelector<HTMLElement>("button, a")?.focus(), 0);
    return () => { document.body.style.overflow = ""; lastFocused.current?.focus(); };
  }, [selected, selectedNote]);

  const latestDate = videos[0]?.date ?? "2026-08-04";
  const visibleVideos = useMemo(() => videos.filter((video) => video.status === activeStage && (activeChannel === "全部" || activeChannel === channelOf(video))), [activeChannel, activeStage, videos]);
  const visibleNotes = activeChannel === "个人随身记" || activeChannel === "全部" ? notes.filter((note) => note.status === activeStage) : [];
  const latestVideos = visibleVideos.filter((video) => video.date === latestDate);
  const shownVideos = latestVideos.length ? latestVideos : visibleVideos;
  const counts = Object.fromEntries(stages.map((stage) => [stage.value, videos.filter((video) => video.status === stage.value).length + notes.filter((note) => note.status === stage.value).length]));

  function persistNotes(next: PersonalNote[]) { setNotes(next); localStorage.setItem(notesStorageKey, JSON.stringify(next)); }
  function addNote() {
    const raw = draft.trim();
    if (!raw) return;
    const first = raw.split(/[\uff0c\u3002\uff01\uff1f\n]/)[0].slice(0, 28);
    const note: PersonalNote = {
      id: `note-${Date.now()}`,
      createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      raw,
      title: first || "今日随身记",
      hook: `我今天遇到一件事，让我突然想明白了：${first}。`,
      angle: "先保留你当时的真实感受，再补一个具体细节和一句能让普通人对号入座的结尾。",
      script: `我今天遇到一件事，让我突然想明白了一个问题。\n\n${raw}\n\n这里先保留我当时最真实的感受。下一步，我会补上那个真正发生的细节，再把它讲成一条完整口播。`,
      status: "待筛选",
    };
    persistNotes([note, ...notes]); setDraft(""); setSelectedNote(note);
  }
  function updateVideoStatus(video: VideoRecord, status: VideoStatus) {
    setVideos((current) => current.map((item) => item.id === video.id ? { ...item, status } : item));
    const saved = JSON.parse(localStorage.getItem(statusStorageKey) ?? "{}") as Record<string, VideoStatus>;
    localStorage.setItem(statusStorageKey, JSON.stringify({ ...saved, [video.id]: status }));
    setSelected(null);
  }
  function updateNoteStatus(note: PersonalNote, status: VideoStatus) { persistNotes(notes.map((item) => item.id === note.id ? { ...item, status } : item)); setSelectedNote(null); }
  function closeModal() { setSelected(null); setSelectedNote(null); }
  function trapKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") closeModal();
    if (event.key !== "Tab") return;
    const items = modalRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], video[controls]");
    if (!items?.length) return;
    if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1].focus(); }
    if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
  }

  const activeStageInfo = stages.find((stage) => stage.value === activeStage)!;
  const resultCount = shownVideos.length + visibleNotes.length;

  async function requestExtraRun() {
    const request = {
      requestedAt: new Date().toISOString(),
      scanTarget: "200-500",
      selectionTarget: "10-15",
      platform: "抖音推荐流",
    };
    localStorage.setItem("chenggui-daily-run-request", JSON.stringify(request));
    await navigator.clipboard.writeText("再刷一轮：我对今天已选内容还不够满意。请继续刷抖音推荐流，补充新的合格样本，避免重复今天及历史条目，完成后更新选题库。");
    setRunRequested(true);
  }

  return <main id="top">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="乘归每日选题库首页"><span className="brand-mark">乘</span><span><strong>乘归每日选题库</strong><small>个人内容工作台</small></span></a>
      <button className="profile-button" onClick={() => setShowProfile((value) => !value)} type="button" aria-expanded={showProfile}><span>已学习乘归表达</span><b>归</b></button>
    </header>

    <nav className="workflow-nav" aria-label="内容工作流">{stages.map((stage) => <button className={activeStage === stage.value ? "workflow-nav-active" : ""} onClick={() => setActiveStage(stage.value)} type="button" key={stage.value}><span>{stage.label}</span><b>{counts[stage.value] ?? 0}</b></button>)}</nav>

    {showProfile && <section className="profile-panel" aria-label="乘归表达模型"><div className="profile-summary"><div><h2>乘归表达模型</h2><strong>{creatorProfile.identity}</strong></div><p>{creatorProfile.accountName} · {creatorProfile.snapshot}</p></div><div className="profile-intent"><p><span>写给谁</span>{creatorProfile.audience}</p><p><span>希望留下什么</span>{creatorProfile.desiredEffect}</p></div><div className="profile-columns"><div><h3>人物底色</h3><ul>{creatorProfile.values.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>你的语气</h3><ul>{creatorProfile.voice.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>反 AI 腔检查</h3><ul>{creatorProfile.qualityGate.map((item) => <li key={item}>{item}</li>)}</ul><h3 className="profile-subheading">不要出现</h3><p className="avoid-list">{creatorProfile.avoid.join(" · ")}</p></div></div></section>}

    <section className="shell">
      <aside className="rail"><section><h2>内容板块</h2>{channels.slice(1).map((channel) => <button className={activeChannel === channel.value ? "rail-channel-active" : ""} onClick={() => setActiveChannel(channel.value)} type="button" key={channel.value}><span>{channel.label}</span><small>{channel.description}</small></button>)}</section><section className="rail-note"><h2>当前阶段</h2><strong>{activeStageInfo.label}</strong><p>{activeStageInfo.hint}</p></section></aside>

      <div className="content">
        <section className="start-work-card">
          <div>
            <span className="work-state">{runRequested ? "追加任务已准备" : "每天 09:30 自动工作"}</span>
            <h2>{runRequested ? "“再刷一轮”指令已复制" : "今日选题将自动送达"}</h2>
            <p>{runRequested ? "回到 Codex 粘贴指令，我就会继续刷流并补充新内容。安全的网站直连仍需本机任务桥接。" : "系统会自动刷抖音推荐流200—500条，筛出10—15条真正适合你的内容。如果今天的结果不够满意，再追加一轮。"}</p>
          </div>
          <button className="start-work-button" onClick={requestExtraRun} type="button">{runRequested ? "重新复制指令" : "再刷一轮"}<span>→</span></button>
          <dl><div><dt>粗刷目标</dt><dd>200—500条</dd></div><div><dt>今日入选</dt><dd>10—15条</dd></div><div><dt>预计完成</dt><dd>40—90分钟</dd></div></dl>
        </section>

        {latestDate === "2026-10-06" && <section className="run-report" aria-label="本轮刷流报告">
          <div><span>本轮刷流开始</span><strong>21:10</strong></div>
          <div><span>筛选范围</span><strong>抖音推荐流</strong></div>
          <div><span>粗刷条数</span><strong>约 105 条</strong></div>
          <div><span>入选条数</span><strong>{seedVideos.filter((video) => video.date === latestDate).length} 条</strong></div>
          <div className="run-report-pick"><span>最推荐先拍</span><strong>“参军后你失去了什么”</strong></div>
        </section>}

        <header className="intro"><div><p>{latestDate.replaceAll("-", ".")} · 乘归内容总监</p><h1>{activeStageInfo.label}<br /><em>{resultCount}条内容</em></h1></div><p>原内容的爆点保留 70%—80%，你的经历、价值判断和表达保留 20%—30%。只有你确认的选题才会进入待拍摄。</p></header>

        <div className="channel-tabs" aria-label="内容频道">{channels.map((channel) => <button className={activeChannel === channel.value ? "channel-active" : ""} onClick={() => setActiveChannel(channel.value)} type="button" key={channel.value}>{channel.label}</button>)}</div>

        {(activeChannel === "个人随身记" || activeChannel === "全部") && activeStage === "待筛选" && <section className="quick-note"><div><h2>随手记下当下的想法</h2><p>先保留原话和真实情绪，再由内容总监整理成适合你的短视频结构。</p></div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="例如：我今天在地铁上看到一个年轻人把座位让给了退伍老兵，我突然想到……" rows={4} /><div className="quick-note-footer"><span>保存后先进入每日筛选</span><button disabled={!draft.trim()} onClick={addNote} type="button">保存随身记</button></div></section>}

        {visibleNotes.length > 0 && <section className="notes-section"><div className="section-heading"><h2>个人随身记</h2><span>{visibleNotes.length}条</span></div><div className="notes-grid">{visibleNotes.map((note) => <article className="note-card" key={note.id}><div className="note-meta"><span>个人经历</span><time>{note.createdAt}</time></div><h3>{note.title}</h3><blockquote>{note.raw}</blockquote><div className="note-card-footer"><span>待内容总监深度梳理</span><button onClick={() => setSelectedNote(note)} type="button">打开梳理 →</button></div></article>)}</div></section>}

        {shownVideos.length > 0 ? <section className="feed-section"><div className="section-heading"><h2>{activeChannel === "全部" ? "视频选题" : channels.find((item) => item.value === activeChannel)?.label}</h2><span>{shownVideos.length}条</span></div><div className="video-grid">{shownVideos.map((video) => <article className="video-card" key={video.id}><button className="card-media" onClick={() => { setSelected(video); setShowScript(false); }} type="button" aria-label={`查看 ${video.title}`}><VideoPoster video={video} /><span className="mini-play">→</span></button><div className="video-card-body"><div className="card-topline"><span className="category-tag">{channelOf(video)}</span><span className="driver-badge">{driver(video)}</span></div><h3>{video.title}</h3><p>{video.viralLine}</p><div className="source-audit"><span>{sourceLabel(video)}</span><span>♥ {compactNumber(video.likes)}</span></div><div className="card-actions"><button onClick={() => { setSelected(video); setShowScript(false); }} type="button">看拆解</button><a href={video.sourceUrl} target="_blank" rel="noreferrer">原片 ↗</a></div></div></article>)}</div></section> : visibleNotes.length === 0 && <section className="empty-state"><h2>这个栏目还没有内容</h2><p>{activeStage === "待拍" ? "从每日筛选中选中一条，它就会来到这里。" : activeStage === "已拍" ? "拍完后在待拍摄栏目标记已拍即可归档。" : "当天还没有收录这个频道的合格样本。"}</p></section>}
      </div>
    </section>

    {(selected || selectedNote) && <div className="modal-backdrop" role="presentation" onMouseDown={closeModal}><section className={`detail-modal ${selectedNote ? "detail-modal--note" : ""}`} ref={modalRef} role="dialog" aria-modal="true" aria-label={selected?.title ?? selectedNote?.title} onKeyDown={trapKeys} onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={closeModal} type="button" aria-label="关闭">×</button>
      {selected && <><div className="detail-media">{selected.mediaUrl ? <video controls autoPlay playsInline src={assetUrl(selected.mediaUrl)} /> : <VideoPoster video={selected} />}<a className="external-play" href={selected.sourceUrl} target="_blank" rel="noreferrer"><b>↗</b><span>{isOriginal(selected) ? "打开抖音原视频" : "在抖音找回这条视频"}<small>{isOriginal(selected) ? "原链已核验" : "搜索找回链接，原链待核验"}</small></span></a></div><div className="detail-content"><div className="detail-header"><div><span className="category-tag">{channelOf(selected)}</span><span className="source-label">@{selected.author}</span></div><h2>{selected.title}</h2><div className="stats-row"><span>点赞 {compactNumber(selected.likes)}</span>{selected.comments > 0 && <span>评论 {compactNumber(selected.comments)}</span>}{selected.hotCommentLikes && <span>热评赞 {compactNumber(selected.hotCommentLikes)}</span>}</div></div><div className="audit-grid"><div><span>发现方式</span><b>{discovery(selected)}</b></div><div><span>原链状态</span><b>{isOriginal(selected) ? "已核验" : "待核验"}</b></div><div><span>爆款驱动</span><b>{driver(selected)}</b></div></div><div className="detail-tabs"><button className={!showScript ? "tab-active" : ""} onClick={() => setShowScript(false)} type="button">内容拆解</button><button className={showScript ? "tab-active" : ""} onClick={() => setShowScript(true)} type="button">乘归口播稿</button></div>{!showScript ? <div className="analysis-stack"><section><span>爆点原文 · 保留70%—80%</span><blockquote>“{selected.viralLine}”</blockquote></section><section><span>评论共鸣</span><p className="comment-quote">“{selected.commentQuote}”</p></section><section><span>真正为什么爆</span><p>{selected.whyItWorks}</p></section><section><span>乘归的经历与判断 · 20%—30%</span><p>{selected.insight}</p></section></div> : <div className="script-panel"><div><span>按乘归表达模型生成</span><CopyButton text={selected.script} /></div><p>{selected.script}</p></div>}<div className="workflow-actions">{selected.status === "待筛选" && <><button className="primary-action" onClick={() => updateVideoStatus(selected, "待拍")} type="button">纳入待拍摄</button><button onClick={() => updateVideoStatus(selected, "放弃")} type="button">不采用</button></>}{selected.status === "待拍" && <><button className="primary-action" onClick={() => updateVideoStatus(selected, "已拍")} type="button">标记已拍摄</button><button onClick={() => updateVideoStatus(selected, "待筛选")} type="button">退回筛选</button></>}{selected.status === "已拍" && <button onClick={() => updateVideoStatus(selected, "待拍")} type="button">退回待拍摄</button>}</div></div></>}
      {selectedNote && <div className="note-detail"><span className="category-tag">个人随身记</span><h2>{selectedNote.title}</h2><time>{selectedNote.createdAt}</time><section><span>你当时的原话</span><blockquote>{selectedNote.raw}</blockquote></section><section><span>短视频开头</span><p>{selectedNote.hook}</p></section><section><span>梳理方向</span><p>{selectedNote.angle}</p></section><section className="note-script"><div><span>初步口播骨架</span><CopyButton text={selectedNote.script} /></div><p>{selectedNote.script}</p></section><div className="workflow-actions">{selectedNote.status === "待筛选" && <button className="primary-action" onClick={() => updateNoteStatus(selectedNote, "待拍")} type="button">纳入待拍摄</button>}{selectedNote.status === "待拍" && <button className="primary-action" onClick={() => updateNoteStatus(selectedNote, "已拍")} type="button">标记已拍摄</button>}{selectedNote.status === "已拍" && <button onClick={() => updateNoteStatus(selectedNote, "待拍")} type="button">退回待拍摄</button>}</div></div>}
    </section></div>}
  </main>;
}
