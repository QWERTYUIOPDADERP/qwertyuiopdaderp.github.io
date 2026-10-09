import { useEffect, useRef, useState } from 'react';

// ---- Things you'll want to edit -------------------------------------------
const EMAIL = 'matthew@thecastellofamily.com';
const SCHOOL_EMAIL = 'mcastello@ucsd.edu';
const GITHUB = 'https://github.com/QWERTYUIOPDADERP';

// Paste the id from your Google Doc link (the part between /d/ and /edit).
// Leave empty to show the PDF instead (put the file in /public).
const RESUME_DOC_ID = '';
const RESUME_PDF = `${import.meta.env.BASE_URL}Castello_Matthew_Resume.pdf`;

// link: null shows "repo coming soon". Fill in as you push things to GitHub.
const PROJECTS = [
  {
    name: 'Jarvis',
    note: 'local assistant',
    stack: 'Python, whisper.cpp, Ollama, Qwen3',
    link: null,
    body: 'A voice and text assistant that runs on my own machine. You talk to it, whisper.cpp turns your speech into text, and a Qwen3 model running through Ollama decides what to do.',
    detail: "The hard part is that it can run shell commands, which is dangerous if the model gets something wrong. So every action sits in one of three tiers: read-only, logged, or needs my confirmation before it runs. That keeps the model useful without letting it touch things on its own.",
  },
  {
    name: 'Wallpaper engine',
    note: 'for Linux',
    stack: 'Python, GTK, X11, mpv, xwinwrap',
    link: 'https://github.com/QWERTYUIOPDADERP/wallpaper-engine',
    body: 'Animated wallpapers for Linux Mint on X11, across multiple monitors. mpv plays the video and xwinwrap puts it behind everything else on the desktop.',
    detail: "Playing video all day eats CPU and GPU, so the program checks whether anyone can actually see it. It reads window information with wmctrl and xprop, and when a window fully covers the wallpaper, it pauses the video until that window moves.",
  },
  {
    name: 'Match scheduler',
    note: 'FRC 1671',
    stack: 'constraint programming',
    link: null,
    private: true,
    body: 'Our robotics team had 80+ members, and the schedule for who works which part of an event was made by hand. It was slow and it kept coming out unfair: some people got fewer breaks, and the same people were paired together again and again.',
    detail: 'I turned it into a constraint problem. Fair breaks and no repeat pairings are the rules, and the program searches for a schedule that follows all of them. It builds one for the whole team in under 15 seconds, and the team used it for a full competition season.',
  },
  {
    name: 'Scouting app',
    note: 'works offline',
    stack: 'Java, XML, Google Sheets API',
    link: null,
    private: true,
    body: "Competitions restrict Wi-Fi, so a normal web app doesn't work there. This Android app lets scouts collect match data with no connection at all.",
    detail: 'When a scout finishes, the app packs the data into a QR code. A master device scans the codes into a database, and the database syncs to a Google Sheet automatically. That sheet is what we used to analyze teams for alliance selection. It was our scouting system for two seasons, 2023 and 2024, across five competitions from regionals up to the World Championship. That is roughly 400 qualification matches.',
  },
  {
    name: 'Scouting website',
    note: 'the app, rebuilt',
    stack: 'React, TypeScript, Figma',
    link: null,
    private: true,
    body: 'The successor to the Android app. Data goes over cellular instead of QR codes, so scouts can use the browser on any phone.',
    detail: "My favorite part is the field diagram. Strategy analysts can draw a robot's autonomous path right on an interactive field built in React, and the path gets saved. I designed the screens in Figma before building them. It replaced the app for the next two seasons, 2025 and 2026, and ran at eight competitions from regionals to the World Championship. That is roughly 700 qualification matches.",
  },
  {
    name: 'Autonomous pathing',
    note: 'robot software',
    stack: 'Java, sensors, vision',
    link: null,
    private: true,
    body: "I worked on FRC autonomous routines using PathPlanner, combining authored trajectories with autonomous sequencing and path planning. Preplanned routes were a major part of the system: paths were designed and tuned ahead of time, then followed by the robot during a match.",
    detail: 'I also worked on planning and integrating autonomous movement, plus driver-assist controls during my junior year. Those controls let the driver press a button to send the robot to a scoring position, automating the approach while keeping the driver in control of the overall play.'
  },
];

const TOOLS = [
  { id: 'browse', kind: 'none', label: 'Browse' },
  { id: 'pen', kind: 'pen', w: 2.5, label: 'Pen' },
  { id: 'highlighter', kind: 'hl', w: 18, alpha: 0.4, label: 'Highlighter' },
  { id: 'fill', kind: 'fill', label: 'Fill' },
  { id: 'erase', kind: 'erase', label: 'Eraser' },
];

const COLORS = [
  { id: 'red', label: 'Red', hex: '#B8322A' },
  { id: 'blue', label: 'Blue', hex: '#2457C5' },
  { id: 'green', label: 'Green', hex: '#2E7D4F' },
  { id: 'yellow', label: 'Yellow', hex: '#E3A800' },
  { id: 'ink', label: 'Black', hex: '#14213D' },
];

function cursorFor(t, hex) {
  if (t.kind === 'none') return 'auto';
  if (t.kind === 'fill') return 'crosshair';
  let svg;
  if (t.kind === 'pen')
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='4' fill='${hex}' stroke='white' stroke-width='1.5'/></svg>`;
  else if (t.kind === 'hl')
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><rect x='3' y='3' width='14' height='14' fill='${hex}' fill-opacity='.7' stroke='#14213D' stroke-width='1'/></svg>`;
  else
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='9' fill='white' fill-opacity='.5' stroke='#14213D' stroke-width='1.5'/></svg>`;
  const half = t.kind === 'erase' ? 12 : 10;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${half} ${half}, crosshair`;
}

const PAGES = ['Home', 'Projects', 'Experience', 'Resume', 'Leadership', 'Volunteering'];
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const CELL = 28;

// ---- Hooks ------------------------------------------------------------------
function useKonami(onUnlock) {
  const cb = useRef(onUnlock);
  cb.current = onUnlock;
  useEffect(() => {
    let i = 0;
    const onKey = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === KONAMI[i] ? i + 1 : k === KONAMI[0] ? 1 : 0;
      if (i === KONAMI.length) {
        i = 0;
        cb.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

function usePage() {
  const read = () => {
    const h = window.location.hash.replace('#', '').toLowerCase();
    if (!h) return 'Home';
    return PAGES.find((p) => p.toLowerCase() === h) || 'NotFound';
  };
  const [page, setPage] = useState(read);
  useEffect(() => {
    const onHash = () => {
      setPage(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return page;
}

// ---- Pieces -----------------------------------------------------------------
function Robot({ onDone }) {
  return (
    <div className="fixed left-0 bottom-6 z-40 pointer-events-none robot-run" onAnimationEnd={onDone}>
      <svg width="84" height="60" viewBox="0 0 84 60" fill="none" stroke="currentColor" strokeWidth="2" className="c-ink">
        <line x1="42" y1="2" x2="42" y2="12" />
        <circle cx="42" cy="4" r="3" fill="var(--pen)" stroke="none" />
        <rect x="14" y="12" width="56" height="28" rx="3" fill="var(--paper)" />
        <rect x="24" y="19" width="12" height="8" fill="var(--pen)" stroke="none" />
        <rect x="48" y="19" width="12" height="8" fill="var(--pen)" stroke="none" />
        <g className="wheel" style={{ transformOrigin: '24px 48px' }}>
          <circle cx="24" cy="48" r="10" fill="var(--paper)" />
          <line x1="24" y1="38" x2="24" y2="58" />
        </g>
        <g className="wheel" style={{ transformOrigin: '60px 48px' }}>
          <circle cx="60" cy="48" r="10" fill="var(--paper)" />
          <line x1="60" y1="38" x2="60" y2="58" />
        </g>
      </svg>
    </div>
  );
}

function IdleRobot() {
  return (
    <div className="pointer-events-none" aria-hidden="true">
      <svg width="84" height="60" viewBox="0 0 84 60" fill="none" stroke="currentColor" strokeWidth="2" className="c-ink">
        <line x1="42" y1="2" x2="42" y2="12" />
        <circle cx="42" cy="4" r="3" fill="var(--pen)" stroke="none" />
        <rect x="14" y="12" width="56" height="28" rx="3" fill="var(--paper)" />
        <rect x="24" y="19" width="12" height="8" fill="var(--pen)" stroke="none" />
        <rect x="48" y="19" width="12" height="8" fill="var(--pen)" stroke="none" />
        <circle cx="24" cy="48" r="10" fill="var(--paper)" />
        <circle cx="60" cy="48" r="10" fill="var(--paper)" />
      </svg>
    </div>
  );
}

function CopyEmail({ address }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked; the mailto link still works */
    }
  };
  return (
    <span className="inline-flex items-baseline gap-3">
      <a href={`mailto:${address}`} className="underline underline-offset-4 decoration-pen">
        {address}
      </a>
      <button onClick={copy} className="text-sm c-muted hover:text-[color:var(--ink)]">
        {copied ? 'copied' : 'copy'}
      </button>
    </span>
  );
}

function Resume() {
  const src = RESUME_DOC_ID
    ? `https://docs.google.com/document/d/${RESUME_DOC_ID}/preview`
    : `${RESUME_PDF}#view=FitH`;
  const openHref = RESUME_DOC_ID ? `https://docs.google.com/document/d/${RESUME_DOC_ID}/edit` : RESUME_PDF;
  return (
    <div>
      <iframe title="Matthew Castello's resume" src={src} className="resume-frame w-full h-[75vh] bg-white sheet" />
      <p className="mt-3 text-sm c-muted">
        Not loading?{' '}
        <a href={openHref} target="_blank" rel="noreferrer" className="underline underline-offset-4">
          Open it in its own tab
        </a>
        .
      </p>
    </div>
  );
}

// Drawing layer. Strokes and filled squares are kept per page and scroll with the paper.
function Sketch({ tool, color, page, store, version }) {
  const ref = useRef(null);
  const down = useRef(false);
  const current = useRef(null);

  const redraw = () => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.restore();
    const css = getComputedStyle(c.parentElement);
    (store.current[page] || []).forEach((s) => {
      const col = css.getPropertyValue(`--${s.color}`).trim();
      if (s.kind === 'fill') {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = col;
        s.cells.forEach(([x, y]) => ctx.fillRect(x, y, CELL, CELL));
        return;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = s.w;
      ctx.globalAlpha = s.alpha || 1;
      ctx.strokeStyle = col;
      ctx.beginPath();
      s.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      if (s.pts.length === 1) ctx.lineTo(s.pts[0][0] + 0.1, s.pts[0][1]);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  };

  useEffect(() => {
    const c = ref.current;
    const parent = c.parentElement;
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = w + 'px';
      c.style.height = h + 'px';
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [page]);

  useEffect(redraw, [page, version, tool]);

  const pos = (e) => {
    const r = ref.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const cellAt = ([x, y]) => [Math.floor(x / CELL) * CELL, Math.floor(y / CELL) * CELL];

  const erase = ([x, y]) => {
    let changed = false;
    const out = [];
    (store.current[page] || []).forEach((s) => {
      if (s.kind === 'fill') {
        const cells = s.cells.filter(([cx, cy]) => !(x >= cx && x < cx + CELL && y >= cy && y < cy + CELL));
        if (cells.length !== s.cells.length) changed = true;
        if (cells.length) out.push({ ...s, cells });
      } else if (s.pts.some(([a, b]) => Math.hypot(a - x, b - y) < 14 + s.w / 2)) {
        changed = true;
      } else {
        out.push(s);
      }
    });
    if (changed) {
      store.current[page] = out;
      redraw();
    }
  };

  const onDown = (e) => {
    if (tool.kind === 'none') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    down.current = true;
    const p = pos(e);
    if (tool.kind === 'erase') return erase(p);
    current.current =
      tool.kind === 'fill'
        ? { kind: 'fill', color, cells: [cellAt(p)] }
        : { kind: 'line', color, w: tool.w, alpha: tool.alpha, pts: [p] };
    store.current[page] = [...(store.current[page] || []), current.current];
    redraw();
  };
  const onMove = (e) => {
    if (!down.current) return;
    const p = pos(e);
    if (tool.kind === 'erase') return erase(p);
    if (tool.kind === 'fill') {
      const [cx, cy] = cellAt(p);
      if (!current.current.cells.some(([a, b]) => a === cx && b === cy)) current.current.cells.push([cx, cy]);
    } else {
      current.current.pts.push(p);
    }
    redraw();
  };
  const onUp = () => {
    down.current = false;
    current.current = null;
  };

  const hex = COLORS.find((c) => c.id === color).hex;
  return (
    <canvas
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      aria-hidden="true"
      className="absolute left-0 top-0 z-20"
      style={{
        pointerEvents: tool.kind === 'none' ? 'none' : 'auto',
        touchAction: tool.kind === 'none' ? 'auto' : 'none',
        cursor: cursorFor(tool, hex),
      }}
    />
  );
}

function Toolbar({ tool, setTool, color, setColor, onUndo, onClear }) {
  const usesColor = ['pen', 'hl', 'fill'].includes(tool.kind);
  const pickColor = (id) => {
    setColor(id);
    if (!usesColor) setTool(TOOLS[1]);
  };
  return (
    <div className="portfolio-toolbar safe-bottom fixed bottom-4 left-1/2 -translate-x-1/2 z-50 sheet px-4 py-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-display text-sm w-max max-w-[95vw]">
      <div className="flex items-center gap-3" role="group" aria-label="Tools">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t)}
            aria-pressed={t.id === tool.id}
            className={`px-1 ${t.id === tool.id ? 'tool-on' : 'c-muted hover:text-[color:var(--ink)]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3" role="group" aria-label="Color">
        <span className="c-muted">Color</span>
        {COLORS.map((c) => (
          <button
            key={c.id}
            onClick={() => pickColor(c.id)}
            aria-label={c.label}
            aria-pressed={usesColor && c.id === color}
            title={c.label}
            className={usesColor && c.id === color ? 'tool-on' : ''}
          >
            <span className="block w-4 h-4 rounded-full" style={{ background: `var(--${c.id})` }} />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onUndo} className="c-muted hover:text-[color:var(--ink)]">Undo</button>
        <button onClick={onClear} className="c-muted hover:text-[color:var(--ink)]">Clear</button>
      </div>
    </div>
  );
}

// A heading that sits on an axis, like a plot title.
const Title = ({ children, sub }) => (
  <header className="mb-12">
    <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">{children}</h1>
    <div className="axis mt-4" aria-hidden="true" />
    {sub && <p className="mt-4 c-muted">{sub}</p>}
  </header>
);

const Entry = ({ when, title, children }) => (
  <li className="sheet p-5">
    {when && <p className="text-sm c-muted">{when}</p>}
    <h3 className="font-display text-lg font-bold">{title}</h3>
    <div className="mt-1 space-y-3">{children}</div>
  </li>
);

// ---- Pages ------------------------------------------------------------------
const Home = () => (
  <>
    <Title>Matthew Castello</Title>
    <p className="mb-5">
      I'm a first-year computer science student at UC San Diego. I write software for robots, for my own Linux
      desktop, and for whatever problem I can't stop thinking about.
    </p>
    <p className="mb-5">
      I got into programming by making a very glitchy block-code game, then spent most of high school on a FIRST
      robotics team, where I ran the programming subteam. Lately I've been reading about machine learning and unlearning.
      I also spend time on programs I'll never use again, mostly because they're fun to write.
    </p>
    <p className="mb-14">
      Away from the keyboard I run, hike, read, and watch anime. Let me know if you have recommendations.
    </p>
    <h2 className="font-display text-2xl font-bold mb-4">Say hi</h2>
    <p className="mb-3">
      <CopyEmail address={EMAIL} />
    </p>
    <p className="mb-3 c-muted">
      For school stuff: <CopyEmail address={SCHOOL_EMAIL} />
    </p>
    <p>
      My code is on{' '}
      <a href={GITHUB} target="_blank" rel="noreferrer" className="underline underline-offset-4 decoration-pen">
        GitHub
      </a>
      .
    </p>
  </>
);

const Projects = () => (
  <>
    <Title>Projects</Title>
    <ul className="space-y-7">
      {PROJECTS.map((p) => (
        <li key={p.name} className="sheet p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="font-display text-xl font-bold">{p.name}</h3>
            <span className="pen-note">{p.note}</span>
          </div>
          <p className="mt-2">{p.body}</p>
          <p className="mt-3">{p.detail}</p>
          {p.image && <img src={p.image} alt={`${p.name} screenshot`} className="mt-4 w-full sheet" />}
          <p className="mt-3 text-sm c-muted">
            {p.stack}
            {' / '}
            {p.link ? (
              <a href={p.link} target="_blank" rel="noreferrer" className="underline underline-offset-4 c-ink">
                code
              </a>
            ) : p.private ? (
              <em>private repo, happy to walk through it</em>
            ) : (
              <em>repo coming soon</em>
            )}
          </p>
        </li>
      ))}
    </ul>
  </>
);

const Experience = () => (
  <>
    <Title>Experience</Title>
    <h2 className="font-display text-2xl font-bold mb-4">Work</h2>
    <ul className="space-y-7 mb-14">
      <Entry when="Summer 2026, remote" title="Junior programmer, PreLicenseTraining">
        <p>
          PreLicenseTraining runs an online exam-prep platform for people studying for their insurance licenses. I
          worked on the live site the summer after I graduated high school, putting in about 170 hours.
        </p>
        <ul className="list-disc ml-5 space-y-2">
          <li>Wrote backend features in PHP for the platform.</li>
          <li>
            Designed and built three interactive study games from scratch: a crossword, a true/false game, and a
            trivia-show format. They give students something better to do than flip through flashcards.
          </li>
          <li>Ran QA testing across the site all summer. I found bugs, documented them, and fixed them.</li>
        </ul>
        <p className="text-sm c-muted">The code is private, but I'm glad to talk through any of it.</p>
      </Entry>
      <Entry when="2023 to 2025" title="Programming director, Buchanan Bird Brains (FRC 1671)">
        <p>
          I ran the software side of an 80+ member competition robotics team, and built the tools our team
          actually used at events:
        </p>
        <ul className="list-disc ml-5 space-y-2">
          <li>A match scheduler that builds fair schedules for 80+ people in under 15 seconds. It replaced a manual process.</li>
          <li>Two scouting systems: an Android app that works offline through QR codes and syncs to Google Sheets, and later a cellular website with a field diagram for drawing robot paths. Together they were used at 13 competitions over four seasons, covering roughly 1,100 qualification matches.</li>
          <li>Autonomous pathing and vision work on the robot itself. The team climbed 350+ places in the rankings and qualified for the FIRST World Championship two years in a row.</li>
        </ul>
      </Entry>
    </ul>
    <h2 className="font-display text-2xl font-bold mb-4">Education</h2>
    <ul className="space-y-7 mb-14">
      <Entry when="Sept 2026 to now" title="B.S. Computer Science, UC San Diego">
        <p>This quarter: CSE 11 (intro to programming), CSE 20 (discrete math), MATH 18 (linear algebra), LIGN 5.</p>
      </Entry>
      <Entry when="Graduated June 2026" title="Buchanan High School, Clovis">
        <p>
          4.0 unweighted, 4.45 weighted. Took classes at CSU Fresno and Clovis Community College, and three years
          of the CTE engineering pathway.
        </p>
      </Entry>
    </ul>
  </>
);

const ResumePage = () => (
  <>
    <Title>Resume</Title>
    <Resume />
  </>
);

const NotFound = () => (
  <>
    <Title>Wrong turn.</Title>
    <div className="sheet p-6">
      <div className="flex items-center gap-4">
        <svg width="76" height="60" viewBox="0 0 84 60" fill="none" stroke="currentColor" strokeWidth="2" className="c-ink" aria-hidden="true">
          <line x1="42" y1="2" x2="42" y2="12" />
          <circle cx="42" cy="4" r="3" fill="var(--pen)" stroke="none" />
          <rect x="14" y="12" width="56" height="28" rx="3" fill="var(--paper)" />
          <rect x="24" y="19" width="12" height="8" fill="var(--pen)" stroke="none" />
          <rect x="48" y="19" width="12" height="8" fill="var(--pen)" stroke="none" />
          <circle cx="24" cy="48" r="10" fill="var(--paper)" />
          <circle cx="60" cy="48" r="10" fill="var(--paper)" />
        </svg>
        <p>This robot took a wrong turn. There’s nothing at this address.</p>
      </div>
      <p className="mt-4"><a href="#home" className="underline underline-offset-4 decoration-pen">Back home</a></p>
    </div>
  </>
);

const Leadership = () => (
  <>
    <Title>Leadership</Title>
    <ul className="space-y-7 mb-16">
      <Entry when="2024 to 2026" title="Leadership Council, Teens That Care">
        <p>
          I was on the council for my junior and senior years. I started and led a seven-week summer camp for
          at-risk kids, and weekly attendance grew to 30.
        </p>
      </Entry>
      <Entry when="2025 to 2026" title="Administrative lead, Buchanan Bird Brains">
        <p>
          I organized team events and outreach, and ran onboarding and leadership nominations for a team of 80+
          students.
        </p>
      </Entry>
      <Entry when="2023 to 2025" title="Programming director, Buchanan Bird Brains">
        <p>
          I led a subteam of 4 to 11 programmers and wrote the onboarding curriculum. We went from 2
          competition-ready programmers to 8 over two years, and qualified for the FIRST World Championship twice
          in a row. After I moved to a new role, the subteam kept doing well without me, which was the goal.
        </p>
      </Entry>
      <Entry when="2023" title="Vice president, Tutoring Club">
        <p>I organized peer tutoring and expanded it across multiple classes.</p>
      </Entry>
    </ul>
    <h2 className="font-display text-2xl font-bold mb-4">Awards</h2>
    <ul className="list-disc ml-5 space-y-1">
      <li>FIRST Impact Award</li>
      <li>FRC Regional Finalist (twice) and FRC Quality Award (twice)</li>
      <li>Community Hero Award, top out of 145+ members</li>
      <li>Mayoral Certificate of Recognition (twice)</li>
      <li>Silver President's Volunteer Service Award and Silver National Service Honor Award</li>
    </ul>
  </>
);

const Volunteering = () => (
  <>
    <Title>
      Volunteering
    </Title>
    <ul className="space-y-7">
      <Entry title="Teens That Care" when="350+ hours">
        <p>
          TTC is a student-run nonprofit that partners with local organizations and runs programs in underserved
          communities. I helped serve meals at shelters and the Ronald McDonald House, supported adaptive sports,
          and worked food drives and veteran-focused events. I earned the Silver President’s Volunteer Service Award
          after contributing 175+ hours in one year.
        </p>
        <p>
          At Rescue the Children, I noticed the kids had few activities, so I organized and ran a seven-week summer
          camp with crafts and games. Attendance grew to 30, and we ended with a trip to the Fresno Zoo. I still
          remember one girl who avoided joining in for weeks, then drew a sun and trees on my nametag.
        </p>
      </Entry>
      <Entry title="Make-A-Wish" when="170+ hours">
        <p>
          I planned and ran fundraising events with a group of other student volunteers. The money helped grant
          three wishes for kids who are seriously ill.
        </p>
      </Entry>
      <Entry title="FIRST LEGO League" when="200+ hours">
        <p>
          From 10th through 12th grade I coached two elementary robotics teams on programming, design basics, and
          presentation skills. I also volunteered at FLL competitions, refereeing and judging six regional events,
          where the judges talked through who should win each award. It's where my own robotics started, so it felt
          good to hand it on.
        </p>
      </Entry>
    </ul>
  </>
);

const COMPONENTS = { Home, Projects, Experience, Resume: ResumePage, Leadership, Volunteering, NotFound };

// ---- App --------------------------------------------------------------------
export default function App() {
  const page = usePage();
  const [blueprint, setBlueprint] = useState(false);
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  const cell = useRef(null);
  const [color, setColor] = useState('red');
  const [tool, setTool] = useState(TOOLS[0]);
  const strokes = useRef({});
  const [version, setVersion] = useState(0);
  const undo = () => {
    strokes.current[page] = (strokes.current[page] || []).slice(0, -1);
    setVersion((v) => v + 1);
  };
  const clear = () => {
    strokes.current[page] = [];
    setVersion((v) => v + 1);
  };
  const [toast, setToast] = useState('');
  const [terminalMode, setTerminalMode] = useState('');
  const [terminalLines, setTerminalLines] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [idleRobot, setIdleRobot] = useState(false);
  const [robotPeeked, setRobotPeeked] = useState(false);
  const Page = COMPONENTS[page];

  useKonami(() => setBlueprint((b) => !b));

  useEffect(() => {
    if (blueprint) {
      setRun((r) => r + 1);
      setDone(false);
    }
  }, [blueprint]);

  useEffect(() => {
    console.log(
      "%cInterested in the source code? It's a public repo, hosted here:%c\nhttps://github.com/QWERTYUIOPDADERP/qwertyuiopdaderp.github.io",
      'font-size:16px;font-weight:bold;color:#B8322A;',
      'font-size:13px;'
    );
  }, []);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key !== 'Escape') return;
      if (terminalMode) {
        setTerminalMode('');
        setTerminalLines([]);
        setTerminalInput('');
      } else {
        setTool(TOOLS[0]);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [terminalMode]);

  // Type "sudo" anywhere.
  useEffect(() => {
    let buf = '';
    let t;
    const onKey = (e) => {
      if (e.key.length !== 1 || e.metaKey || e.ctrlKey) return;
      buf = (buf + e.key.toLowerCase()).slice(-4);
      if (buf === 'sudo') {
        setToast('you are not in the sudoers file. This incident will be reported.');
        clearTimeout(t);
        t = setTimeout(() => setToast(''), 3500);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Global typing shortcuts work even when the fake terminal is open.
  useEffect(() => {
    let buffer = '';
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-8);
      if (buffer.endsWith('rm -rf /')) {
        setTerminalMode('rm');
        setTerminalInput('');
        setTerminalLines(['$ rm -rf /']);
        buffer = '';
      } else if (buffer.endsWith('help')) {
        setTerminalMode('terminal');
        setTerminalInput('');
        setTerminalLines([
          '$ help',
          'Available shortcuts:',
          '  help      show this list',
          '  rm -rf /  run the fake filesystem wipe + recovery sequence',
          '  Konami    ↑ ↑ ↓ ↓ ← → ← → B A toggles blueprint mode',
          '  sudo      print a permissions joke',
          '',
          'These are portfolio easter eggs. No system commands are executed.'
        ]);
        buffer = '';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const runTerminalCommand = (raw) => {
    const command = raw.trim().toLowerCase();
    setTerminalInput('');
    if (command === 'help') {
      setTerminalMode('terminal');
      setTerminalLines(['$ help', 'Available shortcuts:', '  help      show this list', '  rm -rf /  fake filesystem wipe + recovery', '  Konami    ↑ ↑ ↓ ↓ ← → ← → B A toggles blueprint mode', '  sudo      permissions joke', '', 'No system commands are executed.']);
    } else if (command === 'rm -rf /') {
      setTerminalMode('rm');
      setTerminalLines(['$ rm -rf /']);
    } else if (command === 'clear') {
      setTerminalLines([]);
    } else {
      setTerminalLines((lines) => [...lines, `$ ${raw}`, `bash: ${command || '(empty command)'}: command not found`, 'Tip: type help to see the easter eggs.']);
    }
  };

  // The robot peeks after ten seconds, stays visible, then ducks back out after a short visit.
  useEffect(() => {
    let peekTimer;
    let hideTimer;
    let removeTimer;
    const reset = () => {
      window.clearTimeout(peekTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
      setRobotPeeked(false);
      if (idleRobot) {
        hideTimer = window.setTimeout(() => setIdleRobot(false), 700);
      }
      peekTimer = window.setTimeout(() => {
        setIdleRobot(true);
        setRobotPeeked(true);
        hideTimer = window.setTimeout(() => {
          setRobotPeeked(false);
          removeTimer = window.setTimeout(() => setIdleRobot(false), 750);
        }, 5000);
      }, 10000);
    };
    const events = ['mousemove', 'keydown', 'scroll', 'pointerdown', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    return () => {
      window.clearTimeout(peekTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, []);

  // Tab title: one per page, and a different one when you switch away.
  const baseTitle = page === 'Home' ? 'Matthew Castello | Computer Science, UC San Diego' : `${page} | Matthew Castello`;
  const titleRef = useRef(baseTitle);
  titleRef.current = baseTitle;
  useEffect(() => {
    document.title = document.hidden ? 'Come back, I was mid-thought' : baseTitle;
  }, [baseTitle]);
  useEffect(() => {
    const onVis = () => {
      document.title = document.hidden ? 'Come back, I was mid-thought' : titleRef.current;
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Highlight the grid square under the cursor, like someone's about to fill it in.
  useEffect(() => {
    const move = (e) => {
      if (!cell.current) return;
      const x = Math.floor(e.clientX / CELL) * CELL;
      const y = Math.floor((e.clientY + window.scrollY) / CELL) * CELL - window.scrollY;
      cell.current.style.transform = `translate(${x}px, ${y}px)`;
      cell.current.style.opacity = '1';
    };
    const leave = () => cell.current && (cell.current.style.opacity = '0');
    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Familjen+Grotesk:wght@500;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap');
        :root { --paper:#E8EDF1; --sheet:#F5F8FA; --ink:#14213D; --muted:#55627A; --pen:#B8322A; --red:#B8322A; --yellow:#E3A800; --blue:#2457C5; --green:#2E7D4F; --line:rgba(20,33,61,.08); --line-major:rgba(20,33,61,.17); --rule:rgba(20,33,61,.45); }
        .blueprint { --paper:#1B3A6B; --sheet:#224783; --ink:#EAF2FF; --muted:#A9C0E6; --pen:#FFD166; --red:#FF8A80; --yellow:#FFD166; --ink-note:1; --blue:#8CC0FF; --green:#7CE3A6; --line:rgba(234,242,255,.1); --line-major:rgba(234,242,255,.22); --rule:rgba(234,242,255,.6); }
        .paper {
          font-family: 'Source Serif 4', Georgia, serif;
          color: var(--ink); background-color: var(--paper);
          background-image:
            linear-gradient(var(--line-major) 1px, transparent 1px), linear-gradient(90deg, var(--line-major) 1px, transparent 1px),
            linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px);
          background-size: ${CELL * 5}px ${CELL * 5}px, ${CELL * 5}px ${CELL * 5}px, ${CELL}px ${CELL}px, ${CELL}px ${CELL}px;
          transition: background-color 600ms, color 600ms;
        }
        .font-display { font-family: 'Familjen Grotesk', system-ui, sans-serif; }
        .c-ink { color: var(--ink); } .c-muted { color: var(--muted); } .c-pen { color: var(--pen); }
        .decoration-pen { text-decoration-color: var(--pen); }
        .sheet { background: var(--sheet); border: 1px solid var(--rule); }
        .axis { height: 14px; border-left: 2px solid var(--ink); border-bottom: 2px solid var(--ink);
          background: repeating-linear-gradient(90deg, transparent 0 ${CELL - 2}px, var(--ink) ${CELL - 2}px ${CELL}px) bottom / 100% 6px no-repeat; width: 100%; }
        .pen-note { font-family: 'Caveat', cursive; font-size: 1.35rem; color: var(--pen); transform: rotate(-2deg); display: inline-block; }
        .circled { border: 2px solid var(--pen); border-radius: 55% 45% 50% 50% / 50% 55% 45% 50%; padding: 1px 12px; margin: -3px -12px; }
        .cursor-cell { position: fixed; left: 0; top: 0; width: ${CELL}px; height: ${CELL}px; background: var(--pen); opacity: 0; mix-blend-mode: multiply; pointer-events: none; z-index: 30; transition: transform 70ms linear, opacity 200ms; }
        .blueprint .cursor-cell { mix-blend-mode: screen; }
        .cursor-cell { filter: opacity(.16); }
        .tool-on { outline: 2px solid var(--pen); outline-offset: 3px; border-radius: 999px; }
        .robot-run { animation: drive 6s linear forwards; }
        .robot-peek { transform: translateX(84px); animation: peek-in 700ms ease-out forwards; }
        .robot-peek.robot-peek-out { animation: peek-out 700ms ease-in forwards; }
        .wheel { animation: spin .8s linear infinite; }
        @keyframes peek-in { from { transform: translateX(84px); } to { transform: translateX(24px); } }
        @keyframes peek-out { from { transform: translateX(24px); } to { transform: translateX(84px); } }
        @keyframes drive { from { transform: translateX(-100px); } to { transform: translateX(calc(100vw + 20px)); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rm-output { animation: terminal-glitch 900ms steps(2, end) infinite; }
        .safe-bottom { padding-bottom: max(.75rem, env(safe-area-inset-bottom)); }
        .safe-top { padding-top: max(.75rem, env(safe-area-inset-top)); }
        .terminal-input { font-size: 16px; }
        @media (max-width: 640px) {
          .portfolio-nav { margin-bottom: 2.5rem; gap: .5rem 1rem; }
          .portfolio-toolbar { bottom: max(.5rem, env(safe-area-inset-bottom)); max-height: 38dvh; overflow-y: auto; gap: .6rem 1rem; padding: .65rem .8rem; }
          .portfolio-toolbar button { min-height: 40px; }
          .terminal-panel { max-height: calc(100dvh - 2rem); overflow-y: auto; padding: 1rem; }
          .resume-frame { height: 68dvh; min-height: 360px; }
        }
        @media (hover: none) and (pointer: coarse) { .cursor-cell { display: none !important; } }
        .rm-progress { width: 0; animation: rm-progress 4.8s steps(24, end) forwards; }
        @keyframes rm-progress { to { width: 100%; } }
        @keyframes terminal-glitch { 0%, 100% { opacity: 1; transform: translateX(0); } 25% { opacity: .7; transform: translateX(2px); } 50% { opacity: 1; transform: translateX(-1px); } 75% { opacity: .85; } }
        a:focus-visible, button:focus-visible, iframe:focus-visible { outline: 2px solid var(--pen); outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) { .robot-run { animation-duration: .01s; } .wheel { animation: none; } }
      `}</style>

      <div className={`paper relative min-h-screen text-[17px] leading-[1.7] overflow-x-hidden ${blueprint ? 'blueprint' : ''}`}>
        <Sketch tool={tool} color={color} page={page} store={strokes} version={version} />
        <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-40 text-left">
          <nav className="portfolio-nav font-display flex flex-wrap gap-x-7 gap-y-2 text-[15px] mb-20" aria-label="Pages">
            {PAGES.map((p) => (
              <a
                key={p}
                href={`#${p.toLowerCase()}`}
                aria-current={p === page ? 'page' : undefined}
                className={p === page ? 'circled font-bold' : 'c-muted hover:text-[color:var(--ink)]'}
              >
                {p}
              </a>
            ))}
          </nav>

          <main>
            <Page />
          </main>
        </div>
      </div>

      <div ref={cell} className="cursor-cell" style={{ display: tool.kind === 'fill' ? 'block' : 'none', background: `var(--${color})` }} aria-hidden="true" />
      <Toolbar tool={tool} setTool={setTool} color={color} setColor={setColor} onUndo={undo} onClear={clear} />
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 sheet px-4 py-2 text-sm font-display">{toast}</div>}
      {idleRobot && !terminalMode && <div className={`fixed right-0 bottom-6 z-40 pointer-events-none ${robotPeeked ? 'robot-peek' : 'robot-peek robot-peek-out'}`}><IdleRobot /></div>}
      {terminalMode && (
        <div className="safe-top safe-bottom fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Terminal easter egg">
          <div className="terminal-panel w-full max-w-2xl bg-[#101510] text-[#a8f0a0] border border-[#557a50] p-5 font-mono text-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-[#557a50] pb-2">
              <span>{terminalMode === 'rm' ? 'root@portfolio: /' : 'matthew@portfolio:~'}</span>
              <button onClick={() => { setTerminalMode(''); setTerminalLines([]); setTerminalInput(''); }} className="text-[#d0e8ca] underline min-h-9 px-2">close</button>
            </div>
            <pre className={`whitespace-pre-wrap leading-7 ${terminalMode === 'rm' ? 'rm-output' : ''}`}>{terminalLines.join('\n')}</pre>
            {(terminalMode === 'terminal') && (
              <form className="mt-3 flex gap-2 items-center" onSubmit={(e) => {
                e.preventDefault();
                runTerminalCommand(terminalInput);
              }}>
                <label className="sr-only" htmlFor="terminal-command">Terminal command</label>
                <span aria-hidden="true">$</span>
                <input id="terminal-command" autoFocus value={terminalInput} onChange={setTerminalInput} className="terminal-input min-w-0 flex-1 bg-transparent outline-none text-[#a8f0a0]" aria-label="Terminal command" placeholder="type help" />
                <button type="submit" className="border border-[#557a50] px-3 py-1 min-h-9">Enter</button>
              </form>
            )}
            {terminalMode === 'rm' && (
              <div className="mt-4">
                <div className="h-2 border border-[#557a50] overflow-hidden"><div className="rm-progress h-full bg-[#a8f0a0]" /></div>
                <button onClick={() => { setTerminalMode(''); setTerminalLines([]); }} className="mt-3 border border-[#557a50] px-3 py-1">Restore portfolio</button>
              </div>
            )}
          </div>
        </div>
      )}
      {blueprint && !done && <Robot key={run} onDone={() => setDone(true)} />}
    </>
  );
}