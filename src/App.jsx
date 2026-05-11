import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mtjthyjyzlfjmxefgqnq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1Vjg0GBeHL1ucCBETI5nOg_Vb3aMkHY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Default Kingdom House Data ───────────────────────────────────────────────
const DEFAULT_IDENTITY = null;

const DEFAULT_PEOPLE = [];

const DEFAULT_GAPS = "";

// ─── API Helper ───────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
  });
  const raw = await res.text();
  const data = JSON.parse(raw);
  return data.content?.map(i => i.text || "").join("") || "";
}

// ─── UI Primitives ─────────────────────────────────────────────────────────────
const MONO = "'DM Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";
const BODY = "'Inter', sans-serif";

function Label({ c, children }) {
  return <p style={{ fontSize: 9, fontFamily: MONO, color: c || "var(--accent)", textTransform: "uppercase", letterSpacing: 2.5, margin: "0 0 8px", fontWeight: 500 }}>{children}</p>;
}

function Card({ children, accent, warn, style: s }) {
  return (
    <div style={{
      background: warn ? "var(--danger-dim)" : accent ? "var(--accent-dim)" : "var(--surface)",
      border: `1px solid ${warn ? "var(--danger-border)" : accent ? "var(--accent-border)" : "var(--border)"}`,
      borderLeft: accent ? "3px solid var(--accent)" : warn ? "3px solid var(--danger)" : undefined,
      borderRadius: 6, padding: 20, marginBottom: 12,
      boxShadow: warn || accent ? "none" : "0 1px 4px rgba(44,37,31,0.06)",
      ...s
    }}>{children}</div>
  );
}

function Tag({ children, color }) {
  return <span style={{ padding: "2px 10px", borderRadius: 3, background: `${color}18`, border: `1px solid ${color}30`, color, fontSize: 9, fontFamily: MONO, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 500 }}>{children}</span>;
}

function Btn({ children, onClick, secondary, small, disabled, danger }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: small ? "5px 12px" : "10px 20px",
      background: disabled ? "rgba(225,223,211,0.04)" : danger ? "var(--danger-dim)" : secondary ? "transparent" : "var(--accent)",
      border: danger ? "1px solid var(--danger-border)" : secondary ? "1px solid var(--border-strong)" : "none",
      borderRadius: 4, color: disabled ? "rgba(225,223,211,0.2)" : danger ? "var(--danger)" : secondary ? "var(--taupe)" : "#1C1813",
      fontFamily: DISPLAY, fontSize: small ? 9 : 10, letterSpacing: 0.5,
      textTransform: "uppercase", cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600,
      transition: "opacity 0.15s ease"
    }}>{children}</button>
  );
}

function Bar({ v, color }) {
  return (
    <div style={{ height: 2, background: "var(--border)", borderRadius: 1 }}>
      <div style={{ width: `${Math.min(v, 100)}%`, height: "100%", background: color || "var(--accent)", borderRadius: 1, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}


function Animated({ children, delay = 0 }) {
  return (
    <div style={{ animation: `fadeUp 0.4s cubic-bezier(0.4,0,0.2,1) ${delay}ms both` }}>
      {children}
    </div>
  );
}

const scoreColor = s => s >= 80 ? "#2EC4B6" : s >= 60 ? "#F26751" : "#CC5A4A";
const scoreLabel = s => s >= 80 ? "Clear" : s >= 60 ? "Developing" : "Critical";

// ─── Identity View ─────────────────────────────────────────────────────────────
function IdentityView({ data, onEdit }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Btn secondary small onClick={onEdit}>✏ Edit Identity</Btn>
      </div>
      <Animated delay={0}><Card accent>
        <Label>Mission</Label>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif", margin: "-2px 0 10px", lineHeight: 1.55 }}>Why your organization exists — the thing you're always striving toward but will never fully achieve.</p>
        <p style={{ fontSize: 16, lineHeight: 1.9, color: "var(--text-primary)", margin: 0, fontFamily: DISPLAY }}>{data.mission}</p>
      </Card></Animated>

      <Animated delay={60}><div className="px-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, padding: 20 }}>
          <Label>North Star Vision</Label>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif", margin: "-2px 0 10px", lineHeight: 1.55 }}>Where is your organization ultimately headed? Your long-term picture of the future.</p>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--text-primary)", margin: 0, fontFamily: DISPLAY }}>{data.vision_north}</p>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, padding: 20 }}>
          <Label>Phase 1 Vision</Label>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif", margin: "-2px 0 10px", lineHeight: 1.55 }}>What does success look like in your next major chapter? A specific timeframe with measurable outcomes.</p>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--text-primary)", margin: 0, fontFamily: DISPLAY }}>{data.vision_phase}</p>
        </div>
      </div></Animated>
      <Animated delay={180}>
        <Label>Core Values</Label>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif", margin: "-2px 0 10px", lineHeight: 1.55 }}>The non-negotiable principles that guide how your team makes decisions and operates.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }} className="px-grid-2">
          {data.values.map((v, i) => (
            <Animated key={i} delay={180 + i * 40}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)", padding: 18 }}>
                <p style={{ fontSize: 11, fontFamily: MONO, color: "var(--accent)", margin: "0 0 8px", fontWeight: 500, letterSpacing: 0.5 }}>{v.name}</p>
                <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0, lineHeight: 1.7, fontFamily: DISPLAY }}>{v.desc}</p>
              </div>
            </Animated>
          ))}
        </div>
      </Animated>
      <Animated delay={280}><Card accent>
        <Label>Positioning Statement</Label>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif", margin: "-2px 0 10px", lineHeight: 1.55 }}>Who do you serve, what do you uniquely offer, and why would someone choose you over the alternatives?</p>
        <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--text-primary)", margin: 0, fontFamily: DISPLAY }}>{data.positioning}</p>
      </Card></Animated>
    </div>
  );
}

// ─── Identity Edit ─────────────────────────────────────────────────────────────
function IdentityEdit({ data, onSave, onCancel, isSetup, orgName, orgType, onMavenApply }) {
  const [d, setD] = useState({ ...data, values: data.values.map(v => ({ ...v })) });
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  const setVal = (i, k, v) => setD(p => ({ ...p, values: p.values.map((val, idx) => idx === i ? { ...val, [k]: v } : val) }));
  const ta = { width: "100%", padding: "11px 13px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-primary)", fontFamily: BODY, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" };
  const inp = { ...ta, minHeight: "auto", resize: "none" };
  const canSave = d.mission.trim().length > 5;
  const [showMaven, setShowMaven] = useState(false);

  const applyMaven = (drafts) => {
    setD(prev => ({
      ...prev,
      ...(drafts.mission ? { mission: drafts.mission } : {}),
      ...(drafts.vision_north ? { vision_north: drafts.vision_north } : {}),
      ...(drafts.vision_phase ? { vision_phase: drafts.vision_phase } : {}),
      ...(drafts.values && Array.isArray(drafts.values) && drafts.values.length > 0 ? { values: drafts.values } : {}),
      ...(drafts.positioning ? { positioning: drafts.positioning } : {}),
    }));
    setShowMaven(false);
    if (onMavenApply) onMavenApply(drafts);
  };

  return (
    <>
    {showMaven && <MavenPanel identity={d} orgName={orgName} orgType={orgType} onApply={applyMaven} onClose={() => setShowMaven(false)} />}
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h3 style={{ color: "var(--text-primary)", fontFamily: DISPLAY, fontWeight: 600, fontSize: 20, margin: "0 0 4px" }}>
            {isSetup ? "Define Your Identity" : "Editing Identity Layer"}
          </h3>
          {isSetup && <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0, fontFamily: DISPLAY }}>This is the foundation of your operating system. Fill in what you know — you can refine it anytime.</p>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn secondary small onClick={() => setShowMaven(true)} style={{ background: "rgba(242,103,81,0.1)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}>✦ Ask Maven</Btn>
          {onCancel && <Btn secondary small onClick={onCancel}>Cancel</Btn>}
          <Btn small onClick={() => onSave(d)} disabled={!canSave}>{isSetup ? "Save & Continue →" : "Save Changes ✓"}</Btn>
        </div>
      </div>

      {[
        ["Mission", "mission", 80, "Why does your organization exist? The thing you're always striving toward but will never fully achieve."],
        ["North Star Vision", "vision_north", 80, "Where is your organization ultimately headed? Your long-term picture of the future, 10–20 years out."],
        ["Phase 1 Vision", "vision_phase", 100, "What does success look like in your next major chapter? Set a specific timeframe and measurable outcomes."],
        ["Positioning Statement", "positioning", 120, "Who do you serve, what do you uniquely offer, and why would someone choose you over the alternatives?"],
      ].map(([label, key, h, explainer]) => (
        <div key={key} style={{ marginBottom: 18 }}>
          <Label>{label}</Label>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif", margin: "-2px 0 8px", lineHeight: 1.55 }}>{explainer}</p>
          <textarea value={d[key] || ""} onChange={e => set(key, e.target.value)} style={{ ...ta, minHeight: h }} />
        </div>
      ))}

      <Label>Core Values</Label>
      <p style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif", margin: "-2px 0 12px", lineHeight: 1.55 }}>The non-negotiable principles that guide how your team makes decisions and operates.</p>
      {d.values.map((v, i) => (
        <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)", padding: 14, marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }} className="px-grid-2">
            <div>
              <Label>Value Name</Label>
              <input value={v.name} onChange={e => setVal(i, "name", e.target.value)} style={inp} />
            </div>
            <div>
              <Label>Description</Label>
              <textarea value={v.desc} onChange={e => setVal(i, "desc", e.target.value)} style={{ ...ta, minHeight: 70 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </>
  );
}

// ─── People View ───────────────────────────────────────────────────────────────
function EmptyPeopleState({ onAdd }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.4 }}>◎</div>
      <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 20, color: "var(--text-primary)", margin: "0 0 10px" }}>Build Your Team</h3>
      <p style={{ fontFamily: BODY, fontSize: 14, color: "var(--text-secondary)", margin: "0 0 28px", maxWidth: 380, lineHeight: 1.7 }}>
        Add your team members, define their roles, and establish ownership. This is where clarity begins.
      </p>
      <Btn onClick={onAdd}>Add First Role →</Btn>
    </div>
  );
}

function PeopleView({ people, gaps, orgName, orgType, identity, onUpdateRole, onUpdateGaps, onAddRole, onRemoveRole }) {
  const tc = { pastor: "#F26751", support: "#A87EC8", director: "var(--accent)", leader: "var(--accent)", vacant: "#CC5A4A", coordinator: "#7EB8C8" };
  const [grades, setGrades] = useState({});
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState("");
  const [editDraft, setEditDraft] = useState(null);
  const [recs, setRecs] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");
  const [needsInfo, setNeedsInfo] = useState(null);
  const [extraInfo, setExtraInfo] = useState("");
  const [addingRole, setAddingRole] = useState(people.length === 1 && people[0].name === "");
  const [newRole, setNewRole] = useState(people.length === 1 && people[0].name === "" ? { ...people[0] } : { type: "leader", name: "", role: "", owns: "", winning: "", reports: "", vacant: false });

  const roleTypes = ["leader", "director", "coordinator", "support", "pastor"];
  const inp = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontFamily: BODY, fontSize: 13, outline: "none", boxSizing: "border-box" };


  const gradePeople = async () => {
    setGrading(true); setGradeError("");
    const gradeable = people.filter(p => !(p.vacant === true || p.type === "vacant"));
    const prompt = `You are an organizational clarity expert grading role definitions for ${orgName || "an organization"} (${orgType || "Organization"}) in a business operating system.

Grade each role 0-100 on: specificity of ownership, clarity of what winning looks like, and appropriateness of scope. Reference what's typical and healthy for a ${orgType || "organization"} — use real benchmarks from high-performing ${orgType || "organizations"} in your feedback.

Roles:
${gradeable.map((p, i) => `${i + 1}. ${p.role} (${p.name})\n   Owns: "${p.owns}"${p.winning ? `\n   Winning looks like: "${p.winning}"` : ""}\n   Reports to: ${p.reports}`).join("\n")}

Return ONLY a raw JSON array, no markdown, no backticks:
[{"role": "exact role name", "score": 85, "feedback": "One sharp sentence on strengths and what could be sharper."}]`;
    try {
      const text = await callClaude(prompt);
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) { setGradeError("Couldn't parse grades. Try again."); setGrading(false); return; }
      const parsed = JSON.parse(match[0]);
      const map = {};
      parsed.forEach(g => { map[g.role] = { score: g.score, feedback: g.feedback }; });
      setGrades(map);
    } catch (e) { setGradeError(`Error: ${e.message}`); }
    setGrading(false);
  };

  const getRecommendations = async (extra) => {
    setRecLoading(true); setRecError(""); setNeedsInfo(null);
    const vacants = people.filter(p => p.vacant === true || p.type === "vacant").map(p => p.role).join(", ");
    const overloaded = people.filter(p => p.reports && p.reports.includes("vacant")).map(p => p.name).join(", ");
    const prompt = `You are an expert organizational consultant analyzing a team structure for a business operating system called Perspexis.

ORGANIZATION: ${orgName || "This organization"} (${orgType || "Organization"})
INDUSTRY CONTEXT: Reference real benchmarks, typical patterns, and known challenges for a ${orgType || "organization"} in your analysis.
TEAM SIZE: ${people.length} people

STRUCTURAL PRESSURE POINTS:
${gaps}

VACANT ROLES: ${vacants}
PEOPLE REPORTING TO PASTOR DUE TO VACANCIES: ${overloaded}

FULL TEAM:
${people.filter(p => !(p.vacant === true || p.type === "vacant")).map(p => `- ${p.role}: ${p.name} — Owns: ${p.owns}${p.winning ? ` | Winning: ${p.winning}` : ""}`).join("\n")}

${extra ? `ADDITIONAL CONTEXT PROVIDED: ${extra}` : ""}

Your task: Provide 3-5 specific, actionable recommendations to alleviate the structural pressure points identified above.

First assess whether you have enough information to make specific recommendations. If you need more information, respond with ONLY this JSON:
{"needsInfo": true, "question": "One specific question to ask the user to get the information you need"}

If you have enough information, respond with ONLY this JSON (no markdown, no backticks):
{"needsInfo": false, "recommendations": [{"title": "Short title", "priority": "high/medium/low", "action": "Specific actionable recommendation in 2-3 sentences.", "impact": "What this fixes or improves."}]}`;

    try {
      const text = await callClaude(prompt);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) { setRecError("Couldn't parse recommendations. Try again."); setRecLoading(false); return; }
      const parsed = JSON.parse(match[0]);
      if (parsed.needsInfo) { setNeedsInfo(parsed.question); setRecLoading(false); return; }
      setRecs(parsed.recommendations);
    } catch (e) { setRecError(`Error: ${e.message}`); }
    setRecLoading(false);
  };

  const startEdit = (p) => {
    const isVacant = p.vacant === true || p.type === "vacant";
    setEditDraft({ _orig: p.role, name: isVacant ? (p.name || "(Vacant)") : (p.name || ""), role: p.role, type: isVacant ? "leader" : (p.type || "leader"), owns: p.owns || "", winning: p.winning || "", reports: p.reports || "", vacant: isVacant });
  };
  const saveEdit = () => {
    if (!editDraft) return;
    const { _orig, ...roleData } = editDraft;
    onUpdateRole(_orig, roleData);
    const ng = { ...grades }; delete ng[_orig]; setGrades(ng);
    setEditDraft(null); setRecs(null);
  };
  const deleteRole = () => {
    if (!editDraft || !window.confirm(`Remove "${editDraft.role}" from the org chart?`)) return;
    onRemoveRole(editDraft._orig); setEditDraft(null);
  };

  const gradedRoles = Object.values(grades);
  const overallScore = gradedRoles.length > 0 ? Math.round(gradedRoles.reduce((s, g) => s + g.score, 0) / gradedRoles.length) : null;
  const priorityColor = { high: "#CC5A4A", medium: "#6EE7D8", low: "var(--accent)" };

  const groups = [
    { label: "Founding Pastor", types: ["pastor"] },
    { label: "Operations & Support", types: ["support"] },
    { label: "Level 1 — Directors", types: ["director"] },
    { label: "Level 2 — Coordinators", types: ["coordinator"] },
    { label: "Team Leaders", types: ["leader"] },
  ];

  const ta = { width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-primary)", fontFamily: BODY, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", minHeight: 80 };
  const inpStyle = { width:"100%", padding:"9px 12px", background:"rgba(255,255,255,0.05)", border:"1px solid var(--border)", borderRadius:6, color:"var(--text-primary)", fontFamily:BODY, fontSize:13, outline:"none", boxSizing:"border-box" };

  return (
    <div>
      {/* Add Role */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Btn secondary small onClick={() => setAddingRole(true)}>+ Add Role</Btn>
      </div>
      {addingRole && (
        <Animated delay={0}><div style={{ background: "var(--surface)", border: "1px solid var(--accent-border)", borderLeft: "3px solid var(--accent)", borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontFamily: MONO, color: "var(--accent)", margin: 0, textTransform: "uppercase", letterSpacing: 1.5 }}>New Role</p>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn secondary small onClick={() => setAddingRole(false)}>Cancel</Btn>
              <Btn small onClick={() => { if(newRole.name.trim()&&newRole.role.trim()){ onAddRole&&onAddRole({...newRole}); setNewRole({type:"leader",name:"",role:"",owns:"",winning:"",reports:"",vacant:false}); setAddingRole(false); }}} disabled={!newRole.name.trim()||!newRole.role.trim()}>Add Role ✓</Btn>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }} className="px-grid-3">
            <div><Label>Name</Label><input value={newRole.name} onChange={e=>setNewRole(p=>({...p,name:e.target.value}))} placeholder="Full name" style={inpStyle} /></div>
            <div><Label>Role Title</Label><input value={newRole.role} onChange={e=>setNewRole(p=>({...p,role:e.target.value}))} placeholder="e.g. Worship Director" style={inpStyle} /></div>
            <div><Label>Type</Label><select value={newRole.type} onChange={e=>setNewRole(p=>({...p,type:e.target.value}))} style={{...inpStyle,background:"rgba(16,37,52,0.95)"}}>
              {["leader","director","coordinator","support","pastor","vacant"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select></div>
          </div>
          <div style={{ marginBottom: 10 }}><Label>Owns</Label><input value={newRole.owns} onChange={e=>setNewRole(p=>({...p,owns:e.target.value}))} placeholder="What this role is responsible for" style={inpStyle} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }} className="px-grid-2">
            <div><Label>Winning Looks Like</Label><input value={newRole.winning||""} onChange={e=>setNewRole(p=>({...p,winning:e.target.value}))} placeholder="What does success look like in this role" style={inpStyle} /></div>
            <div><Label>Reports To</Label><input value={newRole.reports} onChange={e=>setNewRole(p=>({...p,reports:e.target.value}))} placeholder="Direct supervisor" style={inpStyle} /></div>
          </div>
        </div></Animated>
      )}

      {/* Grade Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)" }} className="px-grade-banner">
        <div>
          {overallScore !== null ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 36, fontFamily: MONO, color: scoreColor(overallScore), margin: 0, fontWeight: 700, lineHeight: 1 }}>{overallScore}%</p>
                <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1.5, margin: "4px 0 0" }}>People Clarity Grade</p>
              </div>
              <div style={{ width: 1, height: 40, background: "var(--border)" }} />
              <div>
                <Tag color={scoreColor(overallScore)}>{scoreLabel(overallScore)}</Tag>
                <p style={{ fontSize: 12, color: "var(--text-primary)", margin: "6px 0 0", fontFamily: MONO }}>{gradedRoles.length} roles graded · Edit any role to re-grade</p>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 14, color: "var(--text-primary)", margin: "0 0 3px" }}>People Clarity Grade</p>
              <p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0, fontFamily: MONO }}>AI analyzes each role definition and scores clarity 0–100</p>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <Btn onClick={gradePeople} disabled={grading}>{grading ? "Grading..." : overallScore !== null ? "Re-Grade Layer" : "Grade This Layer →"}</Btn>
          {grading && <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}><Spinner medium label="Analyzing role definitions..." /></div>}
          {gradeError && <p style={{ fontSize: 11, color: "#CC5A4A", fontFamily: MONO, margin: 0 }}>{gradeError}</p>}
        </div>
      </div>

      {/* Roles */}
      {groups.map(g => {
        const members = people.filter(p => g.types.includes(p.type));
        if (!members.length) return null;
        return (
          <div key={g.label} style={{ marginBottom: 24 }}>
            <Label>{g.label}</Label>
            {members.map((p, i) => {
              const grade = grades[p.role];
              const isVacant = p.vacant === true || p.type === "vacant";
              const isEditing = editDraft?._orig === p.role;
              const leftColor = isVacant ? "#CC5A4A" : grade ? scoreColor(grade.score) : (tc[p.type] || tc.leader);
              return (
                <div key={i} style={{
                  background: isVacant ? "rgba(242,103,81,0.08)" : isEditing ? "rgba(242,103,81,0.06)" : "var(--surface)",
                  border: `1px solid ${isVacant ? "rgba(204,90,74,0.14)" : isEditing ? "rgba(46,196,182,0.3)" : grade ? `${scoreColor(grade.score)}25` : "var(--border)"}`,
                  borderLeft: `3px solid ${leftColor}`,
                  borderRadius: 10, padding: 16, marginBottom: 8
                }}>
                  {!isEditing ? (
                    <div>
                      <div className="px-role-card-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 2.2fr 1fr", gap: 16, alignItems: "start", marginBottom: grade ? 12 : 0 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                            <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0 }}>{p.name}</p>
                            {isVacant && <Tag color="#CC5A4A">Vacant</Tag>}
                          </div>
                          <p style={{ fontSize: 10, fontFamily: MONO, color: tc[p.type], margin: "0 0 8px" }}>{p.role}</p>
                          {grade && (
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                <span style={{ fontSize: 22, fontFamily: MONO, color: scoreColor(grade.score), fontWeight: 700 }}>{grade.score}%</span>
                                <Tag color={scoreColor(grade.score)}>{scoreLabel(grade.score)}</Tag>
                              </div>
                              <div style={{ width: 80 }}><Bar v={grade.score} color={scoreColor(grade.score)} /></div>
                            </div>
                          )}
                          <button onClick={() => startEdit(p)} style={{ marginTop: 8, background: "none", border: "1px solid var(--border-strong)", borderRadius: 5, color: "var(--text-primary)", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", padding: "4px 8px" }}>✏ Edit Role</button>
                        </div>
                        <div>
                          <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Owns</p>
                          <p style={{ fontSize: 12, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.6 }}>{p.owns}</p>
                          {p.winning && <><p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Winning</p><p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0, lineHeight: 1.6 }}>{p.winning}</p></>}
                        </div>
                        <div>
                          <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Reports To</p>
                          <p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0 }}>{p.reports}</p>
                        </div>
                      </div>
                      {grade && (
                        <div style={{ padding: "10px 14px", background: `${scoreColor(grade.score)}08`, border: `1px solid ${scoreColor(grade.score)}20`, borderRadius: 7 }}>
                          <p style={{ fontSize: 9, fontFamily: MONO, color: scoreColor(grade.score), textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>AI Assessment</p>
                          <p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0, lineHeight: 1.6}}>{grade.feedback}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontFamily: MONO, color: "var(--accent)", margin: 0, textTransform: "uppercase", letterSpacing: 1.5 }}>Editing Role</p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn danger small onClick={deleteRole}>Delete Role</Btn>
                          <Btn secondary small onClick={() => setEditDraft(null)}>Cancel</Btn>
                          <Btn small onClick={saveEdit}>Save ✓</Btn>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }} className="px-grid-2">
                        <div><Label>Name</Label><input value={editDraft.name} onChange={e => setEditDraft(d => ({...d, name: e.target.value}))} disabled={editDraft.vacant} placeholder={editDraft.vacant ? "(Vacant — no assignee)" : "Full name"} style={{...inpStyle, opacity: editDraft.vacant ? 0.45 : 1}} /></div>
                        <div style={{ display: "flex", alignItems: "flex-end" }}><label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "9px 0" }}><input type="checkbox" checked={editDraft.vacant || false} onChange={e => setEditDraft(d => ({...d, vacant: e.target.checked, name: e.target.checked ? "(Vacant)" : ""}))} style={{ accentColor: "#CC5A4A", width: 14, height: 14 }} /><span style={{ fontSize: 10, fontFamily: MONO, color: "#CC5A4A", textTransform: "uppercase", letterSpacing: 1 }}>Vacant</span></label></div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }} className="px-grid-2">
                        <div><Label>Role Title</Label><input value={editDraft.role} onChange={e => setEditDraft(d => ({...d, role: e.target.value}))} style={inpStyle} /></div>
                        <div><Label>Type</Label><select value={editDraft.type} onChange={e => setEditDraft(d => ({...d, type: e.target.value}))} style={{...inpStyle, background: "rgba(16,37,52,0.95)"}}>{["leader","director","coordinator","support","pastor"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
                      </div>
                      <div style={{ marginBottom: 10 }}><Label>Owns</Label><textarea value={editDraft.owns} onChange={e => setEditDraft(d => ({...d, owns: e.target.value}))} placeholder="What this role is responsible for..." style={{...ta, minHeight: 64}} /></div>
                      <div style={{ marginBottom: 10 }}><Label>Winning Looks Like</Label><textarea value={editDraft.winning} onChange={e => setEditDraft(d => ({...d, winning: e.target.value}))} placeholder="What does success look like in this role..." style={{...ta, minHeight: 64}} /></div>
                      <div><Label>Reports To</Label><input value={editDraft.reports} onChange={e => setEditDraft(d => ({...d, reports: e.target.value}))} style={inpStyle} /></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* AI-Diagnosed Pressure Points */}
      <div style={{ background: "rgba(204,90,74,0.03)", border: "1px solid rgba(204,90,74,0.18)", borderLeft: "3px solid #E74C3C", borderRadius: 10, padding: 20, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <Label c="#CC5A4A">Structural Pressure Points</Label>
            <p style={{ fontSize: 11, fontFamily: MONO, color: "var(--text-primary)", margin: "0 0 10px" }}>AI-diagnosed from your org chart</p>
          </div>
          <Btn danger small onClick={async () => {
            onUpdateGaps("diagnosing");
            const vacants = people.filter(p => p.vacant === true || p.type === "vacant").map(p => p.role).join(", ") || "None";
            const overloaded = people.filter(p => p.reports && p.reports.toLowerCase().includes("vacant")).map(p => `${p.name} (${p.role})`).join(", ") || "None";
            const prompt = `You are an organizational clarity expert analyzing a team structure.

Analyze this org chart and identify the real structural pressure points — places where the structure itself is creating friction, risk, or overload.

TEAM:
${people.map(p => `- ${p.role}: ${(p.vacant===true||p.type==="vacant") ? "[VACANT]" : p.name} (${p.type}) — Reports to: ${p.reports} — Owns: ${p.owns}${p.winning ? ` | Winning: ${p.winning}` : ""}`).join("\n")}

VACANT ROLES: ${vacants}
PEOPLE AFFECTED BY VACANCIES: ${overloaded}

Write 2-4 specific, honest pressure points in 2-3 sentences total. Be direct. Name the actual people and roles involved. Do not be generic. Return plain text only — no JSON, no bullet points, no headers. Just the paragraph.`;
            try {
              const text = await callClaude(prompt);
              onUpdateGaps(text.trim());
              setRecs(null);
            } catch (e) { onUpdateGaps("Error diagnosing. Try again."); }
          }}>
            {gaps === "diagnosing" ? "Diagnosing..." : gaps === DEFAULT_GAPS ? "Diagnose Pressure Points →" : "Re-Diagnose →"}
          </Btn>
        </div>
        {gaps === "diagnosing"
          ? <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}><Spinner medium label="Diagnosing structural pressure points..." /></div>
          : <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--text-primary)", margin: 0 }}>{gaps}</p>
        }
      </div>

      {/* AI Recommendations */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)", padding: 20, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <Label>AI Recommendations</Label>
            <p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0, fontFamily: MONO }}>Actionable steps to alleviate structural pressure</p>
          </div>
          {!recLoading && <Btn onClick={() => getRecommendations(extraInfo)} secondary>{recs ? "Refresh Recommendations" : "Get AI Recommendations →"}</Btn>}
          {recLoading && <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}><Spinner medium label="Building AI recommendations..." /></div>}
        </div>

        {recError && <p style={{ fontSize: 11, color: "#CC5A4A", fontFamily: MONO, margin: "0 0 12px" }}>{recError}</p>}

        {needsInfo && (
          <div style={{ padding: "16px", background: "rgba(110,231,216,0.06)", border: "1px solid rgba(110,231,216,0.2)", borderRadius: 8, marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontFamily: MONO, color: "#6EE7D8", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>More Information Needed</p>
            <p style={{ fontSize: 13, color: "var(--text-primary)", margin: "0 0 12px", lineHeight: 1.6 }}>{needsInfo}</p>
            <textarea value={extraInfo} onChange={e => setExtraInfo(e.target.value)} placeholder="Type your answer here..." style={{ ...ta, minHeight: 70, marginBottom: 10 }} />
            <Btn onClick={() => getRecommendations(extraInfo)} disabled={!extraInfo.trim()}>Submit & Get Recommendations →</Btn>
          </div>
        )}

        {recs && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recs.map((r, i) => (
              <div key={i} style={{ padding: "14px 16px", background: `${priorityColor[r.priority]}06`, border: `1px solid ${priorityColor[r.priority]}20`, borderLeft: `3px solid ${priorityColor[r.priority]}`, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ fontSize: 13, fontFamily: MONO, color: "var(--text-primary)", margin: 0, fontWeight: 600 }}>{r.title}</p>
                  <Tag color={priorityColor[r.priority]}>{r.priority} priority</Tag>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-primary)", margin: "0 0 6px", lineHeight: 1.65 }}>{r.action}</p>
                <p style={{ fontSize: 11, fontFamily: MONO, color: "var(--text-primary)", margin: 0 }}>Impact: {r.impact}</p>
              </div>
            ))}
          </div>
        )}

        {!recs && !needsInfo && !recLoading && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0 }}>Click "Get AI Recommendations" to receive specific, actionable steps based on your team structure and pressure points.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Rhythm Setup ──────────────────────────────────────────────────────────────
function RhythmSetup({ onDone }) {
  const [step, setStep] = useState(0);
  const [current, setCurrent] = useState("");
  const [breaks, setBreaks] = useState("");
  const [cadences, setCadences] = useState([{ name: "", freq: "", dur: "", who: "", purpose: "" }, { name: "", freq: "", dur: "", who: "", purpose: "" }]);
  const upd = (i, k, v) => setCadences(p => p.map((c, idx) => idx === i ? { ...c, [k]: v } : c));
  const filled = cadences.filter(c => c.name && c.freq);
  const can = [current.length > 15, filled.length >= 1, breaks.length > 15];
  const fs = { width: "100%", padding: "11px 13px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-primary)", fontFamily: BODY, fontSize: 13, outline: "none", boxSizing: "border-box" };
  const steps = ["Current State", "New Rhythms", "Breakdown"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: i < step ? "var(--accent)" : i === step ? "var(--accent-dim)" : "var(--accent-dim)", border: i === step ? "1px solid var(--accent)" : "none", display: "flex", alignItems: "center", justifyContent: "center", color: i < step ? "#fff" : i === step ? "var(--accent)" : "#94A3B8", fontSize: 10, fontFamily: MONO, fontWeight: 700 }}>{i < step ? "✓" : i + 1}</div>
              <span style={{ fontSize: 8, fontFamily: MONO, color: i === step ? "var(--accent)" : "#94A3B8", textTransform: "uppercase", letterSpacing: 1, whiteSpace: "nowrap" }}>{s}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: i < step ? "var(--accent)" : "var(--border)", margin: "0 8px", marginBottom: 16 }} />}
          </div>
        ))}
      </div>
      {step === 0 && (<div><h3 style={{ color: "var(--text-primary)", fontWeight: 400, fontSize: 18, margin: "0 0 6px" }}>What rhythms exist right now?</h3><p style={{ color: "var(--text-primary)", fontSize: 13, margin: "0 0 18px"}}>List everything — even what isn't working.</p><textarea value={current} onChange={e => setCurrent(e.target.value)} placeholder="e.g. Sunday morning team huddle, inconsistent leader texts..." style={{ ...fs, minHeight: 110, resize: "vertical" }} /></div>)}
      {step === 1 && (<div><h3 style={{ color: "var(--text-primary)", fontWeight: 400, fontSize: 18, margin: "0 0 6px" }}>Build your operating rhythm.</h3><p style={{ color: "var(--text-primary)", fontSize: 13, margin: "0 0 18px"}}>Define the cadences your team will actually run on.</p>{cadences.map((c, i) => (<div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)", padding: 14, marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><span style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1 }}>Cadence {i + 1}</span>{cadences.length > 1 && <button onClick={() => setCadences(p => p.filter((_, x) => x !== i))} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: 16 }}>×</button>}</div><div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginBottom: 8 }} className="px-grid-3"><input value={c.name} onChange={e => upd(i, "name", e.target.value)} placeholder="Meeting name" style={fs} /><input value={c.freq} onChange={e => upd(i, "freq", e.target.value)} placeholder="Frequency" style={fs} /><input value={c.dur} onChange={e => upd(i, "dur", e.target.value)} placeholder="Duration" style={fs} /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }} className="px-grid-2"><input value={c.who} onChange={e => upd(i, "who", e.target.value)} placeholder="Who attends" style={fs} /><input value={c.purpose} onChange={e => upd(i, "purpose", e.target.value)} placeholder="Purpose" style={fs} /></div></div>))}<button onClick={() => setCadences(p => [...p, { name: "", freq: "", dur: "", who: "", purpose: "" }])} style={{ width: "100%", padding: 10, background: "transparent", border: "1px dashed var(--border)", borderRadius: 7, color: "var(--text-primary)", fontFamily: MONO, fontSize: 11, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1 }}>+ Add Cadence</button></div>)}
      {step === 2 && (<div><h3 style={{ color: "var(--text-primary)", fontWeight: 400, fontSize: 18, margin: "0 0 6px" }}>Where does communication break down?</h3><p style={{ color: "var(--text-primary)", fontSize: 13, margin: "0 0 18px"}}>Where do things get lost? Where is your team misaligned?</p><textarea value={breaks} onChange={e => setBreaks(e.target.value)} placeholder="e.g. Leaders find out about changes through the grapevine..." style={{ ...fs, minHeight: 110, resize: "vertical" }} /></div>)}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {step > 0 && <Btn secondary onClick={() => setStep(s => s - 1)}>← Back</Btn>}
        <Btn disabled={!can[step]} onClick={() => step < 2 ? setStep(s => s + 1) : onDone({ current, cadences: filled, breaks })}>{step < 2 ? "Continue →" : "Save Rhythm Layer ✓"}</Btn>
      </div>
    </div>
  );
}

function RhythmView({ data, orgName, orgType, onUpdate }) {
  const [cadences, setCadences] = useState(data.cadences);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [grades, setGrades] = useState({});
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState("");
  const [improvements, setImprovements] = useState(null);
  const [impLoading, setImpLoading] = useState(false);
  const [impError, setImpError] = useState("");
  const [needsInfo, setNeedsInfo] = useState(null);
  const [extraInfo, setExtraInfo] = useState("");

  const fs = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontFamily: BODY, fontSize: 12, outline: "none", boxSizing: "border-box" };

  const startEdit = (i) => { setEditingIdx(i); setEditDraft({ ...cadences[i] }); };
  const saveEdit = () => {
    const updated = cadences.map((c, i) => i === editingIdx ? { ...editDraft } : c);
    setCadences(updated);
    onUpdate({ ...data, cadences: updated });
    setEditingIdx(null);
    const newGrades = { ...grades };
    delete newGrades[editingIdx];
    setGrades(newGrades);
    setImprovements(null);
  };

  const addCadence = () => {
    const updated = [...cadences, { name: "New Meeting", freq: "", dur: "", who: "", purpose: "" }];
    setCadences(updated);
    onUpdate({ ...data, cadences: updated });
  };

  const removeCadence = (i) => {
    const updated = cadences.filter((_, idx) => idx !== i);
    setCadences(updated);
    onUpdate({ ...data, cadences: updated });
    const newGrades = { ...grades };
    delete newGrades[i];
    setGrades(newGrades);
    setImprovements(null);
  };

  const gradeRhythm = async () => {
    setGrading(true); setGradeError("");
    const prompt = `You are an organizational rhythm expert grading meeting cadences for ${orgName || "an organization"} (${orgType || "Organization"}).

INDUSTRY CONTEXT: Reference real benchmarks and patterns for a ${orgType || "organization"} — what cadences are typical, what's too frequent or too sparse for this type of org.

Grade each cadence 0-100 based on:
- Frequency appropriateness for its stated purpose
- Duration fit for what needs to be accomplished
- Attendance clarity (right people in the room)
- Purpose definition (is it clear and actionable?)

CURRENT STATE: "${data.current}"
COMMUNICATION GAPS: "${data.breaks}"

CADENCES:
${cadences.map((c, i) => `${i + 1}. "${c.name}" — Frequency: ${c.freq}, Duration: ${c.dur}, Who: ${c.who}, Purpose: ${c.purpose}`).join("\n")}

Return ONLY a raw JSON array, no markdown, no backticks:
[{"index": 0, "score": 85, "feedback": "One sharp sentence on what's strong and what could improve."}]`;
    try {
      const text = await callClaude(prompt);
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) { setGradeError("Couldn't parse grades. Try again."); setGrading(false); return; }
      const parsed = JSON.parse(match[0]);
      const map = {};
      parsed.forEach(g => { map[g.index] = { score: g.score, feedback: g.feedback }; });
      setGrades(map);
    } catch (e) { setGradeError(`Error: ${e.message}`); }
    setGrading(false);
  };

  const getImprovements = async (extra) => {
    setImpLoading(true); setImpError(""); setNeedsInfo(null);
    const prompt = `You are an expert organizational rhythm consultant analyzing meeting cadences.

ORGANIZATION CONTEXT:
Current State: "${data.current}"
Communication Gaps: "${data.breaks}"
${extra ? `Additional Context: "${extra}"` : ""}

CURRENT CADENCES:
${cadences.map((c, i) => {
  const g = grades[i];
  return `${i + 1}. "${c.name}" (Score: ${g ? g.score + "%" : "ungraded"}) — ${c.freq}, ${c.dur}, Attendees: ${c.who}, Purpose: ${c.purpose}`;
}).join("\n")}

Assess whether you have enough context to make specific rhythm improvement recommendations.

If you need more information, respond ONLY with this JSON:
{"needsInfo": true, "question": "One specific question to get the missing context"}

If you have enough, respond ONLY with this JSON (no markdown, no backticks):
{"needsInfo": false, "improvements": [{"cadence": "cadence name or Overall", "priority": "high/medium/low", "suggestion": "Specific actionable improvement in 2-3 sentences.", "rationale": "Why this matters for organizational health."}]}`;
    try {
      const text = await callClaude(prompt);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) { setImpError("Couldn't parse improvements. Try again."); setImpLoading(false); return; }
      const parsed = JSON.parse(match[0]);
      if (parsed.needsInfo) { setNeedsInfo(parsed.question); setImpLoading(false); return; }
      setImprovements(parsed.improvements);
    } catch (e) { setImpError(`Error: ${e.message}`); }
    setImpLoading(false);
  };

  const gradedCount = Object.keys(grades).length;
  const overallScore = gradedCount > 0 ? Math.round(Object.values(grades).reduce((s, g) => s + g.score, 0) / gradedCount) : null;
  const priorityColor = { high: "#CC5A4A", medium: "#6EE7D8", low: "var(--accent)" };

  return (
    <div>
      {/* Grade Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)" }} className="px-grade-banner">
        <div>
          {overallScore !== null ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 36, fontFamily: MONO, color: scoreColor(overallScore), margin: 0, fontWeight: 700, lineHeight: 1 }}>{overallScore}%</p>
                <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1.5, margin: "4px 0 0" }}>Rhythm Clarity Grade</p>
              </div>
              <div style={{ width: 1, height: 40, background: "var(--border)" }} />
              <div>
                <Tag color={scoreColor(overallScore)}>{scoreLabel(overallScore)}</Tag>
                <p style={{ fontSize: 12, color: "var(--text-primary)", margin: "6px 0 0", fontFamily: MONO }}>{gradedCount} cadences graded · Edit any to re-grade</p>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 14, color: "var(--text-primary)", margin: "0 0 3px" }}>Rhythm Clarity Grade</p>
              <p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0, fontFamily: MONO }}>AI grades each cadence on frequency, duration, attendance, and purpose</p>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <Btn onClick={gradeRhythm} disabled={grading}>{grading ? "Grading..." : overallScore !== null ? "Re-Grade Rhythm" : "Grade This Layer →"}</Btn>
          {grading && <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}><Spinner medium label="Grading your rhythm cadences..." /></div>}
          {gradeError && <p style={{ fontSize: 11, color: "#CC5A4A", fontFamily: MONO, margin: 0 }}>{gradeError}</p>}
        </div>
      </div>

      {/* Current State */}
      <Card><Label>Where You Started</Label><p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-primary)", margin: 0 }}>{data.current}</p></Card>

      {/* Cadences */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Label>Operating Rhythm</Label>
        <button onClick={addCadence} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-primary)", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", padding: "4px 10px" }}>+ Add Cadence</button>
      </div>

      {cadences.map((c, i) => {
        const grade = grades[i];
        const isEditing = editingIdx === i;
        const leftColor = grade ? scoreColor(grade.score) : "var(--accent)";
        return (
          <div key={i} style={{ background: isEditing ? "rgba(242,103,81,0.06)" : "var(--surface)", border: `1px solid ${isEditing ? "rgba(46,196,182,0.3)" : grade ? `${scoreColor(grade.score)}25` : "var(--border)"}`, borderLeft: `3px solid ${leftColor}`, borderRadius: 9, padding: 16, marginBottom: 10 }}>
            {!isEditing ? (
              <div>
                <div className="px-cadence-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 2fr", gap: 14, alignItems: "start", marginBottom: grade ? 12 : 0 }}>
                  <div>
                    <p style={{ fontSize: 13, fontFamily: MONO, color: "var(--text-primary)", margin: "0 0 3px" }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-primary)", margin: "0 0 8px" }}>{c.freq}</p>
                    {grade && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                          <span style={{ fontSize: 20, fontFamily: MONO, color: scoreColor(grade.score), fontWeight: 700 }}>{grade.score}%</span>
                          <Tag color={scoreColor(grade.score)}>{scoreLabel(grade.score)}</Tag>
                        </div>
                        <div style={{ width: 70 }}><Bar v={grade.score} color={scoreColor(grade.score)} /></div>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button onClick={() => startEdit(i)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-primary)", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", padding: "3px 8px" }}>✏ Edit</button>
                      {cadences.length > 1 && <button onClick={() => removeCadence(i)} style={{ background: "none", border: "1px solid rgba(204,90,74,0.2)", borderRadius: 5, color: "#CC5A4A", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", padding: "3px 8px" }}>Remove</button>}
                    </div>
                  </div>
                  <div><p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 3px" }}>Duration</p><p style={{ fontSize: 13, color: "var(--accent)", fontFamily: MONO, margin: 0 }}>{c.dur}</p></div>
                  <div><p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 3px" }}>Who</p><p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0 }}>{c.who}</p></div>
                  <div><p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 3px" }}>Purpose</p><p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0 }}>{c.purpose}</p></div>
                </div>
                {grade && (
                  <div style={{ padding: "10px 14px", background: `${scoreColor(grade.score)}08`, border: `1px solid ${scoreColor(grade.score)}20`, borderRadius: 7 }}>
                    <p style={{ fontSize: 9, fontFamily: MONO, color: scoreColor(grade.score), textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>AI Assessment</p>
                    <p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0, lineHeight: 1.6}}>{grade.feedback}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontFamily: MONO, color: "var(--accent)", margin: 0 }}>Editing: {c.name}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn secondary small onClick={() => setEditingIdx(null)}>Cancel</Btn>
                    <Btn small onClick={saveEdit}>Save & Clear Grade ✓</Btn>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginBottom: 8 }} className="px-grid-3">
                  <div><Label>Name</Label><input value={editDraft.name} onChange={e => setEditDraft(p => ({ ...p, name: e.target.value }))} style={fs} /></div>
                  <div><Label>Frequency</Label><input value={editDraft.freq} onChange={e => setEditDraft(p => ({ ...p, freq: e.target.value }))} style={fs} /></div>
                  <div><Label>Duration</Label><input value={editDraft.dur} onChange={e => setEditDraft(p => ({ ...p, dur: e.target.value }))} style={fs} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }} className="px-grid-2">
                  <div><Label>Who Attends</Label><input value={editDraft.who} onChange={e => setEditDraft(p => ({ ...p, who: e.target.value }))} style={fs} /></div>
                  <div><Label>Purpose</Label><input value={editDraft.purpose} onChange={e => setEditDraft(p => ({ ...p, purpose: e.target.value }))} style={fs} /></div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Communication Gaps */}
      <Card warn><Label c="#CC5A4A">Communication Gaps Being Addressed</Label><p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--text-primary)", margin: 0 }}>{data.breaks}</p></Card>

      {/* AI Improvements */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <Label>AI Rhythm Improvements</Label>
            <p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0, fontFamily: MONO }}>Specific upgrades to strengthen your operating rhythm</p>
          </div>
          {!impLoading && <Btn onClick={() => getImprovements(extraInfo)} secondary>{improvements ? "Refresh Improvements" : "Get AI Improvements →"}</Btn>}
          {impLoading && <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}><Spinner medium label="Building rhythm improvements..." /></div>}
        </div>
        {impError && <p style={{ fontSize: 11, color: "#CC5A4A", fontFamily: MONO, margin: "0 0 12px" }}>{impError}</p>}
        {needsInfo && (
          <div style={{ padding: "16px", background: "rgba(110,231,216,0.06)", border: "1px solid rgba(110,231,216,0.2)", borderRadius: 8, marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontFamily: MONO, color: "#6EE7D8", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>More Context Needed</p>
            <p style={{ fontSize: 13, color: "var(--text-primary)", margin: "0 0 12px", lineHeight: 1.6 }}>{needsInfo}</p>
            <textarea value={extraInfo} onChange={e => setExtraInfo(e.target.value)} placeholder="Type your answer here..." style={{ width: "100%", padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-primary)", fontFamily: BODY, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", minHeight: 70, marginBottom: 10 }} />
            <Btn onClick={() => getImprovements(extraInfo)} disabled={!extraInfo.trim()}>Submit & Get Improvements →</Btn>
          </div>
        )}
        {improvements && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {improvements.map((r, i) => (
              <div key={i} style={{ padding: "14px 16px", background: `${priorityColor[r.priority]}06`, border: `1px solid ${priorityColor[r.priority]}20`, borderLeft: `3px solid ${priorityColor[r.priority]}`, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ fontSize: 13, fontFamily: MONO, color: "var(--text-primary)", margin: 0, fontWeight: 600 }}>{r.cadence}</p>
                  <Tag color={priorityColor[r.priority]}>{r.priority} priority</Tag>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-primary)", margin: "0 0 6px", lineHeight: 1.65 }}>{r.suggestion}</p>
                <p style={{ fontSize: 11, fontFamily: MONO, color: "var(--text-primary)", margin: 0 }}>Why it matters: {r.rationale}</p>
              </div>
            ))}
          </div>
        )}
        {!improvements && !needsInfo && !impLoading && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0 }}>Grade your cadences first, then get AI-driven rhythm improvements specific to your organization.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Health Overview (POHI) ────────────────────────────────────────────────────
function HealthOverview({ identity, people, gaps, rhythm, orgName, orgType }) {
  const [pohi, setPohi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasRhythm = rhythm && rhythm.cadences;

  const runAnalysis = async () => {
    setLoading(true); setError("");
    const vacants = people.filter(p => p.vacant === true || p.type === "vacant").map(p => p.role).join(", ") || "None";
    const prompt = `You are Perspexis, an AI-powered organizational health assessment system. Analyze this organization using the Perspexis Organizational Health Index (POHI) — a proprietary 6-dimension framework.

ORGANIZATION TYPE: ${orgType || "Organization"}
INDUSTRY BENCHMARKING: Score relative to what healthy ${orgType || "organizations"} typically look like at comparable stages. Reference real industry patterns, benchmarks, and known characteristics of high-performing ${orgType || "organizations"} in each dimension.

ORGANIZATION DATA:
Mission: "${identity.mission}"
Vision (North Star): "${identity.vision_north}"
Vision (Phase 1): "${identity.vision_phase}"
Values: ${identity.values.map(v => v.name).join(", ")}
Positioning: "${identity.positioning}"

TEAM (${people.length} people):
${people.map(p => `- ${p.role}: ${p.name} (${p.type}) — ${p.owns}`).join("\n")}
Vacant Roles: ${vacants}
Structural Pressure: "${gaps}"

${hasRhythm ? `RHYTHM:
Current State: "${rhythm.current}"
Cadences: ${rhythm.cadences.map(c => `${c.name} (${c.freq}, ${c.dur})`).join(", ")}
Communication Gaps: "${rhythm.breaks}"` : "RHYTHM: Not yet completed"}

Score this organization across the 6 POHI dimensions (0-100 each):

1. PURPOSE CLARITY — How well-defined, specific, and compelling is the mission, vision, and values? Are they actionable or generic?
2. PEOPLE CLARITY — How clearly defined are roles, ownership, and accountability? Is winning defined per role?
3. OPERATIONAL RHYTHM — How consistent, purposeful, and well-structured are communication cadences? (Score 40 if not completed)
4. STRUCTURAL INTEGRITY — How sound is the org structure? Consider vacancies, reporting overload, span of control.
5. CULTURAL ALIGNMENT — Do the stated values appear to translate into observable organizational behaviors and design choices?
6. GROWTH READINESS — How capable does this org appear of scaling — adding people, locations, or complexity — without breaking?

Then write a 3-4 sentence organizational profile narrative that gives an honest, specific assessment of this organization's health — what's strong, what's at risk, and what's the most important thing to address right now.

Return ONLY raw JSON, no markdown, no backticks:
{"dimensions": [{"name": "Purpose Clarity", "score": 85, "insight": "One sharp sentence on this dimension."}, {"name": "People Clarity", "score": 72, "insight": "..."}, {"name": "Operational Rhythm", "score": 65, "insight": "..."}, {"name": "Structural Integrity", "score": 58, "insight": "..."}, {"name": "Cultural Alignment", "score": 80, "insight": "..."}, {"name": "Growth Readiness", "score": 62, "insight": "..."}], "overall": 70, "profile": "3-4 sentence narrative here."}`;

    try {
      const text = await callClaude(prompt);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) { setError("Couldn't parse analysis. Try again."); setLoading(false); return; }
      setPohi(JSON.parse(match[0]));
    } catch (e) { setError(`Error: ${e.message}`); }
    setLoading(false);
  };

  const dimColors = ["var(--accent)", "#7EB8C8", "#A87EC8", "#F26751", "#7EC898", "#C87E7E"];

  return (
    <div>
      {/* POHI Banner */}
      <div style={{ padding: "24px 28px", background: "var(--surface)", border: `1px solid ${pohi ? `${scoreColor(pohi.overall)}25` : "var(--border)"}`, borderRadius: 12, marginBottom: 24 }}>
        {pohi ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 2.5, margin: "0 0 8px" }}>Perspexis Organizational Health Index</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ fontSize: 72, fontFamily: DISPLAY, fontWeight: 700, color: scoreColor(pohi.overall), fontWeight: 700, lineHeight: 1 }}>{pohi.overall}</span>
                  <div>
                    <span style={{ fontSize: 22, color: "var(--text-primary)", fontFamily: MONO }}>/100</span>
                    <div style={{ marginTop: 6 }}><Tag color={scoreColor(pohi.overall)}>{scoreLabel(pohi.overall)}</Tag></div>
                  </div>
                </div>
              </div>
              <Btn secondary small onClick={runAnalysis}>Re-Analyze →</Btn>
            </div>
            <div style={{ padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)", marginBottom: 20 }}>
              <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 8px" }}>Organizational Profile</p>
              <p style={{ fontSize: 14, lineHeight: 1.85, color: "var(--text-primary)", fontFamily: DISPLAY }}>{pohi.profile}</p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 12px" }}>Perspexis Organizational Health Index</p>
            <p style={{ fontSize: 22, color: "var(--text-primary)", fontWeight: 400, margin: "0 0 8px" }}>POHI Score</p>
            <p style={{ fontSize: 13, color: "var(--text-primary)", margin: "0 0 20px"}}>A proprietary 6-dimension organizational health assessment powered by Perspexis AI. {!hasRhythm && "Complete the Rhythm layer for a more accurate score."}</p>
            <Btn onClick={runAnalysis} disabled={loading}>{loading ? "Analyzing..." : "Run Health Analysis →"}</Btn>
            {loading && <Spinner large label="Running full organizational assessment..." />}
            {error && <p style={{ fontSize: 11, color: "#CC5A4A", fontFamily: MONO, margin: "12px 0 0" }}>{error}</p>}
          </div>
        )}
      </div>

      {pohi && (
        <div>
          <Label>The 6 POHI Dimensions</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }} className="px-grid-2">
            {pohi.dimensions.map((d, i) => (
              <div key={i} style={{ background: "var(--surface)", border: `1px solid ${dimColors[i]}20`, borderTop: `2px solid ${dimColors[i]}`, borderRadius: 10, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <p style={{ fontSize: 11, fontFamily: MONO, color: dimColors[i], margin: 0, fontWeight: 500, letterSpacing: 0.3 }}>{d.name}</p>
                  <span style={{ fontSize: 24, fontFamily: DISPLAY, color: scoreColor(d.score), fontWeight: 700 }}>{d.score}</span>
                </div>
                <Bar v={d.score} color={scoreColor(d.score)} />
                <p style={{ fontSize: 12, color: "var(--text-primary)", margin: "10px 0 0", lineHeight: 1.65, fontFamily: DISPLAY }}>{d.insight}</p>
              </div>
            ))}
          </div>

          {!hasRhythm && (
            <div style={{ padding: "14px 18px", background: "rgba(110,231,216,0.05)", border: "1px solid rgba(110,231,216,0.2)", borderRadius: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#6EE7D8", fontFamily: MONO, margin: 0 }}>⚠ Complete the Rhythm layer to improve your Operational Rhythm and Growth Readiness scores.</p>
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <Btn onClick={runAnalysis}>Re-Run Analysis →</Btn>
            {loading && <Spinner large label="Re-analyzing your organization..." />}
            {error && <p style={{ fontSize: 11, color: "#CC5A4A", fontFamily: MONO, margin: "10px 0 0" }}>{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
const LAYERS = [
  { id: "health", label: "Health", icon: "◉", desc: "POHI organizational score" },
  { id: "identity", label: "Identity", icon: "◈", desc: "Mission, vision, values" },
  { id: "people", label: "People", icon: "◎", desc: "Roles and accountability" },
  { id: "rhythm", label: "Rhythm", icon: "◇", desc: "Meeting cadences" },
];

const TUTORIAL_STEPS = [
  { icon: "◈  ◎  ◇", title: "Welcome to Perspexis", body: "Your organizational operating system is ready. Let's take a quick tour of the three layers that define how your organization thinks, works, and wins.", layer: null },
  { icon: "◈", title: "Identity Layer", body: "Define your mission, vision, values, and positioning. This is the foundation everything else is built on — start here and get clear on what you believe and where you're going.", layer: "identity" },
  { icon: "◎", title: "People Layer", body: "Map your team, define ownership for every role, and get AI-powered clarity grades. Know who owns what — and where accountability is missing or unclear.", layer: "people" },
  { icon: "◇", title: "Rhythm Layer", body: "Define your meeting cadences and communication rhythms. Get AI feedback on frequency, duration, and purpose. Healthy organizations run on healthy rhythms.", layer: "rhythm" },
  { icon: "◉", title: "Organizational Health", body: "Once your layers are built, run a POHI analysis — a 6-dimension health score powered by Perspexis AI. This is your north star for measuring organizational clarity.", layer: "health" },
];

function TutorialOverlay({ step, onNext, onSkip }) {
  const s = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(7,24,39,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--accent-border)", borderRadius: 14, padding: "40px 44px", maxWidth: 480, width: "90%", animation: "fadeUp 0.3s ease both", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 28, marginBottom: 18, textAlign: "center", color: "var(--accent)", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 8 }}>{s.icon}</div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px", textAlign: "center" }}>{s.title}</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75, margin: "0 0 32px", textAlign: "center" }}>{s.body}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
          {TUTORIAL_STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 22 : 6, height: 6, borderRadius: 3, background: i === step ? "var(--accent)" : "var(--border)", transition: "all 0.3s ease" }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Btn secondary small onClick={onSkip}>Skip Tutorial</Btn>
          <Btn onClick={onNext}>{isLast ? "Start Building →" : "Next →"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── User Agreement ─────────────────────────────────────────────────────────
const USER_AGREEMENT = `PERSPEXIS PLATFORM USER AGREEMENT

Effective Date: 2026

Welcome to Perspexis. By accepting this invitation, you ("User") agree to the following terms set forth by Perspexis ("Company") and the organization that invited you ("Organization").

1. AUTHORIZED ACCESS
Your access has been granted by an authorized administrator of the Organization and is limited to the permissions they assign. Access may be modified or revoked at any time.

2. ACCEPTABLE USE
You agree to use Perspexis solely for legitimate organizational purposes. You will not: (a) share credentials with others; (b) access data beyond your permissions; (c) use the platform for any unlawful purpose; or (d) reverse-engineer proprietary systems.

3. CONFIDENTIALITY
Information accessible through this account may be proprietary and confidential to the Organization. You agree to maintain strict confidentiality and not disclose such information to unauthorized parties.

4. DATA AND PRIVACY
Perspexis processes data as described in our Privacy Policy. By using the platform, you consent to collection and processing of your usage data as necessary to provide the service.

5. ACCOUNT SECURITY
You are solely responsible for maintaining the confidentiality of your credentials. Notify your administrator immediately of any unauthorized account access.

6. INTELLECTUAL PROPERTY
All content, features, and functionality of Perspexis are the exclusive property of Perspexis and protected by applicable intellectual property laws.

7. TERMINATION
Your access may be terminated at any time by the Organization's administrator or by Perspexis for any violation of these terms.

8. DISCLAIMER OF WARRANTIES
The platform is provided "as is" without warranties of any kind. Perspexis does not warrant that the platform will be error-free or uninterrupted.

9. LIMITATION OF LIABILITY
To the maximum extent permitted by law, Perspexis shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.

10. GOVERNING LAW
This Agreement is governed by the laws of the State of North Carolina, without regard to conflict of law provisions.

By clicking "I Agree," you confirm you have read, understood, and agree to be bound by this Agreement.`;

// ─── Invite Accept Page ──────────────────────────────────────────────────────
function InviteAcceptPage({ user, onAccepted }) {
  const [step, setStep] = useState("agreement");
  const [agreed, setAgreed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = async () => {
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true); setError("");
    const { error: pwErr } = await supabase.auth.updateUser({
      password,
      data: { needs_onboarding: false },
    });
    if (pwErr) { setError(pwErr.message); setLoading(false); return; }
    await supabase.from("organization_members").update({
      member_user_id: user.id,
      status: "active",
      agreed_to_terms_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    }).eq("email", user.email).eq("status", "pending");
    setStep("success"); setLoading(false);
  };

  const inp = { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid #243746", borderRadius: 6, color: "#F5F7FA", fontFamily: "'Inter', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 };

  return (
    <div style={{ minHeight: "100vh", background: "#071827", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } input::placeholder { color: #94A3B8 !important; } input:focus { border-color: #F26751 !important; outline: none; }`}</style>
      <div style={{ width: "100%", maxWidth: 520, animation: "fadeUp 0.4s ease both" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <PerspexisLogo height={100} />
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#F26751", textTransform: "uppercase", letterSpacing: 2.5, margin: "8px 0 0" }}>Clarity. Alignment. Momentum.</p>
        </div>
        <div style={{ background: "#0D2236", border: "1px solid rgba(242,103,81,0.18)", borderRadius: 14, padding: 36, boxShadow: "0 8px 40px rgba(0,0,0,0.45)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F5F7FA", margin: "0 0 4px" }}>You've been invited to Perspexis</h2>
          <p style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#94A3B8", margin: "0 0 24px" }}>Signing in as <strong style={{ color: "#F5F7FA" }}>{user.email}</strong></p>

          {step === "success" ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#F5F7FA", margin: "0 0 10px" }}>You're all set!</h3>
              <p style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#94A3B8", margin: "0 0 28px", lineHeight: 1.65 }}>Your password is created and you've agreed to the User Agreement. Sign in to access your organization's Perspexis OS.</p>
              <Btn onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign In to Perspexis →</Btn>
            </div>
          ) : step === "agreement" ? (
            <div>
              <p style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#F26751", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 8px" }}>User Agreement</p>
              <div style={{ height: 220, overflowY: "auto", background: "rgba(0,0,0,0.25)", border: "1px solid #243746", borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
                <pre style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", color: "#94A3B8", whiteSpace: "pre-wrap", lineHeight: 1.75, margin: 0 }}>{USER_AGREEMENT}</pre>
              </div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 24 }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: "#F26751", flexShrink: 0, width: 15, height: 15 }} />
                <span style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#F5F7FA", lineHeight: 1.6 }}>I have read and agree to the Perspexis User Agreement</span>
              </label>
              <Btn onClick={() => setStep("password")} disabled={!agreed}>Continue — Create Password →</Btn>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#F26751", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 8px" }}>Create Your Password</p>
              <p style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#94A3B8", margin: "0 0 18px", lineHeight: 1.6 }}>Choose a strong password (minimum 8 characters) to secure your account.</p>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" style={inp} />
              <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" type="password" style={inp} />
              {error && <p style={{ fontSize: 12, color: "#F26751", fontFamily: "'Inter', sans-serif", margin: "0 0 12px" }}>{error}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <Btn secondary small onClick={() => { setStep("agreement"); setError(""); }}>← Back</Btn>
                <Btn onClick={handleAccept} disabled={loading || !password || !confirm}>{loading ? "Joining..." : "Join Organization →"}</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Team Panel ──────────────────────────────────────────────────────────────
function TeamPanel({ user, orgOwnerId, orgName, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from("organization_members").select("*").eq("org_owner_id", orgOwnerId).order("invited_at", { ascending: false });
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { loadMembers(); }, []);

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true); setInviteError(""); setInviteSuccess("");
    const { error } = await supabase.functions.invoke("invite-user", {
      body: { email: inviteEmail.trim(), role: inviteRole, orgOwnerId, orgName }
    });
    if (error) {
      setInviteError(error.message || "Failed to send invite. Ensure the Edge Function is deployed.");
    } else {
      setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}`);
      setInviteEmail(""); setShowForm(false); loadMembers();
    }
    setInviting(false);
  };

  const revokeAccess = async (id) => {
    if (!window.confirm("Revoke this user's access?")) return;
    await supabase.from("organization_members").update({ status: "revoked" }).eq("id", id);
    loadMembers();
  };

  const statusColor = { pending: "#F26751", active: "#2EC4B6", revoked: "#94A3B8" };
  const inp = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontFamily: BODY, fontSize: 13, outline: "none", boxSizing: "border-box" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
            <span style={{ fontSize: 20, color: "var(--accent)" }}>◈◎</span>
            <h1 style={{ fontSize: 22, fontFamily: DISPLAY, fontWeight: 700, margin: 0, letterSpacing: -0.3, color: "var(--text-primary)" }}>Users</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0, fontFamily: DISPLAY, opacity: 0.7 }}>Manage who has access to {orgName}'s operating system</p>
        </div>
        <Btn small onClick={() => setShowWizard(true)}>+ Add New User</Btn>
      </div>
      {showWizard && <AddUserWizard orgOwnerId={orgOwnerId} orgName={orgName} onComplete={() => { setShowWizard(false); notify("Invitation sent!"); loadMembers(); }} onClose={() => setShowWizard(false)} />}

      {showForm && (
        <Animated delay={0}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--accent-border)", borderLeft: "3px solid var(--accent)", borderRadius: 8, padding: 20, marginBottom: 20 }}>
            <Label>Invite New User</Label>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 12 }} className="px-grid-2">
              <div><Label>Email Address</Label><input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@example.com" type="email" style={inp} onKeyDown={e => e.key === "Enter" && sendInvite()} /></div>
              <div><Label>Role</Label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ ...inp, background: "rgba(16,37,52,0.95)" }}>
                  <option value="member">Member — View only</option>
                  <option value="admin">Admin — Full access</option>
                </select>
              </div>
            </div>
            {inviteError && <p style={{ fontSize: 11, color: "#CC5A4A", fontFamily: MONO, margin: "0 0 10px" }}>{inviteError}</p>}
            {inviteSuccess && <p style={{ fontSize: 11, color: "#2EC4B6", fontFamily: MONO, margin: "0 0 10px" }}>{inviteSuccess}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn secondary small onClick={() => { setShowForm(false); setInviteError(""); setInviteSuccess(""); }}>Cancel</Btn>
              <Btn small onClick={sendInvite} disabled={inviting || !inviteEmail.trim()}>{inviting ? "Sending..." : "Send Invitation →"}</Btn>
            </div>
          </div>
        </Animated>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner medium label="Loading team..." /></div>
      ) : members.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.4 }}>◎</div>
            <p style={{ fontSize: 14, color: "var(--text-primary)", margin: "0 0 6px" }}>No team members yet</p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, fontFamily: MONO }}>Invite users to collaborate on your operating system.</p>
          </div>
        </Card>
      ) : (
        <div>
          {members.map((m, i) => (
            <Animated key={m.id} delay={i * 40}>
              <div style={{ background: "var(--surface)", border: `1px solid ${statusColor[m.status]}22`, borderLeft: `3px solid ${statusColor[m.status] || "#94A3B8"}`, borderRadius: 8, padding: "14px 18px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0, fontFamily: DISPLAY }}>{m.email}</p>
                    <Tag color={m.role === "admin" ? "#F26751" : "#94A3B8"}>{m.role}</Tag>
                    <Tag color={statusColor[m.status] || "#94A3B8"}>{m.status}</Tag>
                  </div>
                  <p style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-secondary)", margin: 0 }}>
                    Invited {new Date(m.invited_at).toLocaleDateString()}{m.joined_at ? ` · Joined ${new Date(m.joined_at).toLocaleDateString()}` : ""}
                  </p>
                </div>
                {m.status !== "revoked" && <Btn danger small onClick={() => revokeAccess(m.id)}>Revoke</Btn>}
              </div>
            </Animated>
          ))}
        </div>
      )}

      <div style={{ marginTop: 28, padding: "14px 18px", background: "rgba(46,196,182,0.04)", border: "1px solid rgba(46,196,182,0.15)", borderRadius: 8 }}>
        <Label c="#2EC4B6">Setup Required</Label>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, fontFamily: BODY, lineHeight: 1.65 }}>
          Sending invitations requires the <code style={{ color: "#F26751", background: "rgba(242,103,81,0.1)", padding: "1px 5px", borderRadius: 3 }}>invite-user</code> Edge Function to be deployed and the SQL migration in <code style={{ color: "#F26751", background: "rgba(242,103,81,0.1)", padding: "1px 5px", borderRadius: 3 }}>supabase/migrations/</code> to be run. See the README for instructions.
        </p>
      </div>
    </div>
  );
}


// ─── Permissions Config ───────────────────────────────────────────────────────
const PERMISSION_SECTIONS = [
  { key: "identity", label: "Identity Layer", desc: "Mission, vision & values", canDelete: false },
  { key: "people",   label: "People Layer",   desc: "Roles & org chart",         canDelete: true  },
  { key: "rhythm",   label: "Rhythm Layer",   desc: "Meeting cadences",           canDelete: true  },
  { key: "health",   label: "Health / POHI",  desc: "Organizational health score",canDelete: false },
  { key: "ai",       label: "AI Features",    desc: "Grading & recommendations",  canDelete: false },
  { key: "team",     label: "Team Management",desc: "Users & invitations",        canDelete: true  },
];
// Permission levels: null = no access, "view" = read, "modify" = read+write, "delete" = read+write+delete
const DEFAULT_PERMISSIONS = {
  admin:  { identity:"delete", people:"delete", rhythm:"delete", health:"modify", ai:"modify", team:"delete" },
  member: { identity:"view",   people:"view",   rhythm:"view",   health:"view",   ai:null,     team:null    },
};
const PERMISSIONS_CONFIG = PERMISSION_SECTIONS; // alias for any remaining references

// ─── Permissions Modal ────────────────────────────────────────────────────────
function PermissionsModal({ member, onSave, onClose }) {
  const [perms, setPerms] = useState(() => {
    if (member.permissions && Object.keys(member.permissions).length > 0) return member.permissions;
    return DEFAULT_PERMISSIONS[member.role] || DEFAULT_PERMISSIONS.member;
  });
  const levelLabel = { null: "No Access", view: "View Only", modify: "View & Modify", delete: "View, Modify & Delete" };
  const levelColor = { null: "#94A3B8", view: "#6EE7D8", modify: "#F26751", delete: "#CC5A4A" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(7,24,39,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--accent-border)", borderRadius: 14, padding: "32px 36px", maxWidth: 560, width: "92%", maxHeight: "82vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h3 style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Manage Permissions</h3>
            <p style={{ fontFamily: MONO, fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{member.email}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn secondary small onClick={() => setPerms(DEFAULT_PERMISSIONS.member)}>Member Defaults</Btn>
            <Btn secondary small onClick={() => setPerms(DEFAULT_PERMISSIONS.admin)}>Full Admin</Btn>
          </div>
        </div>
        {PERMISSION_SECTIONS.map(section => {
          const levels = ["No Access", "View Only", "View & Modify", ...(section.canDelete ? ["View, Modify & Delete"] : [])];
          const vals   = [null, "view", "modify", ...(section.canDelete ? ["delete"] : [])];
          const cur = perms[section.key] ?? null;
          return (
            <div key={section.key} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontFamily: MONO, color: levelColor[String(cur)] || "#94A3B8", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 2px" }}>{section.label}</p>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: BODY, margin: 0 }}>{section.desc}</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {levels.map((label, i) => {
                  const val = vals[i];
                  const active = cur === val || (val === null && cur === null);
                  return (
                    <button key={label} onClick={() => setPerms(p => ({ ...p, [section.key]: val }))} style={{ padding: "6px 14px", background: active ? `${levelColor[String(val)]}18` : "transparent", border: `1px solid ${active ? levelColor[String(val)] : "var(--border)"}`, borderRadius: 6, color: active ? levelColor[String(val)] : "var(--text-secondary)", fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer" }}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <Btn secondary small onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => onSave(perms)}>Save Permissions ✓</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────
function EditUserModal({ member, onSave, onClose }) {
  const [email, setEmail] = useState(member.email || "");
  const [phone, setPhone] = useState(member.phone || "");
  const [role, setRole] = useState(member.role || "member");
  const [saving, setSaving] = useState(false);
  const inp = { width: "100%", padding: "10px 13px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontFamily: BODY, fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 14 };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(7,24,39,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "32px 36px", maxWidth: 440, width: "92%", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <h3 style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 24px" }}>Edit User</h3>
        <Label>Email Address</Label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" style={inp} />
        <Label>Phone Number <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>(for 2FA)</span></Label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" style={inp} />
        <Label>Role</Label>
        <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inp, background: "rgba(16,37,52,0.95)", marginBottom: 24 }}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn secondary small onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => { setSaving(true); onSave({ email, phone, role }).finally(() => setSaving(false)); }} disabled={saving || !email.trim()}>{saving ? "Saving..." : "Save Changes ✓"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Activity Logs View ───────────────────────────────────────────────────────
function ActivityLogsView({ orgOwnerId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const layerColor = { identity: "#F26751", people: "#2EC4B6", rhythm: "#A87EC8", health: "#6EE7D8", onboarding: "#F26751", rhythm_layer: "#A87EC8" };
  useEffect(() => {
    supabase.from("activity_logs").select("*")
      .or(`org_id.eq.${orgOwnerId},user_id.eq.${orgOwnerId}`)
      .order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, [orgOwnerId]);
  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner medium label="Loading logs..." /></div>;
  if (!logs.length) return <Card><div style={{ textAlign: "center", padding: "20px 0" }}><p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>No activity logged yet.</p></div></Card>;
  return (
    <div>
      {logs.map((log, i) => (
        <div key={log.id || i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 16px", borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: layerColor[log.layer] || "#94A3B8", flexShrink: 0, marginTop: 5 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, color: "var(--text-primary)", margin: "0 0 3px", fontFamily: DISPLAY }}>{log.action}</p>
            <p style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-secondary)", margin: 0 }}>
              {log.user_email || "System"} · {log.layer} {log.detail ? `· ${log.detail}` : ""}
            </p>
          </div>
          <span style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-secondary)", flexShrink: 0, marginTop: 2 }}>
            {log.created_at ? new Date(log.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Security / 2FA Settings ──────────────────────────────────────────────────
function SecuritySettings({ user }) {
  const meta = user?.user_metadata || {};
  const emailOtpEnabled = meta.two_fa_enabled && meta.two_fa_method === "email";
  const [factors, setFactors] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [factorId, setFactorId] = useState(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyStep, setVerifyStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const codeInp = { width: "100%", maxWidth: 200, padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontFamily: MONO, fontSize: 22, outline: "none", letterSpacing: 8, textAlign: "center", boxSizing: "border-box" };

  const loadFactors = async () => { const { data } = await supabase.auth.mfa.listFactors(); setFactors(data?.totp || []); };
  useEffect(() => { loadFactors(); }, []);

  const toggleEmailOtp = async () => {
    setLoading(true); setError(""); setSuccess("");
    const { error: err } = await supabase.auth.updateUser({
      data: { two_fa_enabled: !emailOtpEnabled, two_fa_method: "email" }
    });
    if (err) { setError(err.message); } else { setSuccess(emailOtpEnabled ? "Email 2FA disabled." : "Email 2FA enabled. A code will be sent to your email each time you sign in."); }
    setLoading(false);
  };

  const startEnroll = async () => {
    setLoading(true); setError(""); setSuccess("");
    const { data, error: enrollErr } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (enrollErr) { setError(enrollErr.message); setLoading(false); return; }
    setQrCode(data.totp.qr_code); setSecret(data.totp.secret); setFactorId(data.id); setVerifyStep(true); setLoading(false);
  };

  const verifyEnroll = async () => {
    setLoading(true); setError("");
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr) { setError(cErr.message); setLoading(false); return; }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code: verifyCode.replace(/\s/g, "") });
    if (vErr) { setError("Invalid code. Try again."); setLoading(false); return; }
    setSuccess("Authenticator app 2FA enabled."); setVerifyStep(false); setQrCode(null); setVerifyCode(""); loadFactors(); setLoading(false);
  };

  const unenroll = async (id) => {
    if (!window.confirm("Remove authenticator 2FA from your account?")) return;
    await supabase.auth.mfa.unenroll({ factorId: id }); setSuccess("Authenticator 2FA removed."); loadFactors();
  };

  const activeFactor = factors.find(f => f.status === "verified");

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>Security & Two-Factor Authentication</h2>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "var(--text-secondary)", margin: "0 0 28px", lineHeight: 1.65 }}>Add an extra layer of protection. When enabled, you'll need to verify your identity each time you sign in.</p>

      {success && <div style={{ padding: "12px 16px", background: "rgba(46,196,182,0.08)", border: "1px solid rgba(46,196,182,0.25)", borderRadius: 8, marginBottom: 20 }}><p style={{ fontSize: 13, color: "#2EC4B6", fontFamily: BODY, margin: 0 }}>{success}</p></div>}
      {error && <div style={{ padding: "12px 16px", background: "var(--danger-dim)", border: "1px solid var(--danger-border)", borderRadius: 8, marginBottom: 20 }}><p style={{ fontSize: 13, color: "var(--danger)", fontFamily: BODY, margin: 0 }}>{error}</p></div>}

      {/* Option 1: Email OTP (recommended) */}
      <div style={{ background: emailOtpEnabled ? "rgba(242,103,81,0.06)" : "var(--surface)", border: `1px solid ${emailOtpEnabled ? "var(--accent-border)" : "var(--border)"}`, borderRadius: 10, padding: 20, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>📧</span>
              <p style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Email Verification Code</p>
              {emailOtpEnabled && <Tag color="#2EC4B6">Active</Tag>}
              <span style={{ padding: "2px 8px", background: "rgba(242,103,81,0.12)", border: "1px solid var(--accent-border)", borderRadius: 10, fontSize: 8, fontFamily: MONO, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1 }}>Recommended</span>
            </div>
            <p style={{ fontFamily: BODY, fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>When you sign in, a 6-digit code is sent to your email address. Enter it to complete login. No apps required.</p>
          </div>
          <Btn onClick={toggleEmailOtp} disabled={loading} secondary={emailOtpEnabled}>{emailOtpEnabled ? "Disable" : "Enable →"}</Btn>
        </div>
      </div>

      {/* Option 2: Authenticator App */}
      <div style={{ background: activeFactor ? "rgba(46,196,182,0.06)" : "var(--surface)", border: `1px solid ${activeFactor ? "rgba(46,196,182,0.3)" : "var(--border)"}`, borderRadius: 10, padding: 20, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>📱</span>
              <p style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Authenticator App</p>
              {activeFactor && <Tag color="#2EC4B6">Active</Tag>}
            </div>
            <p style={{ fontFamily: BODY, fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px", lineHeight: 1.6 }}>Use an authenticator app to generate 6-digit codes. Works offline and is highly secure.</p>
            {!activeFactor && !verifyStep && (
              <div style={{ padding: "10px 14px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 8 }}>
                <p style={{ fontSize: 10, fontFamily: MONO, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 6px" }}>Recommended Apps</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[["Google Authenticator", "Search on App Store or Google Play"], ["Authy", "authy.com — works across devices"], ["1Password", "Built-in authenticator in 1Password app"]].map(([name, note]) => (
                    <div key={name} style={{ flex: 1, minWidth: 140 }}>
                      <p style={{ fontSize: 11, fontFamily: MONO, color: "var(--text-primary)", margin: "0 0 2px" }}>{name}</p>
                      <p style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: BODY, margin: 0 }}>{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {activeFactor
            ? <Btn danger small onClick={() => unenroll(activeFactor.id)}>Remove</Btn>
            : !verifyStep && <Btn secondary onClick={startEnroll} disabled={loading}>{loading ? "Loading..." : "Set Up →"}</Btn>
          }
        </div>

        {verifyStep && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <p style={{ fontFamily: BODY, fontSize: 13, color: "var(--text-secondary)", margin: "0 0 14px", lineHeight: 1.65 }}><strong style={{ color: "var(--text-primary)" }}>Step 1:</strong> Download an authenticator app above, then open it and tap the + button to add a new account.</p>
            <p style={{ fontFamily: BODY, fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px", lineHeight: 1.65 }}><strong style={{ color: "var(--text-primary)" }}>Step 2:</strong> Scan the QR code below, or manually enter the secret key.</p>
            {qrCode && <div style={{ marginBottom: 14, padding: 16, background: "#fff", borderRadius: 8, display: "inline-block" }}><img src={qrCode} alt="2FA QR Code" style={{ width: 160, height: 160, display: "block" }} /></div>}
            {secret && <div style={{ padding: "10px 14px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 16 }}><p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 4px" }}>Manual Entry Key</p><p style={{ fontSize: 12, fontFamily: MONO, color: "var(--accent)", margin: 0, letterSpacing: 2, wordBreak: "break-all" }}>{secret}</p></div>}
            <p style={{ fontFamily: BODY, fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px", lineHeight: 1.65 }}><strong style={{ color: "var(--text-primary)" }}>Step 3:</strong> Enter the 6-digit code the app shows to confirm setup.</p>
            <input value={verifyCode} onChange={e => setVerifyCode(e.target.value)} placeholder="000 000" maxLength={7} style={codeInp} />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <Btn secondary small onClick={() => { setVerifyStep(false); setQrCode(null); if (factorId) supabase.auth.mfa.unenroll({ factorId }); }}>Cancel</Btn>
              <Btn onClick={verifyEnroll} disabled={loading || verifyCode.replace(/\s/g,"").length < 6}>{loading ? "Verifying..." : "Confirm & Enable →"}</Btn>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "12px 16px", background: "rgba(148,163,184,0.05)", border: "1px solid var(--border)", borderRadius: 8 }}>
        <p style={{ fontSize: 11, fontFamily: MONO, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 4px" }}>SMS / Text Message 2FA</p>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: BODY, margin: 0, lineHeight: 1.6 }}>Phone number 2FA (SMS codes) is available when Twilio is connected to your Supabase project. Phone numbers can be added per user in the Users tab and will be used once SMS 2FA is configured.</p>
      </div>
    </div>
  );
}


// ─── Add User Wizard ──────────────────────────────────────────────────────────
function AddUserWizard({ orgOwnerId, orgName, onComplete, onClose }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ email: "", phone: "", name: "" });
  const [roleType, setRoleType] = useState(null);
  const [perms, setPerms] = useState({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const inp = { width: "100%", padding: "10px 13px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontFamily: BODY, fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 14 };
  const levelColor = { null: "#94A3B8", view: "#6EE7D8", modify: "#F26751", delete: "#CC5A4A" };

  const sendInvitation = async () => {
    setSending(true); setError("");
    const finalPerms = roleType === "admin" ? DEFAULT_PERMISSIONS.admin : perms;
    const { error: invErr } = await supabase.functions.invoke("invite-user", {
      body: { email: profile.email.trim(), role: roleType === "admin" ? "admin" : "member", orgOwnerId, orgName }
    });
    if (invErr) { setError(invErr.message || "Invite failed. Is the Edge Function deployed?"); setSending(false); return; }
    // Save permissions to member record after invite creates it
    if (roleType !== "admin") {
      await supabase.from("organization_members").update({ permissions: finalPerms, phone: profile.phone })
        .eq("org_owner_id", orgOwnerId).eq("email", profile.email.trim().toLowerCase()).eq("status", "pending");
    }
    onComplete();
  };

  const stepTitles = ["", "User Details", "Select Role", "Set Permissions"];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(7,24,39,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--accent-border)", borderRadius: 14, padding: "36px 40px", maxWidth: 520, width: "92%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.6)", animation: "fadeUp 0.3s ease both" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <h3 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>{stepTitles[step]}</h3>
            <p style={{ fontFamily: MONO, fontSize: 9, color: "var(--text-secondary)", margin: 0, textTransform: "uppercase", letterSpacing: 1.5 }}>Step {step} of {roleType === "admin" || step < 2 ? 2 : 3}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>
        <div style={{ height: 2, background: "var(--border)", borderRadius: 1, marginBottom: 28 }}>
          <div style={{ width: `${(step / (roleType === "limited" ? 3 : 2)) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 1, transition: "width 0.3s" }} />
        </div>

        {/* Step 1: User details */}
        {step === 1 && (
          <div>
            <Label>Email Address <span style={{ color: "var(--danger)", marginLeft: 2 }}>*</span></Label>
            <input value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} placeholder="user@example.com" type="email" style={inp} />
            <Label>Phone Number <span style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 400 }}>optional — for SMS 2FA</span></Label>
            <input value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} placeholder="+1 (555) 000-0000" style={inp} />
            <Label>Full Name <span style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 400 }}>optional</span></Label>
            <input value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} placeholder="Jane Smith" style={{...inp, marginBottom: 28}} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn secondary small onClick={onClose}>Cancel</Btn>
              <Btn onClick={() => setStep(2)} disabled={!profile.email.trim() || !profile.email.includes("@")}>Next →</Btn>
            </div>
          </div>
        )}

        {/* Step 2: Role selection */}
        {step === 2 && (
          <div>
            <p style={{ fontFamily: BODY, fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.65 }}>Choose the access level for <strong style={{ color: "var(--text-primary)" }}>{profile.email}</strong>.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              <button onClick={() => setRoleType("admin")} style={{ padding: "18px 20px", background: roleType === "admin" ? "rgba(242,103,81,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${roleType === "admin" ? "var(--accent-border)" : "var(--border)"}`, borderLeft: `3px solid ${roleType === "admin" ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
                <p style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: roleType === "admin" ? "var(--accent)" : "var(--text-primary)", margin: "0 0 4px" }}>Admin — Full Access</p>
                <p style={{ fontFamily: BODY, fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Can view, edit, and delete everything across all layers. Can manage team members and settings.</p>
              </button>
              <button onClick={() => setRoleType("limited")} style={{ padding: "18px 20px", background: roleType === "limited" ? "rgba(46,196,182,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${roleType === "limited" ? "rgba(46,196,182,0.35)" : "var(--border)"}`, borderLeft: `3px solid ${roleType === "limited" ? "#2EC4B6" : "var(--border)"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
                <p style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: roleType === "limited" ? "#2EC4B6" : "var(--text-primary)", margin: "0 0 4px" }}>Limited User — Custom Permissions</p>
                <p style={{ fontFamily: BODY, fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Choose specific access levels for each area of the application on the next screen.</p>
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Btn secondary small onClick={() => setStep(1)}>← Back</Btn>
              <Btn onClick={() => roleType === "admin" ? sendInvitation() : setStep(3)} disabled={!roleType || sending}>
                {sending ? "Sending..." : roleType === "admin" ? "Finish & Send Invite →" : "Next — Set Permissions →"}
              </Btn>
            </div>
            {error && <p style={{ fontSize: 12, color: "var(--danger)", fontFamily: BODY, margin: "12px 0 0" }}>{error}</p>}
          </div>
        )}

        {/* Step 3: Permissions (limited users only) */}
        {step === 3 && (
          <div>
            <p style={{ fontFamily: BODY, fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.65 }}>Set permissions for each area. You can update these at any time from the Users page.</p>
            {PERMISSION_SECTIONS.map(section => {
              const levels = ["No Access", "View Only", "View & Modify", ...(section.canDelete ? ["View, Modify & Delete"] : [])];
              const vals   = [null, "view", "modify", ...(section.canDelete ? ["delete"] : [])];
              const cur = perms[section.key] ?? "view";
              return (
                <div key={section.key} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 11, fontFamily: MONO, color: levelColor[String(cur)] || "#94A3B8", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 2px" }}>{section.label}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: BODY, margin: 0 }}>{section.desc}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {levels.map((label, i) => {
                      const val = vals[i];
                      const active = cur === val || (val === null && cur === null);
                      return (
                        <button key={label} onClick={() => setPerms(p => ({...p, [section.key]: val}))} style={{ padding: "5px 12px", background: active ? `${levelColor[String(val)]}18` : "transparent", border: `1px solid ${active ? levelColor[String(val)] : "var(--border)"}`, borderRadius: 5, color: active ? levelColor[String(val)] : "var(--text-secondary)", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer" }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {error && <p style={{ fontSize: 12, color: "var(--danger)", fontFamily: BODY, margin: "0 0 12px" }}>{error}</p>}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <Btn secondary small onClick={() => setStep(2)}>← Back</Btn>
              <Btn onClick={sendInvitation} disabled={sending}>{sending ? "Sending Invite..." : "Finish & Send Invite →"}</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Users Settings ───────────────────────────────────────────────────────────
function UsersSettings({ user, orgOwnerId, orgName }) {
  const [tab, setTab] = useState("active");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);
  const [permsMember, setPermsMember] = useState(null);
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [showWizard, setShowWizard] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from("organization_members").select("*").eq("org_owner_id", orgOwnerId).order("invited_at", { ascending: false });
    setMembers(data || []);
    setLoading(false);
  };
  useEffect(() => { loadMembers(); }, []);

  const notify = (msg, isErr = false) => { if (isErr) { setActionErr(msg); setActionMsg(""); } else { setActionMsg(msg); setActionErr(""); } setTimeout(() => { setActionMsg(""); setActionErr(""); }, 4000); };

  const saveUser = async (member, updates) => {
    await supabase.from("organization_members").update({ email: updates.email, phone: updates.phone, role: updates.role }).eq("id", member.id);
    setEditingMember(null); notify("User updated."); loadMembers();
  };

  const savePermissions = async (member, perms) => {
    await supabase.from("organization_members").update({ permissions: perms }).eq("id", member.id);
    setPermsMember(null); notify("Permissions saved."); loadMembers();
  };

  const sendResetPassword = async (member) => {
    const { error } = await supabase.functions.invoke("invite-user", { body: { email: member.email, orgOwnerId, orgName, resetPassword: true } });
    if (error) { notify("Failed to send reset email. Is the Edge Function deployed?", true); return; }
    notify(`Password reset email sent to ${member.email}.`);
  };

  const resendInvite = async (member) => {
    const { error } = await supabase.functions.invoke("invite-user", { body: { email: member.email, role: member.role, orgOwnerId, orgName, resend: true } });
    if (error) { notify("Failed to resend. Is the Edge Function deployed?", true); return; }
    notify(`Invitation resent to ${member.email}.`); loadMembers();
  };

  const disableUser = async (member) => {
    if (!window.confirm(`Disable ${member.email}? They will lose access immediately.`)) return;
    await supabase.from("organization_members").update({ status: "revoked", disabled_at: new Date().toISOString() }).eq("id", member.id);
    notify(`${member.email} has been disabled.`); loadMembers();
  };

  const enableUser = async (member) => {
    await supabase.from("organization_members").update({ status: "active", disabled_at: null }).eq("id", member.id);
    notify(`${member.email} re-enabled.`); loadMembers();
  };

  const activeMembers = members.filter(m => m.status === "active" || m.status === "pending");
  const disabledMembers = members.filter(m => m.status === "revoked");
  const statusColor = { pending: "#F26751", active: "#2EC4B6", revoked: "#94A3B8" };

  const MemberRow = ({ m }) => (
    <Animated delay={0}>
      <div style={{ background: "var(--surface)", border: `1px solid ${statusColor[m.status] || "#243746"}22`, borderLeft: `3px solid ${statusColor[m.status] || "#94A3B8"}`, borderRadius: 8, padding: "14px 18px", marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0, fontFamily: DISPLAY }}>{m.email}</p>
              <Tag color={m.role === "admin" ? "#F26751" : "#94A3B8"}>{m.role}</Tag>
              <Tag color={statusColor[m.status] || "#94A3B8"}>{m.status}</Tag>
            </div>
            <p style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-secondary)", margin: 0 }}>
              {m.phone ? `📱 ${m.phone}  ·  ` : ""}
              Invited {new Date(m.invited_at).toLocaleDateString()}{m.joined_at ? ` · Joined ${new Date(m.joined_at).toLocaleDateString()}` : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Btn secondary small onClick={() => setEditingMember(m)}>Edit</Btn>
            <Btn secondary small onClick={() => setPermsMember(m)}>Permissions</Btn>
            {m.status === "active" && <Btn secondary small onClick={() => sendResetPassword(m)}>Reset Password</Btn>}
            {m.status === "pending" && <Btn secondary small onClick={() => resendInvite(m)}>Resend Invite</Btn>}
            {m.status !== "revoked" && <Btn danger small onClick={() => disableUser(m)}>Disable</Btn>}
          </div>
        </div>
      </div>
    </Animated>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {[["active", `Active (${activeMembers.length})`], ["disabled", `Disabled (${disabledMembers.length})`], ["logs", "User Logs"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: "10px 18px", background: "none", border: "none", borderBottom: tab === key ? "2px solid var(--accent)" : "2px solid transparent", color: tab === key ? "var(--accent)" : "var(--text-secondary)", fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, cursor: "pointer", marginBottom: -1 }}>{label}</button>
        ))}
      </div>

      {actionMsg && <div style={{ padding: "10px 14px", background: "rgba(46,196,182,0.08)", border: "1px solid rgba(46,196,182,0.2)", borderRadius: 6, marginBottom: 16 }}><p style={{ fontSize: 12, color: "#2EC4B6", fontFamily: BODY, margin: 0 }}>{actionMsg}</p></div>}
      {actionErr && <div style={{ padding: "10px 14px", background: "var(--danger-dim)", border: "1px solid var(--danger-border)", borderRadius: 6, marginBottom: 16 }}><p style={{ fontSize: 12, color: "var(--danger)", fontFamily: BODY, margin: 0 }}>{actionErr}</p></div>}

      {loading ? <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner medium label="Loading users..." /></div> : (
        <div>
          {tab === "active" && (
            <div>
              {/* Owner row — always shown first */}
              <Animated delay={0}>
                <div style={{ background: "rgba(242,103,81,0.06)", border: "1px solid rgba(242,103,81,0.2)", borderLeft: "3px solid var(--accent)", borderRadius: 8, padding: "14px 18px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0, fontFamily: DISPLAY }}>{user.email}</p>
                      <Tag color="var(--accent)">Owner</Tag>
                      <Tag color="#2EC4B6">Active</Tag>
                    </div>
                    <p style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-secondary)", margin: 0 }}>Account owner · Full access to all features</p>
                  </div>
                </div>
              </Animated>
              {activeMembers.length === 0
                ? <Card><div style={{ textAlign: "center", padding: "12px 0" }}><p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>No additional users yet. Click "+ Add New User" to invite someone.</p></div></Card>
                : activeMembers.map(m => <MemberRow key={m.id} m={m} />)
              }
            </div>
          )}
          {tab === "disabled" && (
            disabledMembers.length === 0
              ? <Card><div style={{ textAlign: "center", padding: "20px 0" }}><p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>No disabled users.</p></div></Card>
              : disabledMembers.map(m => (
                <Animated key={m.id} delay={0}>
                  <div style={{ background: "var(--surface)", border: "1px solid #24374622", borderLeft: "3px solid #94A3B8", borderRadius: 8, padding: "14px 18px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 3px", fontFamily: DISPLAY }}>{m.email}</p>
                      <p style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-secondary)", margin: 0 }}>Disabled {m.disabled_at ? new Date(m.disabled_at).toLocaleDateString() : ""}</p>
                    </div>
                    <Btn small onClick={() => enableUser(m)}>Re-enable</Btn>
                  </div>
                </Animated>
              ))
          )}
          {tab === "logs" && <ActivityLogsView orgOwnerId={orgOwnerId} />}
        </div>
      )}

      {editingMember && <EditUserModal member={editingMember} onSave={updates => saveUser(editingMember, updates)} onClose={() => setEditingMember(null)} />}
      {permsMember && <PermissionsModal member={permsMember} onSave={perms => savePermissions(permsMember, perms)} onClose={() => setPermsMember(null)} />}
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────────
function SettingsPage({ user, orgOwnerId, orgName, onClose }) {
  const [tab, setTab] = useState("users");
  const tabs = [["users", "Users"], ["security", "Security & 2FA"]];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
            <span style={{ fontSize: 20, color: "#6EE7D8" }}>⚙</span>
            <h1 style={{ fontSize: 22, fontFamily: DISPLAY, fontWeight: 700, margin: 0, letterSpacing: -0.3, color: "var(--text-primary)" }}>Settings</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0, fontFamily: DISPLAY, opacity: 0.7 }}>{orgName}</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 2, marginBottom: 28, borderBottom: "1px solid var(--border)" }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: "10px 20px", background: "none", border: "none", borderBottom: tab === key ? "2px solid #6EE7D8" : "2px solid transparent", color: tab === key ? "#6EE7D8" : "var(--text-secondary)", fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, cursor: "pointer", marginBottom: -1 }}>{label}</button>
        ))}
      </div>
      {tab === "users"    && <UsersSettings user={user} orgOwnerId={orgOwnerId} orgName={orgName} />}
      {tab === "security" && <SecuritySettings user={user} />}
    </div>
  );
}


// ─── Maven — Organizational Clarity Coach ────────────────────────────────────
function MavenPanel({ identity, orgName, orgType, onApply, onClose }) {
  const FIELDS = [
    { key: "mission",       label: "Mission",              emoji: "🎯", desc: "Why you exist",                  q: "What problem is so persistent and important that you built an entire organization around solving it? What changes in the world because of what you do?" },
    { key: "vision_north",  label: "North Star Vision",    emoji: "⭐", desc: "Long-term destination",          q: "If your organization was wildly successful 20 years from now — what would the world look like? Paint me a picture of the future you're building toward." },
    { key: "vision_phase",  label: "Phase 1 Vision",       emoji: "🏁", desc: "Near-term milestones",           q: "In the next 1–3 years, what would need to be true for you to look back and say 'we crushed it'? Give me specifics — numbers, milestones, things you could point to." },
    { key: "values",        label: "Core Values",          emoji: "🧭", desc: "Non-negotiable principles",      q: "Tell me about a moment on your team where you thought 'that's exactly who we are.' What principles were at work in that moment?" },
    { key: "positioning",   label: "Positioning Statement",emoji: "🎪", desc: "Who you serve & why you're different", q: "Who is your ideal customer or member — be specific. And if they were explaining you to a friend, why would they say they chose you over anyone else?" },
  ];

  const [phase, setPhase] = useState("discovery");
  const [haveSet, setHaveSet] = useState(new Set(
    FIELDS.filter(f => f.key === "values"
      ? identity?.values?.some(v => v.name?.trim())
      : identity?.[f.key]?.trim()
    ).map(f => f.key)
  ));
  const [queue, setQueue] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [draftVisible, setDraftVisible] = useState(false);
  const bottomRef = useRef(null);

  const currentField = queue[qIdx];
  const mavenBubble = { background: "rgba(242,103,81,0.08)", border: "1px solid rgba(242,103,81,0.2)", borderRadius: "4px 14px 14px 14px", padding: "12px 16px", maxWidth: "80%" };
  const userBubble  = { background: "rgba(110,231,216,0.08)", border: "1px solid rgba(110,231,216,0.15)", borderRadius: "14px 4px 14px 14px", padding: "12px 16px", maxWidth: "80%", marginLeft: "auto" };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const toggle = (key) => setHaveSet(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const proceed = async () => {
    const missing = FIELDS.filter(f => !haveSet.has(f.key));
    if (missing.length === 0) { onClose(); return; }
    setQueue(missing); setQIdx(0); setPhase("coaching"); setMessages([]); setDraftVisible(false);
    await askOpening(missing[0]);
  };

  const askOpening = async (field) => {
    setLoading(true);
    const r = await callClaude(`You are Maven, an organizational clarity coach inside Perspexis. Help leaders discover their organizational identity through honest conversation.

Coaching ${orgName || "this organization"} (${orgType || "Organization"}) on their ${field.label} — ${field.desc}.

Ask your opening question. Warm, direct, conversational. Adapt naturally for a ${orgType || "organization"}. One or two sentences max. Just the question, no preamble.

Base question: ${field.q}`);
    setMessages([{ role: "maven", text: r }]);
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setInput(""); setLoading(true);
    const turns = newMsgs.filter(m => m.role === "user").length;
    if (turns >= 2 && !draftVisible) { await generateDraft(newMsgs); }
    else if (draftVisible) { await refineDraft(newMsgs); }
    else { await followUp(newMsgs); }
  };

  const hist = (msgs) => msgs.map(m => `${m.role === "maven" ? "Maven" : "Them"}: ${m.text}`).join("\n\n");

  const followUp = async (msgs) => {
    const r = await callClaude(`You are Maven coaching ${orgName || "this org"} on their ${currentField?.label}.\n\nConversation:\n${hist(msgs)}\n\nAsk one focused follow-up question. Keep it short — just the question.`);
    setMessages(p => [...p, { role: "maven", text: r }]); setLoading(false);
  };

  const generateDraft = async (msgs) => {
    const context = msgs.filter(m => m.role === "user").map(m => m.text).join(" | ");
    const isValues = currentField?.key === "values";
    const prompt = isValues
      ? `Based on this conversation, identify 3–5 core values for ${orgName || "this organization"} (${orgType || "Organization"}).\n\nWhat they shared: ${context}\n\nFormat each as: VALUE NAME: one-sentence description.\nList only, no preamble.`
      : `Based on this conversation, write a ${currentField?.label} for ${orgName || "this organization"} (${orgType || "Organization"}).\n\nWhat they shared: ${context}\n\nRequirements: specific and genuine, 1–3 sentences, in their voice. Write only the ${currentField?.label} text.`;
    const draft = await callClaude(prompt);
    setDrafts(p => ({ ...p, [currentField.key]: draft }));
    setMessages(p => [...p, { role: "maven", text: `Here's a draft based on what you've shared:\n\n"${draft}"\n\nDoes this feel right? Tell me what to adjust, or click Use This to move on.` }]);
    setDraftVisible(true); setLoading(false);
  };

  const refineDraft = async (msgs) => {
    const feedback = msgs[msgs.length - 1].text;
    const old = drafts[currentField?.key] || "";
    const newDraft = await callClaude(`Refine this ${currentField?.label}:\nCurrent: "${old}"\nFeedback: "${feedback}"\nWrite the improved version only.`);
    setDrafts(p => ({ ...p, [currentField.key]: newDraft }));
    setMessages(p => [...p, { role: "maven", text: `Revised:\n\n"${newDraft}"\n\nBetter? Click Use This when ready.` }]);
    setLoading(false);
  };

  const useThisDraft = () => {
    if (qIdx + 1 < queue.length) { setQIdx(i => i + 1); setDraftVisible(false); setMessages([]); askOpening(queue[qIdx + 1]); }
    else { setPhase("review"); }
  };

  const applyAll = () => {
    const applied = { ...drafts };
    if (typeof applied.values === "string") {
      const parsed = applied.values.split("\n").filter(l => l.trim()).map(l => {
        const clean = l.replace(/^\d+\.\s*/, "");
        const idx = clean.indexOf(":");
        return idx > 0 ? { name: clean.slice(0, idx).trim(), desc: clean.slice(idx + 1).trim() } : { name: clean.trim(), desc: "" };
      }).filter(v => v.name);
      if (parsed.length > 0) applied.values = parsed;
    }
    onApply(applied);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#071827", zIndex: 500, display: "flex", flexDirection: "column", fontFamily: DISPLAY }}>
      {/* Nav bar */}
      <div style={{ padding: "14px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(16,37,52,0.9)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(242,103,81,0.15)", border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</div>
          <div>
            <p style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Maven</p>
            <p style={{ fontFamily: MONO, fontSize: 9, color: "var(--accent)", margin: 0, textTransform: "uppercase", letterSpacing: 1.5 }}>Organizational Clarity Coach</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-secondary)", cursor: "pointer", padding: "5px 14px", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>← Back to Form</button>
      </div>

      {/* ── Discovery ── */}
      {phase === "discovery" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 24px", maxWidth: 620, margin: "0 auto", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 10px" }}>Hi, I'm Maven 👋</p>
            <p style={{ fontFamily: BODY, fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.75 }}>I'm here to help you discover and articulate your organizational identity. Let's start with what you already have.</p>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, marginBottom: 24 }}>
            <Label>Which of these do you already have? (select all that apply)</Label>
            <p style={{ fontFamily: BODY, fontSize: 12, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.55 }}>For anything you select, you'll enter it directly. For what's left, I'll help you work through it conversationally.</p>
            {FIELDS.map(f => (
              <button key={f.key} onClick={() => toggle(f.key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: haveSet.has(f.key) ? "rgba(242,103,81,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${haveSet.has(f.key) ? "var(--accent-border)" : "var(--border)"}`, borderRadius: 8, cursor: "pointer", marginBottom: 8, textAlign: "left" }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: haveSet.has(f.key) ? "var(--accent)" : "transparent", border: `2px solid ${haveSet.has(f.key) ? "var(--accent)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {haveSet.has(f.key) && <span style={{ color: "#071827", fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <p style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 600, color: haveSet.has(f.key) ? "var(--accent)" : "var(--text-primary)", margin: "0 0 2px" }}>{f.emoji} {f.label}</p>
                  <p style={{ fontFamily: BODY, fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{f.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <Btn secondary small onClick={onClose}>Enter Everything Manually</Btn>
            <Btn onClick={proceed}>{FIELDS.filter(f => !haveSet.has(f.key)).length === 0 ? "All set — continue →" : `Let's Build ${FIELDS.filter(f => !haveSet.has(f.key)).length} Element${FIELDS.filter(f => !haveSet.has(f.key)).length > 1 ? "s" : ""} Together →`}</Btn>
          </div>
        </div>
      )}

      {/* ── Coaching ── */}
      {phase === "coaching" && currentField && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 700, margin: "0 auto", width: "100%" }}>
          <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ fontFamily: MONO, fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5, margin: 0 }}>{currentField.emoji} {currentField.label} · {qIdx + 1} of {queue.length}</p>
              <p style={{ fontFamily: MONO, fontSize: 9, color: "var(--text-secondary)", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>{currentField.desc}</p>
            </div>
            <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
              <div style={{ width: `${((qIdx + (draftVisible ? 1 : 0.5)) / queue.length) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 2, transition: "width 0.4s" }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "maven" ? "flex-start" : "flex-end" }}>
                {m.role === "maven" && <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 5px" }}>✦ Maven</p>}
                <div style={m.role === "maven" ? mavenBubble : userBubble}>
                  <p style={{ fontSize: 13, fontFamily: BODY, color: "var(--text-primary)", margin: 0, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{m.text}</p>
                </div>
              </div>
            ))}
            {loading && <div><p style={{ fontSize: 9, fontFamily: MONO, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 5px" }}>✦ Maven</p><div style={mavenBubble}><div style={{ display: "flex", gap: 5 }}>{[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: `arcFade 1.2s ease ${i*0.2}s infinite` }} />)}</div></div></div>}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", flexShrink: 0, background: "rgba(16,37,52,0.7)" }}>
            {draftVisible && <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}><Btn small onClick={useThisDraft}>{qIdx + 1 < queue.length ? "Use This → Next Element" : "Use This → Review All"}</Btn></div>}
            <div style={{ display: "flex", gap: 10 }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Type your response… (Enter to send)" rows={2} style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontFamily: BODY, fontSize: 13, outline: "none", resize: "none" }} />
              <button onClick={send} disabled={loading || !input.trim()} style={{ padding: "10px 18px", background: input.trim() && !loading ? "var(--accent)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, color: input.trim() && !loading ? "#071827" : "var(--text-secondary)", fontFamily: DISPLAY, fontSize: 11, fontWeight: 700, cursor: input.trim() && !loading ? "pointer" : "default" }}>Send →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review ── */}
      {phase === "review" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 24px", maxWidth: 620, margin: "0 auto", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
            <p style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>Here's what we discovered together</p>
            <p style={{ fontFamily: BODY, fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.65 }}>Review the drafts below. Click "Apply to Identity Form" to populate your fields — you can still edit from there.</p>
          </div>
          {Object.entries(drafts).map(([key, value]) => {
            const f = FIELDS.find(f => f.key === key);
            return f ? (
              <div key={key} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)", borderRadius: 8, padding: 20, marginBottom: 14 }}>
                <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 8px" }}>{f.emoji} {f.label}</p>
                <p style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: BODY, margin: 0, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{typeof value === "string" ? value : Array.isArray(value) ? value.map(v => `${v.name}: ${v.desc}`).join("\n") : JSON.stringify(value)}</p>
              </div>
            ) : null;
          })}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 28 }}>
            <Btn secondary small onClick={onClose}>Close Without Applying</Btn>
            <Btn onClick={applyAll}>Apply to Identity Form →</Btn>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Maven Knowledge Base ─────────────────────────────────────────────────────
const MAVEN_KNOWLEDGE = `
PERSPEXIS PLATFORM GUIDE — Maven's Reference

LAYERS:
• Identity Layer: Mission (why you exist), North Star Vision (20-year picture), Phase 1 Vision (1-3 year goals), Core Values (non-negotiables), Positioning (who you serve & why you're different)
• People Layer: Org chart with role definitions, Owns field (responsibilities), Winning Looks Like field (success criteria), AI clarity grading 0-100, structural pressure point diagnosis, AI recommendations
• Rhythm Layer: Meeting cadences (name, frequency, duration, attendees, purpose), rhythm clarity grading, communication gap analysis, AI improvement suggestions
• Health Overview: POHI — Perspexis Organizational Health Index: 6 dimensions: Purpose Clarity, People Clarity, Operational Rhythm, Structural Integrity, Cultural Alignment, Growth Readiness

AI FEATURES:
• ✦ Ask Maven: Conversational coaching to discover and define identity elements
• Grade This Layer: AI scores role or cadence definitions and gives specific feedback
• Diagnose Pressure Points: AI analyzes org chart for structural problems
• Get Recommendations: Actionable next steps based on your specific data
• POHI Analysis: Full organizational health score with written profile narrative

TEAM & SETTINGS:
• Add users via Settings > Users > Add New User (3-step wizard)
• Admin = full access; Limited User = custom permissions per layer
• Permission levels: No Access / View Only / View & Modify / View, Modify & Delete
• 2FA: Email OTP (recommended, no app needed) or Authenticator App (TOTP)
• Activity logs in Settings > Users > User Logs

TROUBLESHOOTING:
• Data not saving: Click the save button after editing; check internet connection
• Data missing after refresh: Re-enter your data — it will save reliably now
• Invitation email not received: Admin can resend from Settings > Users > Resend Invite
• 2FA code not working: Email codes expire — request a new one; for authenticator apps ensure device time is synced
• Grade seems wrong: Grades improve when Owns and Winning Looks Like fields have specific, measurable language

BEST PRACTICES:
• Complete Identity before building People — your mission should inform how you structure your team
• Write role Owns fields with specific outcomes, not job titles
• Run POHI only after all three layers have meaningful content — empty layers lower scores
• Re-grade layers after significant edits to role definitions or cadences
• Enable 2FA for all admin users for account security
`;

// ─── Maven System Prompt Builder ──────────────────────────────────────────────
function buildMavenPrompt(user, orgName, orgType, identity, people, gaps, rhythm, recentHistory) {
  const complete = [identity?.mission, people?.length > 0, rhythm?.cadences?.length > 0].filter(Boolean).length;
  const histText = recentHistory?.length
    ? recentHistory.slice(-8).map(m => `${m.role === 'maven' ? 'Maven' : 'User'}: ${m.text}`).join('\n\n')
    : '';
  return `You are Maven, the AI guide and loyal companion for Perspexis — an organizational operating system that helps businesses, churches, nonprofits, and agencies achieve organizational clarity.

YOUR PERSONALITY & APPROACH:
• Warm and welcoming — like showing a beloved client into their new home for the first time
• Friendly and conversational, never corporate or stiff
• Authoritative about organizational health and clarity — you know what high-performing organizations look like
• Loyal and persistent — you remember everything about this organization and grow with it
• Proactive — you notice trends in their data and surface insights they haven't asked for
• Encouraging — you celebrate wins, big and small
• Direct and specific — no fluff, no filler

YOUR ROLE:
• Primary guide and companion for Perspexis
• Organizational clarity coach (Identity, People, Rhythm, Health)
• Platform tour guide when users want to explore
• Feature announcer as the platform grows
• Troubleshooter and help desk
• Strategic advisor who references their actual data

CURRENT USER:
Email: ${user?.email || 'Unknown'}
Organization: ${orgName || 'Not yet set up'}
Type: ${orgType || 'Not specified'}
Setup Progress: ${complete}/3 layers complete

IDENTITY LAYER:
Mission: ${identity?.mission || '(not defined)'}
North Star Vision: ${identity?.vision_north || '(not defined)'}
Phase 1 Vision: ${identity?.vision_phase || '(not defined)'}
Core Values: ${identity?.values?.filter(v => v.name?.trim()).map(v => v.name).join(', ') || '(not defined)'}
Positioning: ${identity?.positioning || '(not defined)'}

PEOPLE LAYER (${people?.length || 0} roles):
${people?.length ? people.slice(0, 8).map(p => `• ${p.role}: ${p.name || '(Vacant)'}${p.vacant ? ' [VACANT]' : ''} — Owns: ${(p.owns || '').slice(0, 80)}`).join('\n') : '(no roles defined yet)'}
${gaps && gaps !== 'diagnosing' ? `\nStructural notes: ${gaps.slice(0, 300)}` : ''}

RHYTHM LAYER:
${rhythm?.cadences?.length ? `${rhythm.cadences.length} cadences: ${rhythm.cadences.map(c => c.name).join(', ')}` : '(not set up yet)'}

${MAVEN_KNOWLEDGE}

${histText ? `RECENT CONVERSATION:\n${histText}\n` : ''}
RESPONSE STYLE:
• 2-4 sentences unless they need detailed help
• Reference their actual data (org name, specific roles, real mission)
• Celebrate progress naturally — don't force it
• When giving a platform tour, include [NAVIGATE:layer] at the very start of the message to navigate them (valid layers: identity, people, rhythm, health)
• End responses with either a question or a clear next suggestion when appropriate`;
}

// ─── Maven Chat Widget ────────────────────────────────────────────────────────

// ─── Maven Experience ─────────────────────────────────────────────────────────
function MavenExperience({ user, orgName, orgType, identity, people, gaps, rhythm, active, setActive, saveIdentity, addRole, saveRhythm, setRhythmMode, completeTutorial }) {
  const [phase, setPhase] = useState(null);
  // null=chat-bubble-only | welcome | tour | onboard-offer | onboard | done
  const [tourIdx, setTourIdx] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatLoaded, setChatLoaded] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [obStep, setObStep] = useState(0);
  const [obMsgs, setObMsgs] = useState([]);
  const [obDrafts, setObDrafts] = useState({});
  const [obDraftShown, setObDraftShown] = useState(false);
  const [obInput, setObInput] = useState('');
  const [obLoading, setObLoading] = useState(false);
  const chatBottomRef = useRef(null);
  const obBottomRef = useRef(null);

  const TOUR = [
    { layer:'identity', icon:'◈', label:'Identity Layer',    msg:"This is your organization's foundation — Mission, Vision, Values, and Positioning. Everything else you build here rests on what you define in this layer. It answers the question: why do you exist?" },
    { layer:'people',   icon:'◎', label:'People Layer',      msg:"Your org chart lives here. Add every role, define who owns what, and get AI clarity grades on each one. I can also flag structural pressure points — places where your structure is creating friction." },
    { layer:'rhythm',   icon:'◇', label:'Rhythm Layer',      msg:"Healthy organizations run on healthy rhythms. This is where you map your meeting cadences and communication patterns. I'll grade them and show you exactly what's creating alignment — and what's creating noise." },
    { layer:'health',   icon:'◉', label:'Health Overview',   msg:"Once all three layers are built, run your POHI analysis here — the Perspexis Organizational Health Index. It's a 6-dimension score that gives you a real picture of where your organization stands and what to do next." },
  ];

  const OB_STEPS = [
    { key:'mission',     label:'Mission',              q:(n) => `Let's start with the most important question: Why does ${n || "your organization"} exist? What changes in the world because of what you do? Don't overthink it — just tell me what's in your heart.` },
    { key:'vision',      label:'North Star Vision',    q:() => "Now paint me a picture 10-20 years from now if everything goes the way you dream. What does that future look like for your organization?" },
    { key:'values',      label:'Core Values',          q:() => "What are the non-negotiable principles that guide how your team operates? What values would you never compromise on, even under pressure?" },
    { key:'positioning', label:'Positioning',          q:(n) => `Who is ${n || "your organization"} specifically built to serve, and why would someone choose you over any alternative? What makes you genuinely different?` },
    { key:'people',      label:'Team Roles',           q:() => "Now let's sketch your team. Tell me the key roles in your organization — something like 'John Smith as Executive Director, Jane as Operations Manager, two open coordinator positions.' Don't worry about perfection." },
    { key:'rhythm',      label:'Meeting Cadences',     q:() => "Finally — what regular meetings or touchpoints does your team currently have? Walk me through your rhythm. For example: 'Weekly staff meeting Mondays 9am, monthly leadership review...'" },
  ];

  // Check on mount if user is new (no conversations)
  useEffect(() => {
    const checkFirst = async () => {
      const { data } = await supabase.from('maven_conversations').select('id').eq('user_id', user.id).maybeSingle();
      if (!data) setPhase('welcome');
    };
    checkFirst();
  }, []);

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [chatMsgs, chatLoading]);
  useEffect(() => { obBottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [obMsgs, obLoading]);

  const startTour = () => { setPhase('tour'); setTourIdx(0); setActive(TOUR[0].layer); };
  const nextTour = () => {
    if (tourIdx < TOUR.length - 1) { const n = tourIdx + 1; setTourIdx(n); setActive(TOUR[n].layer); }
    else { setPhase('onboard-offer'); }
  };
  const skipTour = () => setPhase('onboard-offer');
  const skipAll = () => { setPhase('done'); };

  const startOnboarding = async () => {
    setPhase('onboard'); setObStep(0); setObDraftShown(false); setObDrafts({});
    setObMsgs([{ role:'maven', text: OB_STEPS[0].q(orgName) }]);
  };

  const parseValues = (text) => {
    if (!text) return [{name:'',desc:''}];
    return text.split('\n').filter(l=>l.trim()).map(l => {
      const c = l.replace(/^\d+\.\s*/,''); const idx = c.indexOf(':');
      return idx > 0 ? {name:c.slice(0,idx).trim(), desc:c.slice(idx+1).trim()} : {name:c.trim(),desc:''};
    }).filter(v=>v.name).slice(0,6);
  };

  const sendObMsg = async () => {
    if (!obInput.trim() || obLoading) return;
    const userMsg = {role:'user', text:obInput.trim()};
    const msgs = [...obMsgs, userMsg];
    setObMsgs(msgs); setObInput(''); setObLoading(true);
    if (obDraftShown) { await refineOrAdvance(msgs); }
    else { await draftObStep(msgs); }
  };

  const draftObStep = async (msgs) => {
    const step = OB_STEPS[obStep];
    const context = msgs.filter(m=>m.role==='user').map(m=>m.text).join(' | ');
    let prompt;
    if (step.key === 'people') {
      prompt = `Parse this team description into a JSON array for ${orgName||"this organization"} (${orgType||"Organization"}).\n\nInput: "${context}"\n\nReturn ONLY a JSON array:\n[{"name":"Full Name or empty","role":"Role Title","type":"leader|director|coordinator|support|pastor","owns":"Responsibilities in 1 sentence","winning":"Success criteria in 1 sentence","reports":"Reports to","vacant":false}]\n\nIf no person is named for a role, set name="" and vacant=true.`;
    } else if (step.key === 'rhythm') {
      prompt = `Parse this meeting description into a rhythm JSON for ${orgName||"this organization"}.\n\nInput: "${context}"\n\nReturn ONLY:\n{"current_state":"One sentence about their current rhythm","cadences":[{"name":"Meeting Name","freq":"Frequency","dur":"Duration","who":"Who attends","purpose":"Purpose"}],"breaks":"Any communication gaps mentioned or empty string"}`;
    } else {
      const isVals = step.key === 'values';
      prompt = `Write a ${step.label} for ${orgName||"this organization"} (${orgType||"Organization"}) based on what they shared.\n\nThey said: "${context}"\n\n${isVals ? 'Write 3-5 core values: VALUE NAME: one-sentence description. One per line, no preamble.' : `Write the ${step.label} in their voice. 1-3 sentences. Specific and genuine. Text only, no preamble.`}`;
    }
    const draft = await callClaude(prompt);
    setObDrafts(p => ({...p, [step.key]: draft}));
    const isParsed = step.key === 'people' || step.key === 'rhythm';
    const msg = isParsed
      ? {role:'maven', text:`Got it — I've mapped that out. Click "Continue" to move on, or tell me anything to adjust.`}
      : {role:'maven', text:`Here's what I heard:\n\n"${draft}"\n\nDoes that capture it? Tell me what to adjust, or say "perfect" to continue.`};
    setObMsgs(p => [...p, msg]);
    setObDraftShown(true);
    setObLoading(false);
  };

  const refineOrAdvance = async (msgs) => {
    const step = OB_STEPS[obStep];
    const feedback = msgs[msgs.length-1].text.toLowerCase();
    const ok = ['perfect','yes','great','looks good','correct','that\'s it','yep','yeah','good','ok','okay','continue','next','move on'].some(w=>feedback.includes(w));
    if (ok || step.key === 'people' || step.key === 'rhythm') {
      await advanceStep();
    } else {
      const old = obDrafts[step.key] || '';
      const refined = await callClaude(`Refine based on feedback.\nCurrent: "${old}"\nFeedback: "${msgs[msgs.length-1].text}"\nWrite the improved version only.`);
      setObDrafts(p => ({...p, [step.key]: refined}));
      setObMsgs(p => [...p, {role:'maven', text:`Updated:\n\n"${refined}"\n\nBetter?`}]);
    }
    setObLoading(false);
  };

  const transitions = {mission:'Love it.',vision:'Powerful.',values:'Those are solid.',positioning:'Crystal clear.',people:'Team is mapped.',rhythm:'Rhythm is set.'};

  const advanceStep = async () => {
    if (obStep + 1 >= OB_STEPS.length) { await applyAll(); return; }
    const next = obStep + 1;
    const t = transitions[OB_STEPS[obStep].key] || 'Perfect.';
    setObStep(next); setObDraftShown(false);
    setObMsgs(p => [...p, {role:'maven', text:`${t} ${OB_STEPS[next].q(orgName)}`}]);
    setObLoading(false);
  };

  const applyAll = async () => {
    setObLoading(true);
    setObMsgs(p => [...p, {role:'maven', text:"Adding everything to your layers now..."}]);
    try {
      const id = { mission:obDrafts.mission||'', vision_north:obDrafts.vision||'', vision_phase:'', values:parseValues(obDrafts.values||''), positioning:obDrafts.positioning||'' };
      await saveIdentity(id); setActive('identity');
    } catch(e) {}
    try {
      const roles = JSON.parse((obDrafts.people||'').match(/\[[\s\S]*\]/)?.[0]||'[]');
      for (const r of roles) { try { await addRole(r); } catch(e) {} }
    } catch(e) {}
    try {
      const rhy = JSON.parse((obDrafts.rhythm||'').match(/\{[\s\S]*\}/)?.[0]||'{}');
      if (rhy.cadences?.length) { await saveRhythm({current:rhy.current_state||'',cadences:rhy.cadences,breaks:rhy.breaks||''}); if (setRhythmMode) setRhythmMode('view'); }
    } catch(e) {}
    setObLoading(false);
    setObMsgs(p => [...p, {role:'maven', text:"✓ Identity layer — done.\n✓ Team roles — added.\n✓ Rhythm cadences — in place.\n\nYou're up and running. I'll be in the bottom-right corner whenever you need me — click the ✦ button."}]);
    setTimeout(() => { setPhase('done'); if (completeTutorial) completeTutorial(); }, 3500);
  };

  // Ongoing chat
  const loadChat = async () => {
    if (chatLoaded) return;
    const {data} = await supabase.from('maven_conversations').select('messages').eq('user_id', user.id).maybeSingle();
    if (data?.messages?.length > 0) { setChatMsgs(data.messages.slice(-30)); }
    else {
      setChatLoading(true);
      const r = await callClaude(buildMavenPrompt(user, orgName, orgType, identity, people, gaps, rhythm, []) + '\n\nThe user just opened your chat. Welcome them warmly and ask what you can help with. 2 sentences max.');
      const msg = {role:'maven', text:r, ts:Date.now()};
      setChatMsgs([msg]);
      await supabase.from('maven_conversations').upsert({user_id:user.id, org_id:user.id, messages:[msg], updated_at:new Date().toISOString()},{onConflict:'user_id'});
      setChatLoading(false);
    }
    setChatLoaded(true);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const uMsg = {role:'user', text:chatInput.trim(), ts:Date.now()};
    const msgs = [...chatMsgs, uMsg];
    setChatMsgs(msgs); setChatInput(''); setChatLoading(true);
    const r = await callClaude(buildMavenPrompt(user, orgName, orgType, identity, people, gaps, rhythm, msgs) + `\n\nCurrently on: ${active} layer.\nRespond helpfully. Include [NAVIGATE:layer] at start if navigating (identity/people/rhythm/health).`);
    const clean = r.replace(/^\[NAVIGATE:(\w+)\]\s?/,(_,l)=>{if(['identity','people','rhythm','health'].includes(l))setActive(l);return '';});
    const mMsg = {role:'maven', text:clean, ts:Date.now()};
    const final = [...msgs, mMsg];
    setChatMsgs(final);
    await supabase.from('maven_conversations').upsert({user_id:user.id, org_id:user.id, messages:final.slice(-50), updated_at:new Date().toISOString()},{onConflict:'user_id'});
    setChatLoading(false);
  };

  useEffect(() => { if (chatOpen) loadChat(); }, [chatOpen]);

  const mvn = {background:'rgba(242,103,81,0.07)', border:'1px solid rgba(242,103,81,0.18)', borderRadius:'4px 14px 14px 14px', padding:'12px 16px', maxWidth:'85%'};
  const usr = {background:'rgba(110,231,216,0.07)', border:'1px solid rgba(110,231,216,0.18)', borderRadius:'14px 4px 14px 14px', padding:'12px 16px', maxWidth:'85%', marginLeft:'auto'};
  const Dots = () => <div style={{display:'flex',gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:'#F26751',animation:`arcFade 1.2s ease ${i*0.2}s infinite`}}/>)}</div>;
  const MvnLabel = () => <p style={{fontSize:8,fontFamily:MONO,color:'#F26751',textTransform:'uppercase',letterSpacing:1.5,margin:'0 0 5px'}}>✦ Maven</p>;

  return (
    <>
      {/* ── Welcome ── */}
      {phase==='welcome' && (
        <div style={{position:'fixed',inset:0,background:'rgba(7,24,39,0.95)',backdropFilter:'blur(10px)',zIndex:800,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div style={{background:'#0D2236',border:'1px solid rgba(242,103,81,0.25)',borderRadius:18,padding:'44px 48px',maxWidth:540,width:'100%',textAlign:'center',animation:'fadeUp 0.5s ease both',boxShadow:'0 32px 80px rgba(0,0,0,0.7)'}}>
            <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(242,103,81,0.12)',border:'2px solid rgba(242,103,81,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 24px'}}>✦</div>
            <h2 style={{fontFamily:DISPLAY,fontSize:26,fontWeight:700,color:'#F5F7FA',margin:'0 0 16px'}}>Welcome to Perspexis.</h2>
            <p style={{fontFamily:BODY,fontSize:15,color:'#94A3B8',lineHeight:1.85,margin:'0 0 32px'}}>I'm Maven — your organizational clarity guide. You've just stepped into your new home, and I'm here to help you build something remarkable inside it.<br/><br/>Let me show you around, then I'll help you get set up.</p>
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <Btn secondary small onClick={skipAll}>Skip for Now</Btn>
              <Btn onClick={startTour}>Show Me Around →</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Tour ── */}
      {phase==='tour' && (
        <>
          <div style={{position:'fixed',inset:0,background:'rgba(7,24,39,0.45)',backdropFilter:'blur(2px)',zIndex:798}} />
          <div style={{position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',width:'90%',maxWidth:540,zIndex:799,animation:'fadeUp 0.3s ease both'}}>
            <div style={{background:'#0D2236',border:'1px solid rgba(242,103,81,0.22)',borderRadius:14,padding:'24px 28px',boxShadow:'0 16px 60px rgba(0,0,0,0.6)'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(242,103,81,0.12)',border:'1px solid rgba(242,103,81,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>✦</div>
                <div>
                  <p style={{fontFamily:MONO,fontSize:9,color:'#F26751',textTransform:'uppercase',letterSpacing:1.5,margin:0}}>Maven · {tourIdx+1} of {TOUR.length}</p>
                  <p style={{fontFamily:DISPLAY,fontSize:15,fontWeight:700,color:'#F5F7FA',margin:'3px 0 0'}}>{TOUR[tourIdx].icon} {TOUR[tourIdx].label}</p>
                </div>
              </div>
              <p style={{fontFamily:BODY,fontSize:13,color:'#94A3B8',lineHeight:1.8,margin:'0 0 20px'}}>{TOUR[tourIdx].msg}</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <button onClick={skipTour} style={{background:'none',border:'none',color:'#94A3B8',fontFamily:MONO,fontSize:9,textTransform:'uppercase',letterSpacing:1,cursor:'pointer'}}>Skip Tour</button>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <div style={{display:'flex',gap:5}}>{TOUR.map((_,i)=><div key={i} style={{width:i===tourIdx?18:5,height:5,borderRadius:3,background:i<=tourIdx?'#F26751':'#243746',transition:'all 0.3s'}}/>)}</div>
                  <Btn small onClick={nextTour}>{tourIdx===TOUR.length-1?'Finish Tour →':'Next →'}</Btn>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Onboarding offer ── */}
      {phase==='onboard-offer' && (
        <div style={{position:'fixed',inset:0,background:'rgba(7,24,39,0.95)',backdropFilter:'blur(8px)',zIndex:800,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div style={{background:'#0D2236',border:'1px solid rgba(242,103,81,0.25)',borderRadius:18,padding:'44px 48px',maxWidth:540,width:'100%',textAlign:'center',animation:'fadeUp 0.4s ease both',boxShadow:'0 32px 80px rgba(0,0,0,0.7)'}}>
            <div style={{fontSize:36,marginBottom:20}}>✦</div>
            <h3 style={{fontFamily:DISPLAY,fontSize:22,fontWeight:700,color:'#F5F7FA',margin:'0 0 14px'}}>That's the full tour.</h3>
            <p style={{fontFamily:BODY,fontSize:14,color:'#94A3B8',lineHeight:1.85,margin:'0 0 32px'}}>Want me to help you set up your organization right now? I'll ask a few simple questions and fill in your Identity, People, and Rhythm layers for you — all in one conversation.</p>
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <Btn secondary small onClick={skipAll}>I'll Do It Myself</Btn>
              <Btn onClick={startOnboarding}>Let's Build It Together →</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Onboarding ── */}
      {phase==='onboard' && (
        <div style={{position:'fixed',inset:0,background:'rgba(7,24,39,0.97)',backdropFilter:'blur(12px)',zIndex:800,display:'flex',flexDirection:'column',fontFamily:DISPLAY}}>
          <div style={{padding:'16px 28px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(242,103,81,0.15)',border:'1px solid rgba(242,103,81,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>✦</div>
              <div>
                <p style={{fontFamily:DISPLAY,fontSize:14,fontWeight:700,color:'#F5F7FA',margin:0}}>Maven · Building {orgName||'Your Organization'}</p>
                <p style={{fontFamily:MONO,fontSize:9,color:obLoading?'#F26751':'#2EC4B6',margin:0,textTransform:'uppercase',letterSpacing:1.5}}>{obLoading?'Working...':`Step ${obStep+1} of ${OB_STEPS.length} — ${OB_STEPS[obStep]?.label}`}</p>
              </div>
            </div>
            <div style={{display:'flex',gap:5}}>{OB_STEPS.map((s,i)=><div key={s.key} style={{width:5,height:5,borderRadius:'50%',background:i<obStep?'#2EC4B6':i===obStep?'#F26751':'#243746',transition:'all 0.3s'}}/>)}</div>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'28px',display:'flex',flexDirection:'column',gap:14,maxWidth:680,margin:'0 auto',width:'100%'}}>
            {obMsgs.map((m,i)=>(
              <div key={i} style={{display:'flex',flexDirection:'column',alignItems:m.role==='maven'?'flex-start':'flex-end'}}>
                {m.role==='maven' && <MvnLabel/>}
                <div style={m.role==='maven'?mvn:usr}><p style={{fontSize:14,fontFamily:BODY,color:'#F5F7FA',margin:0,lineHeight:1.8,whiteSpace:'pre-wrap'}}>{m.text}</p></div>
              </div>
            ))}
            {obLoading && <div><MvnLabel/><div style={mvn}><Dots/></div></div>}
            <div ref={obBottomRef}/>
          </div>
          <div style={{padding:'16px 28px',borderTop:'1px solid rgba(255,255,255,0.06)',flexShrink:0,maxWidth:680,margin:'0 auto',width:'100%'}}>
            {obDraftShown && !obLoading && (OB_STEPS[obStep]?.key==='people'||OB_STEPS[obStep]?.key==='rhythm') ? (
              <button onClick={()=>{ setObLoading(true); advanceStep(); }} style={{display:'block',width:'100%',padding:'12px',background:'rgba(46,196,182,0.08)',border:'1px solid rgba(46,196,182,0.25)',borderRadius:8,color:'#2EC4B6',fontFamily:MONO,fontSize:10,textTransform:'uppercase',letterSpacing:1.5,cursor:'pointer'}}>✓ Continue →</button>
            ) : obDraftShown && !obLoading ? (
              <div style={{display:'flex',gap:10,marginBottom:10}}>
                <button onClick={()=>{ setObLoading(true); const msgs=[...obMsgs,{role:'user',text:'perfect'}]; setObMsgs(msgs); refineOrAdvance(msgs); }} style={{flex:1,padding:'10px',background:'rgba(46,196,182,0.08)',border:'1px solid rgba(46,196,182,0.25)',borderRadius:8,color:'#2EC4B6',fontFamily:MONO,fontSize:10,textTransform:'uppercase',letterSpacing:1.5,cursor:'pointer'}}>✓ That's Perfect — Move On</button>
              </div>
            ) : null}
            {!obLoading && (
              <div style={{display:'flex',gap:10}}>
                <textarea value={obInput} onChange={e=>setObInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendObMsg();}}} placeholder="Type your response… (Enter to send)" rows={3} style={{flex:1,padding:'12px 14px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#F5F7FA',fontFamily:BODY,fontSize:14,outline:'none',resize:'none'}}/>
                <button onClick={sendObMsg} disabled={!obInput.trim()} style={{padding:'12px 18px',background:obInput.trim()?'#F26751':'rgba(255,255,255,0.04)',border:'none',borderRadius:8,color:obInput.trim()?'#071827':'#94A3B8',fontFamily:DISPLAY,fontSize:12,fontWeight:700,cursor:obInput.trim()?'pointer':'default'}}>→</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {phase==='done' && (
        <div style={{position:'fixed',inset:0,background:'rgba(7,24,39,0.95)',backdropFilter:'blur(8px)',zIndex:800,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div style={{background:'#0D2236',border:'1px solid rgba(46,196,182,0.25)',borderRadius:18,padding:'44px 48px',maxWidth:500,width:'100%',textAlign:'center',animation:'fadeUp 0.4s ease both',boxShadow:'0 32px 80px rgba(0,0,0,0.7)'}}>
            <div style={{fontSize:44,marginBottom:20}}>🏠</div>
            <h3 style={{fontFamily:DISPLAY,fontSize:22,fontWeight:700,color:'#F5F7FA',margin:'0 0 14px'}}>You're home.</h3>
            <p style={{fontFamily:BODY,fontSize:14,color:'#94A3B8',lineHeight:1.85,margin:'0 0 24px'}}>Your organizational operating system is ready. I'll be right here whenever you need me.</p>
            <div style={{padding:'16px 20px',background:'rgba(242,103,81,0.08)',border:'1px solid rgba(242,103,81,0.2)',borderRadius:10,marginBottom:28,display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'#F26751',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>✦</div>
              <p style={{fontFamily:BODY,fontSize:13,color:'#F5F7FA',margin:0,textAlign:'left',lineHeight:1.65}}>Find me in the <strong>bottom-right corner</strong>. Click the ✦ button anytime to chat, get help, or run an analysis.</p>
            </div>
            <Btn onClick={()=>setPhase(null)}>Take Me to My Dashboard →</Btn>
          </div>
        </div>
      )}

      {/* ── Chat bubble + popover ── */}
      {phase===null && (
        <>
          <button onClick={()=>setChatOpen(o=>!o)} style={{position:'fixed',bottom:24,right:24,width:54,height:54,borderRadius:'50%',background:'#F26751',border:'2px solid rgba(255,255,255,0.15)',boxShadow:'0 4px 20px rgba(242,103,81,0.45)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,zIndex:600,transition:'transform 0.2s'}} onMouseEnter={e=>e.target.style.transform='scale(1.08)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}>✦</button>
          {chatOpen && (
            <div style={{position:'fixed',bottom:90,right:24,width:370,height:500,background:'#0B1E2E',border:'1px solid var(--border)',borderRadius:16,zIndex:601,display:'flex',flexDirection:'column',boxShadow:'-4px -4px 40px rgba(0,0,0,0.5)',animation:'fadeUp 0.2s ease both',overflow:'hidden'}}>
              <div style={{padding:'13px 16px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
                <div style={{display:'flex',alignItems:'center',gap:9}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(242,103,81,0.15)',border:'1px solid rgba(242,103,81,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>✦</div>
                  <div>
                    <p style={{fontFamily:DISPLAY,fontSize:13,fontWeight:700,color:'var(--text-primary)',margin:0}}>Maven</p>
                    <p style={{fontFamily:MONO,fontSize:8,color:chatLoading?'#F26751':'#2EC4B6',margin:0,textTransform:'uppercase',letterSpacing:1.5}}>{chatLoading?'Thinking...':'Your Perspexis Guide'}</p>
                  </div>
                </div>
                <button onClick={()=>setChatOpen(false)} style={{background:'none',border:'none',color:'var(--text-secondary)',cursor:'pointer',fontSize:18,lineHeight:1}}>×</button>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'14px',display:'flex',flexDirection:'column',gap:10}}>
                {chatMsgs.map((m,i)=>(
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:m.role==='maven'?'flex-start':'flex-end'}}>
                    {m.role==='maven' && <p style={{fontSize:8,fontFamily:MONO,color:'#F26751',textTransform:'uppercase',letterSpacing:1.5,margin:'0 0 4px'}}>✦ Maven</p>}
                    <div style={m.role==='maven'?{...mvn,maxWidth:'90%'}:{...usr,maxWidth:'90%'}}><p style={{fontSize:12,fontFamily:BODY,color:'var(--text-primary)',margin:0,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{m.text}</p></div>
                  </div>
                ))}
                {chatLoading && <div><p style={{fontSize:8,fontFamily:MONO,color:'#F26751',textTransform:'uppercase',letterSpacing:1.5,margin:'0 0 4px'}}>✦ Maven</p><div style={{...mvn,maxWidth:'90%'}}><Dots/></div></div>}
                <div ref={chatBottomRef}/>
              </div>
              <div style={{padding:'10px 12px',borderTop:'1px solid var(--border)',flexShrink:0}}>
                <div style={{display:'flex',gap:8}}>
                  <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder="Ask Maven anything…" style={{flex:1,padding:'9px 12px',background:'rgba(255,255,255,0.05)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text-primary)',fontFamily:BODY,fontSize:12,outline:'none'}}/>
                  <button onClick={sendChat} disabled={chatLoading||!chatInput.trim()} style={{padding:'9px 14px',background:chatInput.trim()&&!chatLoading?'#F26751':'rgba(255,255,255,0.04)',border:'none',borderRadius:8,color:chatInput.trim()&&!chatLoading?'#071827':'#94A3B8',fontFamily:DISPLAY,fontSize:10,fontWeight:700,cursor:chatInput.trim()&&!chatLoading?'pointer':'default'}}>→</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}



// ─── Stripe Pricing Tiers ───────────────────────────────────────────────────
// Setup: stripe.com → Products → create Core, Growth, Scale with trial periods
// → Payment Links → replace stripeMonthly / stripeAnnual URLs below
const TIERS = [
  {
    id: "core", name: "Core", icon: "◈",
    tagline: "Build your organizational foundation",
    monthly: 49, annual: 39, annualTotal: 468,
    available: true, popular: true,
    accent: "#F26751", accentDim: "rgba(242,103,81,0.08)", accentBorder: "rgba(242,103,81,0.28)",
    features: [
      "Identity Layer — Mission, Vision & Values",
      "People Layer — Roles & Accountability",
      "Rhythm Layer — Meeting Cadences",
      "AI Clarity Grading across all layers",
      "POHI Organizational Health Score",
      "Up to 5 team members",
    ],
    stripeMonthly: "#",  // TODO: replace with Stripe Payment Link
    stripeAnnual:  "#",  // TODO: replace with Stripe Payment Link
  },
  {
    id: "growth", name: "Growth", icon: "◎",
    tagline: "Scale your systems and processes",
    monthly: 99, annual: 79, annualTotal: 948,
    available: false, popular: false,
    accent: "#2EC4B6", accentDim: "rgba(46,196,182,0.08)", accentBorder: "rgba(46,196,182,0.25)",
    features: [
      "Everything in Core",
      "Numbers Layer — KPIs & Metrics",
      "Process Layer — SOPs & Workflows",
      "Scale Layer — Growth Planning",
      "Advanced AI Analysis",
      "Up to 25 team members",
    ],
    stripeMonthly: null, stripeAnnual: null,
  },
  {
    id: "scale", name: "Scale", icon: "◇",
    tagline: "Enterprise-grade organizational clarity",
    monthly: 199, annual: 159, annualTotal: 1908,
    available: false, popular: false,
    accent: "#A87EC8", accentDim: "rgba(168,126,200,0.08)", accentBorder: "rgba(168,126,200,0.25)",
    features: [
      "Everything in Growth",
      "Multi-location Management",
      "Custom Reporting & Exports",
      "White-label Options",
      "Priority Support & Onboarding",
      "Unlimited team members",
    ],
    stripeMonthly: null, stripeAnnual: null,
  },
];

function PricingPage({ standalone, user, onClose }) {
  const [annual, setAnnual] = useState(false);

  const handleCTA = (tier) => {
    if (!tier.available || !tier.stripeMonthly) return;
    const base = annual ? tier.stripeAnnual : tier.stripeMonthly;
    if (!base || base === "#") return;
    try {
      const url = new URL(base);
      if (user?.email) url.searchParams.set("prefilled_email", user.email);
      if (user?.id) url.searchParams.set("client_reference_id", user.id);
      window.open(url.toString(), "_blank");
    } catch { window.open(base, "_blank"); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#071827", color: "#F5F7FA", fontFamily: DISPLAY, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .px-tier-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .px-tier-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
        @media (max-width: 767px) {
          .px-pricing-grid { grid-template-columns: 1fr !important; }
          .px-pricing-hero h1 { font-size: 28px !important; }
          .px-pricing-nav { padding: 12px 16px !important; }
        }
      `}</style>

      {/* Nav */}
      <div className="px-pricing-nav" style={{ padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #243746", background: "rgba(16,37,52,0.7)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PerspexisIcon size={26} />
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: 1, color: "#F5F7FA" }}>perspexis</span>
        </div>
        {standalone
          ? <button onClick={() => window.location.href = "/"} style={{ padding: "7px 18px", background: "#F26751", border: "none", borderRadius: 5, color: "#071827", fontFamily: DISPLAY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer" }}>Sign In →</button>
          : <button onClick={onClose} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #243746", borderRadius: 5, color: "#94A3B8", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer" }}>← Back to App</button>
        }
      </div>

      {/* Hero */}
      <div className="px-pricing-hero" style={{ textAlign: "center", padding: "60px 24px 44px", animation: "fadeUp 0.4s ease both" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", background: "rgba(46,196,182,0.08)", border: "1px solid rgba(46,196,182,0.2)", borderRadius: 20, marginBottom: 24 }}>
          <span style={{ fontSize: 9, fontFamily: MONO, color: "#2EC4B6", textTransform: "uppercase", letterSpacing: 2 }}>7-Day Free Trial Included</span>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1, margin: "0 0 14px", lineHeight: 1.15, color: "#F5F7FA" }}>Simple, transparent pricing.</h1>
        <p style={{ fontSize: 15, color: "#94A3B8", margin: 0, fontFamily: BODY, lineHeight: 1.8 }}>
          Build organizational clarity at every stage of growth.<br />Start free. Upgrade when you're ready.
        </p>
      </div>

      {/* Billing toggle */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginBottom: 44 }}>
        <span style={{ fontSize: 11, fontFamily: MONO, color: annual ? "#94A3B8" : "#F5F7FA", textTransform: "uppercase", letterSpacing: 1, transition: "color 0.2s" }}>Monthly</span>
        <button onClick={() => setAnnual(a => !a)} style={{ width: 46, height: 24, borderRadius: 12, background: annual ? "#F26751" : "#243746", border: "none", cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 3, left: annual ? 25 : 3, width: 18, height: 18, borderRadius: "50%", background: "#F5F7FA", transition: "left 0.25s ease" }} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontFamily: MONO, color: annual ? "#F5F7FA" : "#94A3B8", textTransform: "uppercase", letterSpacing: 1, transition: "color 0.2s" }}>Annual</span>
          {annual && <span style={{ padding: "2px 8px", background: "rgba(242,103,81,0.12)", border: "1px solid rgba(242,103,81,0.3)", borderRadius: 10, fontSize: 9, fontFamily: MONO, color: "#F26751", textTransform: "uppercase", letterSpacing: 1 }}>Save 20%</span>}
        </div>
      </div>

      {/* Tier cards */}
      <div className="px-pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 980, margin: "0 auto 56px", padding: "0 24px" }}>
        {TIERS.map((tier, i) => (
          <div key={tier.id} className="px-tier-card" style={{ position: "relative", background: "#102534", border: `1px solid ${tier.popular ? tier.accentBorder : "#243746"}`, borderTop: `3px solid ${tier.accent}`, borderRadius: 12, padding: "32px 26px", animation: `fadeUp 0.4s ease ${i * 80}ms both` }}>
            {tier.popular && <div style={{ position: "absolute", top: 0, right: 20, transform: "translateY(-50%)", padding: "3px 10px", background: tier.accent, borderRadius: 10, fontSize: 8, fontFamily: MONO, color: "#071827", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>Most Popular</div>}
            {!tier.available && (
              <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "rgba(7,24,39,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                <span style={{ padding: "6px 18px", background: "#102534", border: "1px solid #243746", borderRadius: 20, fontSize: 9, fontFamily: MONO, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 2 }}>Coming Soon</span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 18, color: tier.accent }}>{tier.icon}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#F5F7FA" }}>{tier.name}</span>
            </div>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 22px", fontFamily: BODY, lineHeight: 1.5 }}>{tier.tagline}</p>

            <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 4 }}>
              <span style={{ fontSize: 38, fontWeight: 700, fontFamily: MONO, color: "#F5F7FA", lineHeight: 1 }}>${annual ? tier.annual : tier.monthly}</span>
              <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: MONO }}>/mo</span>
            </div>
            <p style={{ fontSize: 10, fontFamily: MONO, color: "#94A3B8", margin: "0 0 24px" }}>
              {annual
                ? <span>billed ${tier.annualTotal}/yr · <span style={{ color: "#F26751" }}>save ${tier.monthly * 12 - tier.annualTotal}/yr</span></span>
                : "billed monthly · cancel anytime"
              }
            </p>

            <button onClick={() => handleCTA(tier)} disabled={!tier.available} style={{ width: "100%", padding: "11px", marginBottom: 22, background: tier.available ? tier.accent : "transparent", border: tier.available ? "none" : "1px solid #243746", borderRadius: 6, color: tier.available ? "#071827" : "#94A3B8", fontFamily: DISPLAY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, cursor: tier.available ? "pointer" : "default" }}>
              {tier.available ? "Start 7-Day Free Trial →" : "Coming Soon"}
            </button>

            <div style={{ borderTop: "1px solid #243746", paddingTop: 18 }}>
              <p style={{ fontSize: 9, fontFamily: MONO, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 12px" }}>What's included</p>
              {tier.features.map((f, fi) => (
                <div key={fi} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 9 }}>
                  <span style={{ fontSize: 10, color: tier.accent, flexShrink: 0, marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 12, color: "#F5F7FA", fontFamily: BODY, lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "0 24px 60px" }}>
        <p style={{ fontSize: 12, color: "#94A3B8", fontFamily: BODY, margin: "0 0 6px" }}>All plans include a 7-day free trial. Cancel or change plans at any time.</p>
        <p style={{ fontSize: 12, color: "#94A3B8", fontFamily: BODY, margin: 0 }}>
          Questions? <a href="mailto:cody@perspexis.com" style={{ color: "#F26751", textDecoration: "none" }}>cody@perspexis.com</a>
        </p>
      </div>
    </div>
  );
}

function Spinner({ label, large, medium }) {
  // ── Large: full branded loader with rotating arc + icon + text ──────────
  if (large) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "48px 0" }}>
        <div style={{ position: "relative", width: 130, height: 130 }}>
          <div style={{ position: "absolute", inset: 0, animation: "arcSpin 1.6s linear infinite" }}>
            <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
              <circle cx="65" cy="65" r="56" stroke="#F26751" strokeWidth="7" strokeLinecap="round" strokeDasharray="88 264" strokeDashoffset="0" opacity="1" />
              <circle cx="65" cy="65" r="56" stroke="#2EC4B6" strokeWidth="7" strokeLinecap="round" strokeDasharray="55 297" strokeDashoffset="-110" opacity="0.75" />
              <circle cx="65" cy="65" r="56" stroke="#F5F7FA" strokeWidth="7" strokeLinecap="round" strokeDasharray="32 320" strokeDashoffset="-215" opacity="0.3" />
            </svg>
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PerspexisIcon size={48} />
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, fontFamily: DISPLAY, color: "#F5F7FA", margin: "0 0 6px", fontWeight: 600, letterSpacing: 0.3 }}>perspexis</p>
          <p style={{ fontSize: 13, fontFamily: BODY, color: "var(--text-secondary)", margin: 0, letterSpacing: 0.2 }}>{label || "Loading clarity..."}</p>
        </div>
      </div>
    );
  }

  // ── Medium: arc spinner + icon + label, centered ────────────────────────
  if (medium) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "20px 0" }}>
        <div style={{ position: "relative", width: 72, height: 72 }}>
          <div style={{ position: "absolute", inset: 0, animation: "arcSpin 1.4s linear infinite" }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="30" stroke="#F26751" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="48 140" strokeDashoffset="0" opacity="1" />
              <circle cx="36" cy="36" r="30" stroke="#2EC4B6" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="30 158" strokeDashoffset="-60" opacity="0.7" />
              <circle cx="36" cy="36" r="30" stroke="#F5F7FA" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="18 170" strokeDashoffset="-118" opacity="0.3" />
            </svg>
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PerspexisIcon size={26} />
          </div>
        </div>
        {label && <p style={{ fontSize: 11, fontFamily: BODY, color: "var(--text-secondary)", margin: 0, textAlign: "center" }}>{label}</p>}
      </div>
    );
  }

  // ── Small: inline minimal arc spinner ───────────────────────────────────
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 18, height: 18 }}>
        <div style={{ position: "absolute", inset: 0, animation: "arcSpin 1.2s linear infinite" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="#F26751" strokeWidth="2" strokeLinecap="round" strokeDasharray="14 30" />
            <circle cx="9" cy="9" r="7" stroke="#2EC4B6" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 36" strokeDashoffset="-16" opacity="0.6" />
          </svg>
        </div>
      </div>
      {label && <p style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: MONO, margin: 0, letterSpacing: 1 }}>{label}</p>}
    </div>
  );
}


// ─── Auth Screen ────────────────────────────────────────────────────────────
function PerspexisCore() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [active, setActive] = useState("identity");
  const [identity, setIdentity] = useState(DEFAULT_IDENTITY);
  const [identityMode, setIdentityMode] = useState("setup");
  const [people, setPeople] = useState(DEFAULT_PEOPLE);
  const [gaps, setGaps] = useState(DEFAULT_GAPS);
  const [rhythm, setRhythm] = useState(null);
  const [rhythmMode, setRhythmMode] = useState("setup");
  const [dataLoading, setDataLoading] = useState(false);
  const [peopleStarted, setPeopleStarted] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [orgOwnerId, setOrgOwnerId] = useState(null);
  const [userRole, setUserRole] = useState("owner");
  const [tutorialStep, setTutorialStep] = useState(null);

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load user data when authenticated ───────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setDataLoading(true);
      // Check if this user is a member of another organization
      const { data: memberRecord } = await supabase
        .from("organization_members")
        .select("org_owner_id, role")
        .eq("member_user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      const oid = memberRecord ? memberRecord.org_owner_id : user.id;
      const role = memberRecord ? memberRecord.role : "owner";
      setOrgOwnerId(oid);
      setUserRole(role);
      const [profileRes, identityRes, peopleRes, rhythmRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", oid).single(),
        supabase.from("identity").select("*").eq("user_id", oid).single(),
        supabase.from("people").select("*").eq("user_id", oid).single(),
        supabase.from("rhythm").select("*").eq("user_id", oid).single(),
      ]);
      if (profileRes.data?.org_name) { setOrgName(profileRes.data.org_name); setOrgType(profileRes.data.org_type || ""); setOnboarded(true); }
      if (identityRes.data) { setIdentity({ mission: identityRes.data.mission, vision_north: identityRes.data.vision_north, vision_phase: identityRes.data.vision_phase, values: identityRes.data.values, positioning: identityRes.data.positioning }); setIdentityMode("view"); }
      if (peopleRes.data?.roles) { setPeople(peopleRes.data.roles); setGaps(peopleRes.data.gaps || ""); }
      if (rhythmRes.data) { setRhythm({ current: rhythmRes.data.current_state, cadences: rhythmRes.data.cadences, breaks: rhythmRes.data.breaks }); setRhythmMode("view"); }
      setDataLoading(false);
    };
    loadData();
  }, [user]);

  // ── Activity logger ──────────────────────────────────────────────────────
  const logActivity = async (action, layer, detail = "") => {
    if (!user) return;
    await supabase.from("activity_logs").insert({ user_id: user.id, user_email: user.email, org_id: orgOwnerId || user.id, action, layer, detail }).then(() => {});
  };

  // ── Save functions ───────────────────────────────────────────────────────
  const saveIdentity = async (d) => {
    setIdentity(d); setIdentityMode("view");
    await supabase.from("identity").upsert({ user_id: orgOwnerId || user.id, ...d, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    await logActivity("Identity layer saved", "identity");
  };

  const saveOnboarding = async (name, type) => {
    setOrgName(name); setOrgType(type || ""); setOnboarded(true); setIdentityMode("setup");
    await supabase.from("profiles").upsert({ id: user.id, org_name: name, org_type: type }, { onConflict: "id" });
    await logActivity("Onboarding completed", "onboarding", `${name} (${type})`);
    // Maven determines new-user state from maven_conversations table
  };

  const savePeople = async (newPeople, newGaps) => {
    setPeople(newPeople);
    if (newGaps !== undefined) setGaps(newGaps);
    await supabase.from("people").upsert({ user_id: orgOwnerId || user.id, roles: newPeople, gaps: newGaps !== undefined ? newGaps : gaps, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    await logActivity("People layer updated", "people");
  };

  const saveRhythm = async (d) => {
    setRhythm(d);
    await supabase.from("rhythm").upsert({ user_id: orgOwnerId || user.id, current_state: d.current, cadences: d.cadences, breaks: d.breaks, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    await logActivity("Rhythm layer saved", "rhythm");
  };

  const updateRole = (oldRole, updatedRoleObj) => {
    const updated = people.map(r => r.role === oldRole ? { ...updatedRoleObj } : r);
    savePeople(updated, gaps);
  };

  const addRole = (newRole) => {
    const updated = [...people, newRole];
    savePeople(updated, gaps);
  };

  const removeRole = (roleName) => {
    const updated = people.filter(r => r.role !== roleName);
    savePeople(updated, gaps);
  };

  const updateGaps = (newGaps) => {
    setGaps(newGaps);
    if (newGaps !== "diagnosing") savePeople(people, newGaps);
  };

  const completeTutorial = () => { setTutorialStep(null); };
  const advanceTutorial = () => {
    const next = tutorialStep + 1;
    if (next >= TUTORIAL_STEPS.length) { completeTutorial(); return; }
    if (TUTORIAL_STEPS[next].layer) setActive(TUTORIAL_STEPS[next].layer);
    setTutorialStep(next);
  };

  const updateRhythm = (updated) => { saveRhythm(updated); };
  const done = { health: !!identity, identity: !!identity, people: people.length > 0, rhythm: !!rhythm };
  const completedLayers = [!!identity, people.length > 0, !!rhythm].filter(Boolean).length;
  const pct = Math.round((completedLayers / 3) * 100);

  // ── Auth and loading gates ───────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#071827", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner large label="Loading clarity..." />
    </div>
  );

  if (!user) return <AuthScreen onAuth={setUser} />;

  // Invited user: must agree to terms and set a password before entering
  if (user.user_metadata?.needs_onboarding) {
    return <InviteAcceptPage user={user} onAccepted={async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
    }} />;
  }

  // ── Beta whitelist check ─────────────────────────────────────────────────
  const BETA_EMAILS = [
    // Cody
    "clkillian89@gmail.com",
    "info@kingdomhousechurch.org",
    // Levi
    "levikillian@appalachianland.com",
    // Mike / Michael Canipe
    "dmcanipe@gmail.com",
    "mike@advisiodigitalpartners.com",
    "mike@advisiopartners.com",
    "advisiodigitalpartners@gmail.com",
  ];

  const userEmail = user.email?.toLowerCase().trim();
  const isBetaUser = BETA_EMAILS.map(e => e.toLowerCase()).includes(userEmail);

  if (!isBetaUser) return (
    <div style={{ minHeight: "100vh", background: "#071827", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; }`}</style>
      <div style={{ textAlign: "center", maxWidth: 480, padding: "0 24px" }}>
        <div style={{ marginBottom: 16 }}><PerspexisLogo height={120} /></div>
        <div style={{ background: "#102534", border: "1px solid #243746", borderRadius: 12, padding: "36px 40px", marginTop: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(242,103,81,0.1)", border: "1px solid rgba(242,103,81,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 20px" }}>◈</div>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, color: "#F5F7FA", margin: "0 0 10px" }}>Perspexis is in Private Beta</h2>
          <p style={{ fontFamily: BODY, fontSize: 14, color: "#94A3B8", margin: "0 0 24px", lineHeight: 1.65 }}>
            Access is currently invite-only. If you'd like to join the waitlist or learn more about Perspexis, reach out directly.
          </p>
          <a href="mailto:cody@perspexis.com?subject=Perspexis Beta Access Request" style={{ display: "block", padding: "12px", background: "#F26751", borderRadius: 6, color: "#071827", fontFamily: DISPLAY, fontSize: 13, fontWeight: 700, textDecoration: "none", marginBottom: 12 }}>Request Access →</a>
          <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: "none", color: "#94A3B8", fontFamily: BODY, fontSize: 13, cursor: "pointer" }}>Sign out</button>
        </div>
        <p style={{ fontFamily: MONO, fontSize: 9, color: "#243746", textTransform: "uppercase", letterSpacing: 2, marginTop: 20 }}>Built for Leadership. Designed for Clarity.</p>
      </div>
    </div>
  );

  if (dataLoading) return (
    <div style={{ minHeight: "100vh", background: "#071827", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner large label="Loading your organization..." />
    </div>
  );

  if (!onboarded) return (
    <OnboardingScreen onStart={(name, type) => saveOnboarding(name, type)} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)", fontFamily: DISPLAY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:ital,wght@0,400;0,500;0,600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        :root {
          --bg: #071827;
          --surface: #102534;
          --deep-graphite: #0B1220;
          --off-white: #EDEFF2;
          --accent: #F26751;
          --accent-dim: rgba(242,103,81,0.1);
          --accent-border: rgba(242,103,81,0.3);
          --deep-coral: #CC5A4A;
          --deep-coral-dim: rgba(204,90,74,0.1);
          --deep-coral-border: rgba(204,90,74,0.3);
          --aqua: #6EE7D8;
          --teal: #2EC4B6;
          --teal-dim: rgba(46,196,182,0.1);
          --teal-border: rgba(46,196,182,0.25);
          --border: #243746;
          --border-strong: rgba(36,55,70,0.9);
          --danger: #CC5A4A;
          --danger-dim: rgba(204,90,74,0.08);
          --danger-border: rgba(204,90,74,0.25);
          --text-primary: #F5F7FA;
          --text-secondary: #94A3B8;
          --text-muted: rgba(148,163,184,0.5);
          --taupe: #94A3B8;
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #243746; border-radius: 1px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes arcSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes arcFade { 0% { opacity: 1; } 50% { opacity: 0.15; } 100% { opacity: 1; } }
        button { transition: opacity 0.15s ease; }
        button:hover:not(:disabled) { opacity: 0.82; }
        input, textarea { background: rgba(255,255,255,0.05) !important; color: #F5F7FA !important; border-color: #243746 !important; }
        input::placeholder, textarea::placeholder { color: #94A3B8 !important; }
        input:focus, textarea:focus { border-color: #F26751 !important; outline: none; }
        /* ─── Responsive ────────────────────────────────────── */
        .px-bottom-nav       { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface); border-top: 1px solid var(--border); z-index: 100; }
        .px-maven-panel { width: 400px; }
        @media (max-width: 767px) {
          .px-sidebar        { display: none !important; }
          .px-maven-panel    { width: 100% !important; }
          .px-bottom-nav     { display: flex !important; }
          .px-content        { padding: 16px 16px 80px !important; }
          .px-topnav         { padding: 8px 14px !important; }
          .px-hide-mobile    { display: none !important; }
          .px-grid-2         { grid-template-columns: 1fr !important; }
          .px-grid-3         { grid-template-columns: 1fr !important; }
          .px-cadence-grid   { grid-template-columns: 1fr 1fr !important; }
          .px-grade-banner   { flex-direction: column !important; align-items: stretch !important; }
          .px-grade-banner > div:last-child { align-items: flex-start !important; }
          .px-role-card-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ borderBottom: "1px solid var(--border)", padding: "10px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)" }} className="px-topnav">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PerspexisLogo height={80} />
          </div>
          <div style={{ width: 1, height: 16, background: "var(--border-strong)" }} />
          <span style={{ fontSize: 13, fontFamily: MONO, color: "var(--text-primary)", letterSpacing: 0.3 }}>{orgName || "Kingdom House"}</span>
          {userRole !== "owner" && <span style={{ padding: "2px 8px", borderRadius: 3, background: "rgba(110,231,216,0.1)", border: "1px solid rgba(110,231,216,0.2)", color: "#6EE7D8", fontSize: 9, fontFamily: MONO, textTransform: "uppercase", letterSpacing: 1.5 }}>{userRole}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 8, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 3px", opacity: 0.6 }} className="px-hide-mobile">Core Progress</p>
            <p style={{ fontSize: 11, fontFamily: MONO, color: "var(--accent)", margin: 0, fontWeight: 500 }}>{pct}% Complete</p>
          </div>
          <div className="px-hide-mobile" style={{ width: 80 }}><Bar v={pct} /></div>
          <span style={{ padding: "3px 10px", borderRadius: 3, background: "var(--accent-dim)", border: "1px solid var(--border)", color: "var(--accent)", fontSize: 9, fontFamily: MONO, textTransform: "uppercase", letterSpacing: 1.5 }} className="px-hide-mobile">Core</span>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: "5px 12px", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-secondary)", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
        <div style={{ width: 194, borderRight: "1px solid var(--border)", padding: "18px 10px", flexShrink: 0, position: "relative", background: "rgba(16,37,52,0.6)" }} className="px-sidebar">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <PerspexisIcon size={38} />
          </div>
          <p style={{ fontSize: 8, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 3, margin: "0 0 14px 10px" }}>Core Layers</p>
          {LAYERS.map((l, li) => (
            <button key={l.id} onClick={() => setActive(l.id)} onClick={() => { setActive(l.id); setShowSettings(false); setShowPricing(false); }} style={{ width: "100%", padding: "10px 12px", borderRadius: 5, border: "none", background: !showSettings && active === l.id ? "var(--accent-dim)" : "transparent", borderLeft: !showSettings && active === l.id ? "2px solid var(--accent)" : "2px solid transparent", color: !showSettings && active === l.id ? "var(--accent)" : "var(--taupe)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left", marginBottom: 2, animation: `fadeUp 0.3s ease ${li * 50}ms both` }}>
              <span style={{ fontSize: 13, opacity: active === l.id ? 1 : 0.6 }}>{l.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontFamily: DISPLAY, display: "flex", justifyContent: "space-between", letterSpacing: 0.3, fontWeight: active === l.id ? 600 : 400 }}>
                  {l.label}
                  {l.id === "health" && <span style={{ fontSize: 8, color: "var(--accent)", fontFamily: MONO, letterSpacing: 1 }}>POHI</span>}
                  {l.id !== "health" && done[l.id] && <span style={{ fontSize: 9, color: "var(--accent)" }}>✓</span>}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-primary)", marginTop: 3, fontFamily: MONO, letterSpacing: 0.3 }}>{l.desc}</div>
              </div>
            </button>
          ))}
          {userRole === "owner" && (
            <button onClick={() => { setShowSettings(s => !s); setShowPricing(false); }} style={{ width: "100%", padding: "10px 12px", borderRadius: 5, border: "none", background: showSettings ? "rgba(110,231,216,0.1)" : "transparent", borderLeft: showSettings ? "2px solid #6EE7D8" : "2px solid transparent", color: showSettings ? "#6EE7D8" : "var(--taupe)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left", marginBottom: 2 }}>
              <span style={{ fontSize: 13, opacity: showSettings ? 1 : 0.6 }}>⚙</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontFamily: DISPLAY, letterSpacing: 0.3, fontWeight: showSettings ? 600 : 400 }}>Settings</div>
                <div style={{ fontSize: 9, color: "var(--text-primary)", marginTop: 2, fontFamily: MONO, letterSpacing: 0.3, opacity: 0.7 }}>Users, logs & security</div>
              </div>
            </button>
          )}

          <div style={{ position: "absolute", bottom: 16, left: 10, right: 10, padding: "13px 12px", background: "rgba(46,196,182,0.03)", border: "1px solid rgba(46,196,182,0.1)", borderRadius: 8 }}>
            <p style={{ fontSize: 8, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 5px" }}>Next Tier</p>
            <p style={{ fontSize: 10, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.5, fontFamily: DISPLAY }}>Numbers, Process & Growth</p>
            <div onClick={() => setShowPricing(true)} style={{ padding: "7px", background: "var(--accent-dim)", border: "1px solid rgba(228,131,34,0.15)", borderRadius: 3, textAlign: "center", cursor: "pointer" }}>
              <span style={{ fontSize: 8, fontFamily: MONO, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5 }}>Upgrade to Growth →</span>
            </div>
          </div>
        </div>

        <div className="px-content" style={{ flex: 1, overflow: "auto", padding: "30px 34px" }}>
          {showSettings ? (
            <SettingsPage user={user} orgOwnerId={orgOwnerId || user.id} orgName={orgName} onClose={() => setShowSettings(false)} />
          ) : LAYERS.map(l => active === l.id && (
            <div key={l.id}>
              <div style={{ marginBottom: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                  <span style={{ fontSize: 20, color: l.id === "health" ? "var(--accent)" : "var(--accent)" }}>{l.icon}</span>
                  <h1 style={{ fontSize: 22, fontFamily: DISPLAY, fontWeight: 700, margin: 0, letterSpacing: -0.3, color: "var(--text-primary)" }}>{l.id === "health" ? "Organizational Health" : `${l.label} Layer`}</h1>
                  {l.id === "health" && <Tag color="var(--accent)">POHI</Tag>}
                  {l.id !== "health" && done[l.id] && <span style={{ padding: "2px 9px", borderRadius: 3, background: "var(--accent-dim)", border: "1px solid rgba(228,131,34,0.2)", color: "var(--accent)", fontSize: 9, fontFamily: MONO, textTransform: "uppercase", letterSpacing: 1.5 }}>Live</span>}
                </div>
                <p style={{ color: "var(--text-primary)", fontSize: 13, margin: 0, fontFamily: DISPLAY, opacity: 0.7 }}>{l.id === "health" ? "Perspexis Organizational Health Index — a proprietary 6-dimension assessment" : l.desc}</p>
              </div>

              {l.id === "health" && <HealthOverview identity={identity} people={people} gaps={gaps} rhythm={rhythm} orgName={orgName} orgType={orgType} />}
              {l.id === "identity" && (
                identityMode === "edit" || identityMode === "setup"
                  ? <IdentityEdit data={identity || {mission:"",vision_north:"",vision_phase:"",values:[{name:"",desc:""},{name:"",desc:""},{name:"",desc:""},{name:"",desc:""}],positioning:""}} onSave={saveIdentity} onCancel={() => identity && setIdentityMode("view")} isSetup={!identity} orgName={orgName} orgType={orgType} onMavenApply={d => { setIdentity(prev => ({ ...prev || {mission:"",vision_north:"",vision_phase:"",values:[],positioning:""}, ...d })); }} />
                  : <IdentityView data={identity} onEdit={() => setIdentityMode("edit")} />
              )}
              {l.id === "people" && (
                people.length === 0 && !peopleStarted
                  ? <EmptyPeopleState onAdd={() => setPeopleStarted(true)} />
                  : <PeopleView people={people} gaps={gaps} orgName={orgName} orgType={orgType} identity={identity} onUpdateRole={updateRole} onUpdateGaps={updateGaps} onAddRole={addRole} onRemoveRole={removeRole} />
              )}
              {l.id === "rhythm" && (rhythm && rhythmMode === "view"
                ? <RhythmView data={rhythm} orgName={orgName} orgType={orgType} onUpdate={updateRhythm} />
                : <RhythmSetup onDone={d => { saveRhythm(d); }} />
              )}
            </div>
          ))}
        </div>
      </div>
{showPricing && <PricingPage user={user} onClose={() => setShowPricing(false)} />}
      {/* Maven widget — always available */}
      <MavenExperience user={user} orgName={orgName} orgType={orgType} identity={identity} people={people} gaps={gaps} rhythm={rhythm} active={active} setActive={setActive} saveIdentity={saveIdentity} addRole={addRole} saveRhythm={saveRhythm} setRhythmMode={setRhythmMode} completeTutorial={completeTutorial} />
      {/* Mobile bottom nav */}
      <div className="px-bottom-nav" style={{ display: "none" }}>
        {LAYERS.map(l => (
          <button key={l.id} onClick={() => setActive(l.id)} style={{ flex: 1, padding: "8px 4px", background: "none", border: "none", color: active === l.id ? "var(--accent)" : "var(--taupe)", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>{l.icon}</span>
            <span style={{ fontSize: 8, fontFamily: MONO, textTransform: "uppercase", letterSpacing: 1 }}>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaMethod, setMfaMethod] = useState("email");

  const inp = { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid #243746", borderRadius: 6, color: "#F5F7FA", fontFamily: BODY, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 };

  const handleMFAVerify = async () => {
    setLoading(true); setError("");
    if (mfaMethod === "email") {
      const { data: vData, error: vErr } = await supabase.auth.verifyOtp({ email, token: mfaCode.replace(/\s/g, ""), type: "email" });
      if (vErr) { setError("Invalid code. Check your email and try again."); setLoading(false); return; }
      onAuth(vData.user);
    } else {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (cErr) { setError(cErr.message); setLoading(false); return; }
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.id, code: mfaCode.replace(/\s/g, "") });
      if (vErr) { setError("Invalid code. Try again."); setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      onAuth(user);
    }
  };

  const handleSubmit = async () => {
    setLoading(true); setError(""); setMessage("");
    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      const meta = data.user?.user_metadata || {};
      if (meta.two_fa_enabled && meta.two_fa_method === "email") {
        await supabase.auth.signOut();
        await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
        setMfaMethod("email"); setMfaRequired(true); setLoading(false); return;
      }
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.nextLevel === "aal2" && aalData?.currentLevel === "aal1") {
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const totpFactor = factorsData?.totp?.[0];
        if (totpFactor) { setMfaFactorId(totpFactor.id); setMfaMethod("totp"); setMfaRequired(true); setLoading(false); return; }
      }
      onAuth(data.user);
    } else if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account, then log in.");
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if (error) setError(error.message);
      else setMessage("Password reset email sent. Check your inbox.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#071827", display: "flex", fontFamily: DISPLAY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes arcSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #94A3B8 !important; }
        @media (max-width: 767px) {
          .px-auth-left      { display: none !important; }
          .px-auth-right     { width: 100% !important; padding: 40px 24px !important; }
          .px-show-mobile    { display: flex !important; }
        }
      `}</style>

      {/* Left panel — branding */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 48px", borderRight: "1px solid #243746", position: "relative" }} className="px-auth-left">
        <div style={{ animation: "fadeUp 0.5s ease both", width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* Massive centered wordmark */}
          <PerspexisLogo />
          <div style={{ height: 8 }} />
          <p style={{ fontFamily: MONO, fontSize: 9, color: "#F26751", textTransform: "uppercase", letterSpacing: 2.5, margin: "0 0 36px", textAlign: "center" }}>Clarity. Alignment. Momentum.</p>

          {/* Tier cards — full width */}
          <div style={{ width: "100%" }}>
            <p style={{ fontFamily: MONO, fontSize: 9, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 2.5, margin: "0 0 10px" }}>Current Available Product</p>
            <div style={{ background: "#102534", border: "1px solid rgba(242,103,81,0.3)", borderRadius: 10, padding: "20px 24px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: "#F5F7FA", margin: "0 0 3px" }}>Core</p>
                  <p style={{ fontFamily: BODY, fontSize: 12, color: "#94A3B8", margin: 0 }}>Identity · People · Rhythm</p>
                </div>
                <span style={{ padding: "4px 12px", background: "rgba(242,103,81,0.12)", border: "1px solid rgba(242,103,81,0.3)", borderRadius: 20, fontFamily: MONO, fontSize: 9, color: "#F26751", textTransform: "uppercase", letterSpacing: 1.5 }}>Active</span>
              </div>
            </div>

            <p style={{ fontFamily: MONO, fontSize: 9, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 2.5, margin: "0 0 10px" }}>Coming Next</p>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #243746", borderRadius: 10, padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: "rgba(245,247,250,0.4)", margin: "0 0 3px" }}>Growth</p>
                  <p style={{ fontFamily: BODY, fontSize: 12, color: "#94A3B8", margin: 0 }}>Numbers · Process · Scale</p>
                </div>
                <span style={{ padding: "4px 12px", background: "rgba(46,196,182,0.08)", border: "1px solid rgba(46,196,182,0.2)", borderRadius: 20, fontFamily: MONO, fontSize: 9, color: "#2EC4B6", textTransform: "uppercase", letterSpacing: 1.5 }}>Q3 2026</span>
              </div>
            </div>
          </div>

        </div>
        <p style={{ position: "absolute", bottom: 24, fontFamily: MONO, fontSize: 8, color: "#243746", textTransform: "uppercase", letterSpacing: 2 }}>Built for Leadership. Designed for Clarity.</p>
      </div>

      {/* Right panel — auth form */}
      <div className="px-auth-right" style={{ width: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 48px", animation: "fadeUp 0.4s ease 0.1s both" }}>
        <div style={{ width: "100%" }}>
          {mfaRequired ? (
            <div style={{ animation: "fadeUp 0.3s ease both" }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, color: "#F5F7FA", margin: "0 0 8px" }}>Verify Your Identity</h2>
                <p style={{ fontFamily: BODY, fontSize: 13, color: "#94A3B8", margin: 0 }}>{mfaMethod === "email" ? `A 6-digit code was sent to ${email}` : "Enter the 6-digit code from your authenticator app."}</p>
              </div>
              <input value={mfaCode} onChange={e => setMfaCode(e.target.value)} onKeyDown={e => e.key === "Enter" && handleMFAVerify()} placeholder="000 000" maxLength={7} style={{ width: "100%", padding: "16px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid #243746", borderRadius: 6, color: "#F5F7FA", fontFamily: MONO, fontSize: 24, outline: "none", boxSizing: "border-box", marginBottom: 12, letterSpacing: 8, textAlign: "center" }} />
              {error && <p style={{ fontSize: 12, color: "#F26751", fontFamily: BODY, margin: "0 0 12px" }}>{error}</p>}
              <button onClick={handleMFAVerify} disabled={loading || mfaCode.replace(/\s/g,"").length < 6} style={{ width: "100%", padding: "13px", background: "#F26751", border: "none", borderRadius: 6, color: "#071827", fontFamily: DISPLAY, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 14 }}>
                {loading ? "Verifying..." : "Verify →"}
              </button>
              <button onClick={() => { setMfaRequired(false); setMfaCode(""); setError(""); }} style={{ background: "none", border: "none", color: "#94A3B8", fontFamily: BODY, fontSize: 13, cursor: "pointer", width: "100%", textAlign: "center" }}>← Back to sign in</button>
            </div>
          ) : (<>
          <div className="px-show-mobile" style={{ display: "none", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
            <PerspexisLogo height={120} />
            <p style={{ fontFamily: MONO, fontSize: 9, color: "#F26751", textTransform: "uppercase", letterSpacing: 2.5, margin: "8px 0 0", textAlign: "center" }}>Clarity. Alignment. Momentum.</p>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, color: "#F5F7FA", margin: "0 0 6px" }}>
            {mode === "login" ? "Welcome back." : mode === "signup" ? "Create your account." : "Reset your password."}
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 13, color: "#94A3B8", margin: "0 0 28px" }}>
            {mode === "login" ? "Sign in to your Perspexis OS." : mode === "signup" ? "Get started with Perspexis." : "We'll send you a reset link."}
          </p>

          <button onClick={async () => { await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } }); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid #243746", borderRadius: 6, color: "#F5F7FA", fontFamily: DISPLAY, fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 20 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/></svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "#243746" }} />
            <span style={{ fontFamily: MONO, fontSize: 9, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.5 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#243746" }} />
          </div>

          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid #243746", borderRadius: 6, color: "#F5F7FA", fontFamily: BODY, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
          {mode !== "reset" && <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid #243746", borderRadius: 6, color: "#F5F7FA", fontFamily: BODY, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 }} onKeyDown={e => e.key === "Enter" && handleSubmit()} />}

          {error && <p style={{ fontSize: 12, color: "#F26751", fontFamily: BODY, margin: "0 0 12px" }}>{error}</p>}
          {message && <p style={{ fontSize: 12, color: "#2EC4B6", fontFamily: BODY, margin: "0 0 12px" }}>{message}</p>}

          <button onClick={handleSubmit} disabled={loading || !email} style={{ width: "100%", padding: "13px", background: email ? "#F26751" : "rgba(255,255,255,0.04)", border: "none", borderRadius: 6, color: email ? "#071827" : "#94A3B8", fontFamily: DISPLAY, fontSize: 13, fontWeight: 700, cursor: email ? "pointer" : "not-allowed", marginBottom: 18 }}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : mode === "signup" ? "Create Account →" : "Send Reset Email →"}
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            {mode === "login" && (<><button onClick={() => setMode("signup")} style={{ background: "none", border: "none", color: "#F26751", fontFamily: BODY, fontSize: 13, cursor: "pointer" }}>Don't have an account? Sign up</button><button onClick={() => setMode("reset")} style={{ background: "none", border: "none", color: "#94A3B8", fontFamily: BODY, fontSize: 12, cursor: "pointer" }}>Forgot password?</button></>)}
            {mode !== "login" && <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "#F26751", fontFamily: BODY, fontSize: 13, cursor: "pointer" }}>Back to sign in</button>}
          </div>
          <div style={{ textAlign: "center", marginTop: 24, paddingTop: 18, borderTop: "1px solid #243746" }}>
            <a href="/pricing" style={{ fontSize: 10, fontFamily: MONO, color: "#94A3B8", textDecoration: "none", textTransform: "uppercase", letterSpacing: 1.5 }}>View Pricing & Plans →</a>
          </div>
          </>)}
        </div>
      </div>
    </div>
  );
}

// ─── Perspexis Wordmark ────────────────────────────────────────────────────
function PerspexisLogo({ height = 200 }) {
  return (
    <svg
      height={height}
      viewBox="0 0 1200 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Perspexis logo"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="logo-coral" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF7C69" />
          <stop offset="100%" stopColor="#F26751" />
        </linearGradient>
        <linearGradient id="logo-teal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4CC2D3" />
          <stop offset="100%" stopColor="#2296A8" />
        </linearGradient>
        <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000000" floodOpacity="0.22" />
        </filter>
      </defs>
      <g filter="url(#logo-shadow)">
        <path d="M600 95L675 145C684 151 684 164 675 170L600 220L525 170C516 164 516 151 525 145L600 95Z" fill="url(#logo-coral)" />
      </g>
      <g filter="url(#logo-shadow)">
        <path d="M460 235C472 225 490 224 503 233L600 294L697 233C710 224 728 225 740 235L760 251C770 259 770 275 760 283L620 372C607 381 593 381 580 372L440 283C430 275 430 259 440 251L460 235Z" fill="url(#logo-teal)" />
      </g>
      <g filter="url(#logo-shadow)">
        <path d="M460 345C472 335 490 334 503 343L600 404L697 343C710 334 728 335 740 345L760 361C770 369 770 385 760 393L620 482C607 491 593 491 580 482L440 393C430 385 430 369 440 361L460 345Z" fill="#F5F5F3" stroke="#DADADA" strokeWidth="4" />
      </g>
      <text
        x="600"
        y="610"
        textAnchor="middle"
        fontFamily="Orbitron, Audiowide, Rajdhani, sans-serif"
        fontSize="120"
        fontWeight="600"
        letterSpacing="-7"
        fill="#EFEFEF"
        stroke="#CFCFCF"
        strokeWidth="2"
        paintOrder="stroke fill"
      >
        perspexis
      </text>
    </svg>
  );
}

function PerspexisIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="420 80 360 430" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M600 95L675 145C684 151 684 164 675 170L600 220L525 170C516 164 516 151 525 145L600 95Z" fill="#F26751" />
      <path d="M460 235C472 225 490 224 503 233L600 294L697 233C710 224 728 225 740 235L760 251C770 259 770 275 760 283L620 372C607 381 593 381 580 372L440 283C430 275 430 259 440 251L460 235Z" fill="#2EC4B6" />
      <path d="M460 345C472 335 490 334 503 343L600 404L697 343C710 334 728 335 740 345L760 361C770 369 770 385 760 393L620 482C607 491 593 491 580 482L440 393C430 385 430 369 440 361L460 345Z" fill="#F5F5F3" stroke="#DADADA" strokeWidth="4" />
    </svg>
  );
}
export default function App() {
  if (window.location.pathname === "/pricing") return <PricingPage standalone />;
  return <PerspexisCore />;
}

// ─── Onboarding Welcome Screen ─────────────────────────────────────────────
function OnboardingScreen({ onStart }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const orgTypes = ["Business", "Church / Ministry", "Nonprofit", "Agency", "Other"];

  return (
    <div style={{ minHeight: "100vh", background: "#071827", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:ital,wght@0,400;0,500;0,600&family=DM+Mono:wght@400;500&family=Nunito:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes arcSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .type-btn:hover { border-color: #F26751 !important; color: #F26751 !important; }
      `}</style>

      <div style={{ maxWidth: 520, width: "90%", animation: "fadeUp 0.5s ease both" }}>

                {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 48 }}>
          <PerspexisLogo />
          <p style={{ fontSize: 10, fontFamily: MONO, color: "#F26751", textTransform: "uppercase", letterSpacing: 2.5, margin: 0 }}>Clarity. Alignment. Momentum.</p>
        </div>

        {/* Welcome card */}
        <div style={{ background: "#0D2236", border: "1px solid rgba(242,103,81,0.18)", borderRadius: 14, padding: 36, boxShadow: "0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(242,103,81,0.06)" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F5F7FA", margin: "0 0 8px", letterSpacing: -0.3 }}>
            Welcome to <span style={{ color: "#F26751" }}>Perspexis</span>
          </h1>
          <p style={{ fontSize: 14, fontFamily: BODY, color: "#94A3B8", margin: "0 0 28px", lineHeight: 1.65 }}>
            Let's build your operating system. Start by telling us about your organization.
          </p>

          {/* Org name */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 9, fontFamily: MONO, color: "#F26751", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 8px" }}>Organization Name</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. BuildRight Contracting"
              style={{
                width: "100%", padding: "12px 14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6, color: "#F5F7FA",
                fontFamily: DISPLAY, fontSize: 14, outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Org type */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 9, fontFamily: MONO, color: "#F26751", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 10px" }}>Organization Type</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {orgTypes.map(t => (
                <button key={t} className="type-btn" onClick={() => setType(t)} style={{
                  padding: "7px 14px", borderRadius: 6,
                  background: type === t ? "rgba(242,103,81,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${type === t ? "#F26751" : "rgba(255,255,255,0.1)"}`,
                  color: type === t ? "#F26751" : "#94A3B8",
                  fontFamily: DISPLAY, fontSize: 12, cursor: "pointer",
                  transition: "all 0.15s ease"
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => name.trim() && type && onStart(name.trim(), type)}
            disabled={!name.trim() || !type}
            style={{
              width: "100%", padding: "14px",
              background: name.trim() && type ? "#F26751" : "rgba(255,255,255,0.04)",
              border: name.trim() && type ? "none" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: name.trim() && type ? "#071827" : "#4A6A7A",
              fontFamily: DISPLAY, fontSize: 13, fontWeight: 700,
              cursor: name.trim() && type ? "pointer" : "not-allowed",
              letterSpacing: 0.5, transition: "all 0.2s ease"
            }}>
            Build My Operating System →
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, fontFamily: MONO, color: "#94A3B8", marginTop: 20, opacity: 0.6 }}>
          Built for Leadership. Designed for Clarity.
        </p>
      </div>
    </div>
  );
}
