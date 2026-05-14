import React, { useEffect, useRef, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Download,
  Target,
  BookOpen,
  Wrench,
  ShieldCheck,
  BrainCircuit,
  BarChart3,
  Cloud,
  FileText,
  CalendarDays,
  Sparkles,
  LogIn,
  LogOut,
  Loader2,
} from "lucide-react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";

const STORAGE_KEY = "radek_ai_transition_tracker_v2";

const months = [
  {
    id: "m1",
    title: "Month 1",
    short: "Python",
    theme: "Python literacy for AI workflow work",
    icon: BookOpen,
    accent: "from-sky-500 to-cyan-400",
    positioning:
      "Goal: read, modify, and assemble small Python scripts for files, JSON, and workflow tasks. Not developer-level Python.",
    outcome:
      "You can process files, understand simple scripts, debug basic errors, and build small utilities without panicking.",
    surface: [
      {
        id: "m1-r1",
        label: "Kaggle Learn: Python",
        url: "https://www.kaggle.com/learn/python",
        note: "Short, browser-based, interactive. Do the core lessons; ignore data-science framing where irrelevant.",
      },
      {
        id: "m1-r2",
        label: "Exercism Python Track",
        url: "https://exercism.org/tracks/python",
        note: "Use as friction: small exercises, feedback, repetition. Do not try to complete the whole track.",
      },
    ],
    tasks: [
      { id: "m1-t1", label: "Complete Kaggle Python lessons: Hello Python, Functions, Booleans, Lists, Loops, Strings/Dictionaries." },
      { id: "m1-t2", label: "Complete 10–15 Exercism Python exercises focused on basics, strings, lists, dicts, and conditionals." },
      { id: "m1-t3", label: "Create text_cleaner.py: read a .txt file, normalize whitespace, save output." },
      { id: "m1-t4", label: "Create json_reader.py: read JSON, extract fields, write a summary file." },
      { id: "m1-t5", label: "Create csv_filter.py: filter rows by condition and export a new CSV." },
      { id: "m1-t6", label: "Create term_checker.py: check whether required terminology appears in a text." },
      { id: "m1-t7", label: "Write a README explaining what each script does and what you learned." },
    ],
    artifact: {
      title: "python-workflow-basics",
      description:
        "A small repo of basic workflow scripts. Purpose: show practical scripting literacy, not software engineering elegance.",
      mustInclude: ["5–7 scripts", "README", "clear inputs/outputs", "simple examples", "notes on limitations"],
    },
    deep: [
      { label: "What to ignore", text: "OOP deep dives, algorithms, decorators, complex packaging, LeetCode, advanced CS. These are not your immediate bottleneck." },
      { label: "What to repeat until comfortable", text: "lists, dictionaries, functions, reading/writing files, JSON structures, tracebacks, simple print/log debugging." },
      { label: "Interview translation", text: "Do not say you are a Python developer. Say you can build and adapt small workflow scripts and understand where engineering support is needed." },
    ],
  },
  {
    id: "m2",
    title: "Month 2",
    short: "APIs",
    theme: "APIs, keys, JSON, and secure prototypes",
    icon: ShieldCheck,
    accent: "from-emerald-500 to-teal-400",
    positioning:
      "Goal: close the API/key-management gap and build a small LLM API workflow safely enough for prototype work.",
    outcome:
      "You can call an LLM API, handle secrets outside code, save structured output, log basic metadata, and explain prototype vs production security.",
    surface: [
      {
        id: "m2-r1",
        label: "DataCamp: Introduction to APIs in Python",
        url: "https://www.datacamp.com/courses/introduction-to-apis-in-python",
        note: "Hands-on API fundamentals: REST, headers, status codes, requests, JSON.",
      },
      {
        id: "m2-r2",
        label: "Dataquest: APIs and Web Scraping in Python",
        url: "https://www.dataquest.io/course/apis-and-web-scraping-in-python-for-data-science/",
        note: "Alternative if Dataquest style fits better. Pick one primary course, not both unless reinforcement is needed.",
      },
      {
        id: "m2-r3",
        label: "Codecademy: Environment Variables / API Keys",
        url: "https://www.codecademy.com/learn/fscp-22-data-security/modules/wdcp-22-managing-environment-variables-api-keys-files/cheatsheet",
        note: "Short targeted reference for .env, API keys, and avoiding hardcoded secrets.",
      },
    ],
    tasks: [
      { id: "m2-t1", label: "Complete one interactive API course module set: requests, headers, status codes, JSON responses." },
      { id: "m2-t2", label: "Create a .env file locally and a safe .env.example for GitHub." },
      { id: "m2-t3", label: "Add .gitignore and verify secrets are not committed." },
      { id: "m2-t4", label: "Build script: input text file → LLM API → structured JSON output." },
      { id: "m2-t5", label: "Add basic logging: timestamp, file name, model, status, error if any." },
      { id: "m2-t6", label: "Add minimal retry/error handling for failed API calls." },
      { id: "m2-t7", label: "Write README section: prototype secrets handling vs production secrets handling." },
    ],
    artifact: {
      title: "secure-llm-api-prototype",
      description:
        "A small but serious prototype that shows API literacy, safe key handling, structured output, and implementation maturity.",
      mustInclude: [".env.example", ".gitignore", "requests/API call", "structured JSON output", "logs", "security notes", "cost/token note if available"],
    },
    deep: [
      { label: "Production answer to memorize", text: "For production, keys should live in a managed secrets service such as Azure Key Vault or equivalent, access should be role-based and scoped, keys should be rotated, usage should be monitored, and secrets should never be hardcoded or committed." },
      { label: "Know these HTTP basics", text: "401 = authentication problem, 403 = permission problem, 429 = rate limit, 500-class = server-side failure. You do not need deep networking yet." },
      { label: "Scope control", text: "Do not drift into cybersecurity. Your target is implementation literacy: know the risks, basic mitigations, and when IT/security owns the deeper layer." },
    ],
  },
  {
    id: "m3",
    title: "Month 3",
    short: "M365",
    theme: "Microsoft 365, Copilot Studio, and enterprise readiness",
    icon: Cloud,
    accent: "from-indigo-500 to-violet-500",
    positioning:
      "Goal: become credible in Copilot rollout conversations without pretending to be a Microsoft admin.",
    outcome:
      "You can discuss Copilot readiness, SharePoint/OneDrive data hygiene, permissions, Purview/DLP concepts, pilot design, and adoption metrics.",
    surface: [
      { id: "m3-r1", label: "Microsoft Learn: Create agents in Copilot Studio", url: "https://learn.microsoft.com/pl-pl/training/paths/create-extend-custom-copilots-microsoft-copilot-studio/", note: "Official path for creating custom agents in Copilot Studio." },
      { id: "m3-r2", label: "Microsoft Learn: Create your first agent in Copilot Studio", url: "https://learn.microsoft.com/en-us/training/modules/create-copilots-copilot-studio/", note: "Beginner module for building and deploying a simple agent." },
      { id: "m3-r3", label: "Copilot Studio Agent Academy", url: "https://microsoft.github.io/agent-academy/", note: "Open training program for Copilot Studio agents, from beginner to production-oriented patterns." },
      { id: "m3-r4", label: "Microsoft Purview overview", url: "https://learn.microsoft.com/en-us/purview/", note: "Use for governance vocabulary: data protection, compliance, data security." },
      { id: "m3-r5", label: "Purview information protection and DLP path", url: "https://learn.microsoft.com/en-us/training/paths/purview-implement-information-protection-data-loss-prevention/", note: "Sensitivity labels, DLP, protection concepts." },
      { id: "m3-r6", label: "DLP for Microsoft 365 Copilot interactions", url: "https://learn.microsoft.com/en-us/purview/dlp-microsoft365-copilot-location-learn-about", note: "Very relevant for AI governance in M365 environments." },
    ],
    tasks: [
      { id: "m3-t1", label: "Complete beginner Copilot Studio module and create one simple test agent." },
      { id: "m3-t2", label: "Complete at least one Copilot Studio learning path section on topics/actions/variables." },
      { id: "m3-t3", label: "Study Purview concepts: sensitivity labels, DLP, retention, data access." },
      { id: "m3-t4", label: "Draft Copilot rollout risks: oversharing, permission sprawl, bad SharePoint structure, unclear ownership." },
      { id: "m3-t5", label: "Create a pilot design: 10–20 users, 3 use cases, training plan, measurement plan." },
      { id: "m3-t6", label: "Create a prompt library template: use case, prompt, expected output, review rule, owner." },
      { id: "m3-t7", label: "Write the Copilot readiness checklist as a polished artifact." },
    ],
    artifact: {
      title: "Microsoft 365 Copilot Readiness Checklist",
      description: "A practical rollout/governance document for mid-sized companies beginning AI adoption.",
      mustInclude: ["data readiness", "SharePoint/OneDrive", "permissions", "Purview/DLP", "pilot group", "training", "prompt library", "adoption metrics", "rollout gates"],
    },
    deep: [
      { label: "Your lane", text: "You are not trying to become the tenant admin. You are learning enough to coordinate implementation, ask the right questions, and avoid naive rollout advice." },
      { label: "Strong interview angle", text: "Before launching Copilot, I would check data readiness, permission hygiene, sensitive data handling, pilot scope, training, metrics, and escalation paths." },
      { label: "Mid-market value", text: "Many companies need someone who can bridge business users and IT. This month directly supports that positioning." },
    ],
  },
  {
    id: "m4",
    title: "Month 4",
    short: "RAG",
    theme: "RAG and internal document systems",
    icon: BrainCircuit,
    accent: "from-fuchsia-500 to-pink-500",
    positioning: "Goal: understand and demonstrate RAG as an internal-knowledge pattern, not a buzzword.",
    outcome: "You can build a basic policy/document assistant with retrieval, source grounding, escalation logic, and an evaluation plan.",
    surface: [
      { id: "m4-r1", label: "DeepLearning.AI: Retrieval Augmented Generation", url: "https://www.deeplearning.ai/courses/retrieval-augmented-generation", note: "Good conceptual intro: retrievers, vector DBs, external data, RAG architecture." },
      { id: "m4-r2", label: "DeepLearning.AI: Building and Evaluating Advanced RAG Applications", url: "https://www.deeplearning.ai/short-courses/building-evaluating-advanced-rag/", note: "Use for context relevance, groundedness, answer relevance — strong fit for your QA instincts." },
      { id: "m4-r3", label: "LangChain Academy", url: "https://academy.langchain.com/", note: "Use selectively after you understand concepts. Do not over-identify with a framework." },
    ],
    tasks: [
      { id: "m4-t1", label: "Complete core RAG course material: embeddings, chunking, vector search, retrieval." },
      { id: "m4-t2", label: "Write a one-page explanation: when to use RAG and when not to." },
      { id: "m4-t3", label: "Create 10–20 mock internal policy documents." },
      { id: "m4-t4", label: "Build a simple ingestion script: documents → chunks → embeddings → vector store." },
      { id: "m4-t5", label: "Build a query flow: question → retrieval → answer with source snippets." },
      { id: "m4-t6", label: "Add escalation behavior: insufficient evidence → human review." },
      { id: "m4-t7", label: "Document retrieval limitations and privacy assumptions." },
    ],
    artifact: {
      title: "policy-rag-assistant",
      description: "A practical internal-policy assistant using mock data, with source-grounded answers and escalation logic.",
      mustInclude: ["mock documents", "chunking notes", "vector store", "source citations/snippets", "limitations", "evaluation plan", "human escalation"],
    },
    deep: [
      { label: "Strong RAG answer", text: "Use RAG when the model needs large, changing, private, domain-specific knowledge that cannot fit in the prompt and should be source-grounded. Do not use it where direct database/API access or deterministic rules are better." },
      { label: "Avoid framework trap", text: "If LangChain makes the build easier, use it. But be able to explain what happens underneath: chunk, embed, retrieve, rank, generate, evaluate." },
      { label: "Your advantage", text: "Your translation/document background gives you sensitivity to ambiguity, terminology, source grounding, and quality — exactly what many RAG demos lack." },
    ],
  },
  {
    id: "m5",
    title: "Month 5",
    short: "Metrics",
    theme: "Evaluation, observability, and AI workflow metrics",
    icon: BarChart3,
    accent: "from-amber-500 to-orange-400",
    positioning: "Goal: become stronger than most candidates on the question: how do we know this AI workflow actually works?",
    outcome: "You can design evaluation methods for quality, cost, time saved, adoption, failure categories, and rollout gates.",
    surface: [
      { id: "m5-r1", label: "DeepLearning.AI: Building and Evaluating Advanced RAG Applications", url: "https://www.deeplearning.ai/short-courses/building-evaluating-advanced-rag/", note: "If not completed in Month 4, complete here. Focus on relevance, groundedness, answer quality." },
      { id: "m5-r2", label: "Arize: LLM Observability Certification", url: "https://arize.com/llm-certification/", note: "Short certification-style path for LLM evaluation and observability concepts." },
      { id: "m5-r3", label: "Arize Phoenix", url: "https://github.com/arize-ai/phoenix", note: "Open-source observability/evaluation tool. You only need exposure and one small experiment." },
    ],
    tasks: [
      { id: "m5-t1", label: "Define baseline metrics for one workflow: time, cost, quality, error rate." },
      { id: "m5-t2", label: "Define AI-assisted metrics: acceptance rate, edit rate, escalation rate, cost per task." },
      { id: "m5-t3", label: "Create a failure taxonomy: hallucination, missing context, wrong source, formatting error, policy risk." },
      { id: "m5-t4", label: "Design a shadow-mode evaluation process comparing human-only vs AI-assisted outputs." },
      { id: "m5-t5", label: "Add simple logging/cost tracking to one previous prototype." },
      { id: "m5-t6", label: "Sketch a dashboard table for decision-makers." },
      { id: "m5-t7", label: "Write go/no-go rollout criteria for a pilot." },
    ],
    artifact: {
      title: "ai-workflow-evaluation-framework",
      description: "A reusable framework for measuring AI workflow value, safety, reliability, and rollout readiness.",
      mustInclude: ["baseline", "shadow process", "quality metrics", "cost metrics", "time saved", "failure categories", "HITL rules", "rollout gates", "dashboard mockup"],
    },
    deep: [
      { label: "Your strongest niche", text: "Evaluation is where your QA/localisation instincts become AI implementation value. Many candidates can demo tools; fewer can define whether the system should be trusted." },
      { label: "Board-level framing", text: "Do not present model metrics alone. Present business metrics: time saved, cost avoided, error reduction, adoption, risk controls, rollout decision gates." },
      { label: "Avoid perfectionism", text: "A simple, clear evaluation framework beats a complex metric jungle. Start with metrics a manager can understand." },
    ],
  },
  {
    id: "m6",
    title: "Month 6",
    short: "Package",
    theme: "FastAPI/light deployment and portfolio packaging",
    icon: Wrench,
    accent: "from-slate-700 to-slate-500",
    positioning: "Goal: expose one AI workflow as a simple service and package your portfolio into a coherent market story.",
    outcome: "You can show that you understand how AI workflows become internal tools, not just scripts or diagrams.",
    surface: [
      { id: "m6-r1", label: "FastAPI official docs", url: "https://fastapi.tiangolo.com/", note: "Use only the essentials: endpoints, JSON in/out, local run, simple error handling." },
      { id: "m6-r2", label: "DataCamp: Building APIs in Python track", url: "https://www.datacamp.com/tracks/building-apis-in-python", note: "Optional if you want structured hands-on API/FastAPI practice." },
      { id: "m6-r3", label: "Real Python: Python requests course", url: "https://realpython.com/courses/python-requests/", note: "Optional reinforcement if HTTP/API basics still feel shaky." },
    ],
    tasks: [
      { id: "m6-t1", label: "Build a minimal FastAPI app locally." },
      { id: "m6-t2", label: "Create endpoint: /classify-document." },
      { id: "m6-t3", label: "Create endpoint: /summarize-document." },
      { id: "m6-t4", label: "Create endpoint: /evaluate-output." },
      { id: "m6-t5", label: "Connect one endpoint to a previous LLM workflow." },
      { id: "m6-t6", label: "Write README: what is prototype-level, what production would require." },
      { id: "m6-t7", label: "Rewrite GitHub landing README as a portfolio, not a storage folder." },
      { id: "m6-t8", label: "Update CV positioning and prepare 60-second interview narrative." },
    ],
    artifact: {
      title: "llm-workflow-api + portfolio package",
      description: "A simple API wrapper around an AI workflow plus a cleaned-up portfolio narrative tying all artifacts together.",
      mustInclude: ["FastAPI app", "3 simple endpoints", "README", "prototype/production distinction", "portfolio landing page", "CV update", "interview narrative"],
    },
    deep: [
      { label: "Do not become a backend developer", text: "Learn enough to expose workflows as services and communicate with IT. Avoid full-stack rabbit holes." },
      { label: "Portfolio headline", text: "Practical AI workflow implementation: documents, governance, RAG, evaluation, and adoption." },
      { label: "60-second narrative", text: "My background is in localisation, technical communication, and workflow ownership. I moved into practical AI implementation by building production AI-assisted document workflows, then expanded into orchestration, RAG, governance, and adoption. I am not positioning myself as an ML engineer; my strength is translating business processes into safe, measurable AI workflows." },
    ],
  },
];

const interviewQuestions = [
  {
    q: "How would you handle API keys in production?",
    a: "For a prototype I can use environment variables and .env files kept out of Git. For production, secrets should live in a managed vault such as Azure Key Vault or an equivalent service, with role-based access, scoped permissions, rotation, usage monitoring, and audit logs. Keys should never be hardcoded in workflows or repositories.",
  },
  {
    q: "When would you use RAG?",
    a: "When the model needs access to large, changing, private, domain-specific knowledge that cannot fit in the prompt and should be source-grounded. Examples: company policies, manuals, internal procedures, contracts. I would not use RAG where a database query, deterministic rule, or direct API integration is more reliable.",
  },
  {
    q: "Where does automation end and agentic workflow begin?",
    a: "Automation follows predefined deterministic steps. Agentic workflows introduce bounded decision-making: tool selection, planning small steps, or choosing paths within constraints. I would only use agents for bounded tasks with limited decision authority, logging, escalation rules, and HITL gates where risk is material.",
  },
  {
    q: "How would you prove ROI?",
    a: "Start with a baseline: time, cost, error rate, throughput. Run AI in shadow mode where possible, compare against human-only process, track time saved, cost per task, acceptance/edit rate, escalation rate, and failure categories. Only roll out when quality and risk thresholds are met.",
  },
  {
    q: "What is your technical boundary?",
    a: "I can analyse workflows, prototype AI solutions, use APIs, design evaluation and adoption, and coordinate implementation. I am not positioning myself as an infrastructure engineer; for server, identity, security, and production infrastructure layers, I work with IT and ensure the implementation requirements are clear.",
  },
];

const EMPTY_STATE = { done: {}, notes: {}, activeMonth: "m1" };

function loadLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

function ProgressBar({ value, accent = "from-sky-500 to-cyan-400" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${accent} transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm shadow-slate-200/60 backdrop-blur">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <h3 className="text-sm font-semibold tracking-tight text-slate-900 md:text-base">{title}</h3>
        <span className="rounded-full bg-slate-100 p-1 text-slate-500">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function ChecklistItem({ item, checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`group flex w-full gap-3 rounded-2xl px-3 py-3 text-left transition ${
        checked ? "bg-emerald-50/70" : "hover:bg-slate-50"
      }`}
    >
      <span className={`mt-0.5 ${checked ? "text-emerald-600" : "text-slate-300 group-hover:text-slate-500"}`}>
        {checked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </span>
      <span className={`text-sm leading-6 ${checked ? "text-slate-500 line-through" : "text-slate-700"}`}>
        {item.label}
      </span>
    </button>
  );
}

export default function App() {
  const [state, setState] = useState(loadLocalState);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const stateRef = useRef(state);
  const saveTimer = useRef(null);

  stateRef.current = state;

  // Listen to auth state and load/upload Firestore data on sign-in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setSyncing(true);
        try {
          const ref = doc(db, "users", firebaseUser.uid, "data", "progress");
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const cloudState = snap.data();
            setState(cloudState);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudState));
          } else {
            // First sign-in: upload existing local progress
            await setDoc(ref, stateRef.current);
          }
        } catch (err) {
          console.error("Firestore load error:", err);
        } finally {
          setSyncing(false);
        }
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Save to localStorage and Firestore on every state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!user) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const ref = doc(db, "users", user.uid, "data", "progress");
      setDoc(ref, state).catch((err) => console.error("Firestore save error:", err));
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [state, user]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Sign-in error:", err);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const allTaskIds = useMemo(() => months.flatMap((m) => m.tasks.map((t) => t.id)), []);
  const completedCount = allTaskIds.filter((id) => state.done[id]).length;
  const totalCount = allTaskIds.length;
  const overall = Math.round((completedCount / totalCount) * 100);

  const activeMonth = months.find((m) => m.id === state.activeMonth) || months[0];
  const Icon = activeMonth.icon;
  const activeTasksDone = activeMonth.tasks.filter((t) => state.done[t.id]).length;
  const activeProgress = Math.round((activeTasksDone / activeMonth.tasks.length) * 100);

  const toggle = (id) => setState((prev) => ({ ...prev, done: { ...prev.done, [id]: !prev.done[id] } }));
  const setNote = (monthId, value) =>
    setState((prev) => ({ ...prev, notes: { ...prev.notes, [monthId]: value } }));

  const reset = () => {
    if (confirm("Reset all progress and notes?")) {
      localStorage.removeItem(STORAGE_KEY);
      const empty = EMPTY_STATE;
      setState(empty);
      if (user) {
        const ref = doc(db, "users", user.uid, "data", "progress");
        setDoc(ref, empty).catch(console.error);
      }
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-transition-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!imported || typeof imported !== "object") throw new Error("Invalid file.");
        const safeState = {
          done: imported.done && typeof imported.done === "object" ? imported.done : {},
          notes: imported.notes && typeof imported.notes === "object" ? imported.notes : {},
          activeMonth: months.some((m) => m.id === imported.activeMonth) ? imported.activeMonth : "m1",
        };
        setState(safeState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState));
        alert("Progress imported successfully.");
      } catch {
        alert("Could not import progress. Make sure this is a valid exported JSON file.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#f8fafc_34%,#f8fafc_100%)] text-slate-900">
      <header className="border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-7 md:py-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                <Sparkles size={14} className="text-sky-500" /> Private learning dashboard
              </div>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                AI implementation transition tracker
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                Six months of focused work: technical credibility, enterprise AI plumbing, RAG, evaluation, and portfolio proof — without drifting into developer cosplay.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={exportJson}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Download size={16} /> Export
              </button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <Download size={16} className="rotate-180" /> Import
                <input type="file" accept="application/json,.json" onChange={importJson} className="hidden" />
              </label>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <RotateCcw size={16} /> Reset
              </button>

              {/* Auth button */}
              {!authReady ? (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              ) : user ? (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
                  {syncing ? (
                    <Loader2 size={16} className="animate-spin text-sky-500" />
                  ) : (
                    <img src={user.photoURL} alt="" className="h-5 w-5 rounded-full" />
                  )}
                  <span className="hidden sm:inline">{user.displayName?.split(" ")[0]}</span>
                  <button
                    onClick={handleSignOut}
                    className="ml-1 text-slate-400 transition hover:text-slate-700"
                    title="Sign out"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-md"
                >
                  <LogIn size={16} /> Sign in to sync
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 rounded-3xl border border-white/80 bg-white/70 p-4 shadow-sm shadow-slate-200/70 md:grid-cols-[1fr_180px] md:items-center">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
                <span>Overall progress</span>
                <span>{completedCount}/{totalCount} tasks</span>
              </div>
              <ProgressBar value={overall} accent="from-sky-500 to-violet-500" />
            </div>
            <div className="text-left md:text-right">
              <div className="text-3xl font-semibold tracking-tight text-slate-950">{overall}%</div>
              <div className="text-xs text-slate-500">complete</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          {months.map((m) => {
            const done = m.tasks.filter((t) => state.done[t.id]).length;
            const pct = Math.round((done / m.tasks.length) * 100);
            const MIcon = m.icon;
            const active = state.activeMonth === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setState((prev) => ({ ...prev, activeMonth: m.id }))}
                className={`w-full rounded-3xl border p-4 text-left shadow-sm transition duration-200 ${
                  active
                    ? "border-slate-300 bg-white shadow-slate-200/80"
                    : "border-white/80 bg-white/60 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-2xl bg-gradient-to-br ${m.accent} p-2.5 text-white shadow-sm`}>
                    <MIcon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-900">{m.title}</div>
                      <div className="text-xs font-medium text-slate-400">{pct}%</div>
                    </div>
                    <div className="truncate text-xs text-slate-500">{m.short}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={pct} accent={m.accent} />
                </div>
                <div className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600">{m.theme}</div>
              </button>
            );
          })}
        </aside>

        <section className="space-y-5">
          <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-sm shadow-slate-200/70">
            <div className={`h-1.5 bg-gradient-to-r ${activeMonth.accent}`} />
            <div className="p-6 md:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    <Icon size={14} /> {activeMonth.title}
                  </div>
                  <h2 className="max-w-3xl text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                    {activeMonth.theme}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{activeMonth.positioning}</p>
                </div>
                <div className="min-w-[190px] rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Month progress</div>
                  <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{activeProgress}%</div>
                  <div className="mt-3"><ProgressBar value={activeProgress} accent={activeMonth.accent} /></div>
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/80 p-5">
                <div className="flex gap-3">
                  <div className={`h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br ${activeMonth.accent} p-2.5 text-white`}>
                    <Target size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-950">Expected outcome</div>
                    <p className="mt-1 text-sm leading-7 text-slate-600">{activeMonth.outcome}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_370px]">
            <div className="space-y-5">
              <Section title="Primary resources">
                <div className="grid gap-3">
                  {activeMonth.surface.map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group block rounded-3xl border border-slate-100 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md hover:shadow-slate-200/60"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-slate-900">{r.label}</div>
                        <div className="rounded-full bg-white p-2 text-slate-400 transition group-hover:text-slate-700">
                          <ExternalLink size={15} />
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{r.note}</p>
                    </a>
                  ))}
                </div>
              </Section>

              <Section title="Action checklist">
                <div className="space-y-1">
                  {activeMonth.tasks.map((t) => (
                    <ChecklistItem key={t.id} item={t} checked={!!state.done[t.id]} onToggle={() => toggle(t.id)} />
                  ))}
                </div>
              </Section>

              <Section title="Deeper notes and guardrails" defaultOpen={false}>
                <div className="grid gap-3">
                  {activeMonth.deep.map((d, idx) => (
                    <div key={idx} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                      <div className="font-semibold text-slate-900">{d.label}</div>
                      <p className="mt-1 text-sm leading-7 text-slate-600">{d.text}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm shadow-slate-200/70 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileText size={18} /> Monthly artifact
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{activeMonth.artifact.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{activeMonth.artifact.description}</p>
                <div className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-400">Must include</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeMonth.artifact.mustInclude.map((x, idx) => (
                    <span key={idx} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                      {x}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm shadow-slate-200/70 backdrop-blur">
                <div className="text-sm font-semibold text-slate-900">Private notes for {activeMonth.title}</div>
                <textarea
                  value={state.notes[activeMonth.id] || ""}
                  onChange={(e) => setNote(activeMonth.id, e.target.value)}
                  placeholder="What did you learn? What was hard? What should become a portfolio item?"
                  className="mt-3 min-h-[180px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>
            </div>
          </div>

          <Section title="Interview answer bank" defaultOpen={false}>
            <div className="grid gap-3">
              {interviewQuestions.map((item, idx) => (
                <div key={idx} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="font-semibold text-slate-900">{item.q}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.a}</p>
                </div>
              ))}
            </div>
          </Section>
        </section>
      </main>
    </div>
  );
}
