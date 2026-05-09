import { useState, useEffect } from "react";
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
        <p style={{ fontSize: 16, lineHeight: 1.9, color: "var(--text-primary)", margin: 0, fontFamily: DISPLAY }}>{data.mission}</p>
      </Card></Animated>
      <Animated delay={60}><Card>
        <Label>Guiding Statement — The Discipleship Pipeline</Label>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-primary)", margin: "0 0 14px", fontFamily: DISPLAY }}>{data.guiding}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {["Encounter", "Freedom", "His Word", "Demonstration"].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ padding: "5px 14px", borderRadius: 3, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", color: "var(--accent)", fontSize: 9, fontFamily: MONO, letterSpacing: 1.5 }}>{s}</span>
              {i < 3 && <span style={{ color: "var(--text-primary)" }}>→</span>}
            </div>
          ))}
        </div>
      </Card></Animated>
      <Animated delay={120}><div className="px-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)", padding: 20 }}>
          <Label>North Star Vision</Label>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--text-primary)", margin: 0, fontFamily: DISPLAY }}>{data.vision_north}</p>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)", padding: 20 }}>
          <Label>Phase 1 — By 2030</Label>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--text-primary)", margin: "0 0 14px", fontFamily: DISPLAY }}>{data.vision_phase}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["2", "Locations"], ["300+", "Per Campus"], ["$1.44M", "Annual Giving"], ["2030", "Target"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center", padding: 8, background: "var(--accent-dim)", borderRadius: 4, border: "1px solid var(--accent-border)" }}>
                <p style={{ fontSize: 18, fontFamily: MONO, color: "var(--accent)", margin: "0 0 2px", fontWeight: 500 }}>{n}</p>
                <p style={{ fontSize: 8, fontFamily: MONO, color: "var(--text-primary)", margin: 0, textTransform: "uppercase", letterSpacing: 1.5 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div></Animated>
      <Animated delay={180}>
        <Label>Core Values</Label>
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
        <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--text-primary)", margin: 0, fontFamily: DISPLAY }}>{data.positioning}</p>
      </Card></Animated>
    </div>
  );
}

// ─── Identity Edit ─────────────────────────────────────────────────────────────
function IdentityEdit({ data, onSave, onCancel, isSetup }) {
  const [d, setD] = useState({ ...data, values: data.values.map(v => ({ ...v })) });
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  const setVal = (i, k, v) => setD(p => ({ ...p, values: p.values.map((val, idx) => idx === i ? { ...val, [k]: v } : val) }));
  const ta = { width: "100%", padding: "11px 13px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-primary)", fontFamily: BODY, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" };
  const inp = { ...ta, minHeight: "auto", resize: "none" };
  const canSave = d.mission.trim().length > 5;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h3 style={{ color: "var(--text-primary)", fontFamily: DISPLAY, fontWeight: 600, fontSize: 20, margin: "0 0 4px" }}>
            {isSetup ? "Define Your Identity" : "Editing Identity Layer"}
          </h3>
          {isSetup && <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0, fontFamily: DISPLAY }}>This is the foundation of your operating system. Fill in what you know — you can refine it anytime.</p>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {onCancel && <Btn secondary small onClick={onCancel}>Cancel</Btn>}
          <Btn small onClick={() => onSave(d)} disabled={!canSave}>{isSetup ? "Save & Continue →" : "Save Changes ✓"}</Btn>
        </div>
      </div>

      {[["Mission", "mission", 80], ["Guiding Statement", "guiding", 80], ["North Star Vision", "vision_north", 80], ["Phase 1 Vision", "vision_phase", 100], ["Positioning Statement", "positioning", 120]].map(([label, key, h]) => (
        <div key={key} style={{ marginBottom: 18 }}>
          <Label>{label}</Label>
          <textarea value={d[key]} onChange={e => set(key, e.target.value)} style={{ ...ta, minHeight: h }} />
        </div>
      ))}

      <Label>Core Values</Label>
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

function PeopleView({ people, gaps, onUpdateRole, onUpdateGaps, onAddRole, onRemoveRole }) {
  const tc = { pastor: "#F26751", support: "#A87EC8", director: "var(--accent)", leader: "var(--accent)", vacant: "#CC5A4A", coordinator: "#7EB8C8" };
  const [grades, setGrades] = useState({});
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState("");
  const [editingRole, setEditingRole] = useState(null);
  const [editOwns, setEditOwns] = useState("");
  const [recs, setRecs] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");
  const [needsInfo, setNeedsInfo] = useState(null);
  const [extraInfo, setExtraInfo] = useState("");
  const [addingRole, setAddingRole] = useState(people.length === 1 && people[0].name === "");
  const [newRole, setNewRole] = useState(people.length === 1 && people[0].name === "" ? { ...people[0] } : { type: "leader", name: "", role: "", owns: "", reports: "" });

  const roleTypes = ["leader", "director", "coordinator", "support", "pastor", "vacant"];
  const inp = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontFamily: BODY, fontSize: 13, outline: "none", boxSizing: "border-box" };


  const gradePeople = async () => {
    setGrading(true); setGradeError("");
    const gradeable = people.filter(p => p.type !== "vacant");
    const prompt = `You are an organizational clarity expert grading role definitions for a business operating system.

Grade each role 0-100 on: specificity of ownership, clarity of winning criteria, appropriate scope.

Roles:
${gradeable.map((p, i) => `${i + 1}. ${p.role} (${p.name}): "${p.owns}" — Reports to: ${p.reports}`).join("\n")}

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
    const vacants = people.filter(p => p.type === "vacant").map(p => p.role).join(", ");
    const overloaded = people.filter(p => p.reports && p.reports.includes("vacant")).map(p => p.name).join(", ");
    const prompt = `You are an expert organizational consultant analyzing a team structure for a business operating system called Perspexis.

ORGANIZATION: Kingdom House (Church Plant, Concord NC)
FOUNDING PASTOR: Cody Killian (only paid staff, part-time)
TOTAL TEAM: ${people.length} people (1 paid, rest volunteers)

STRUCTURAL PRESSURE POINTS:
${gaps}

VACANT ROLES: ${vacants}
PEOPLE REPORTING TO PASTOR DUE TO VACANCIES: ${overloaded}

FULL TEAM:
${people.filter(p => p.type !== "vacant").map(p => `- ${p.role}: ${p.name} — ${p.owns}`).join("\n")}

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

  const startEdit = (p) => { setEditingRole(p.role); setEditOwns(p.owns); };
  const saveEdit = (role) => {
    onUpdateRole(role, editOwns);
    setEditingRole(null);
    const newGrades = { ...grades };
    delete newGrades[role];
    setGrades(newGrades);
    setRecs(null);
  };

  const gradedRoles = Object.values(grades);
  const overallScore = gradedRoles.length > 0 ? Math.round(gradedRoles.reduce((s, g) => s + g.score, 0) / gradedRoles.length) : null;
  const priorityColor = { high: "#CC5A4A", medium: "#6EE7D8", low: "var(--accent)" };

  const groups = [
    { label: "Founding Pastor", types: ["pastor"] },
    { label: "Operations & Support", types: ["support"] },
    { label: "Level 1 — Directors", types: ["director", "vacant"] },
    { label: "Level 2 — Coordinators", types: ["coordinator"] },
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
              <Btn small onClick={() => { if(newRole.name.trim()&&newRole.role.trim()){ onAddRole&&onAddRole({...newRole}); setNewRole({type:"leader",name:"",role:"",owns:"",reports:""}); setAddingRole(false); }}} disabled={!newRole.name.trim()||!newRole.role.trim()}>Add Role ✓</Btn>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }} className="px-grid-3">
            <div><Label>Name</Label><input value={newRole.name} onChange={e=>setNewRole(p=>({...p,name:e.target.value}))} placeholder="Full name" style={inpStyle} /></div>
            <div><Label>Role Title</Label><input value={newRole.role} onChange={e=>setNewRole(p=>({...p,role:e.target.value}))} placeholder="e.g. Worship Director" style={inpStyle} /></div>
            <div><Label>Type</Label><select value={newRole.type} onChange={e=>setNewRole(p=>({...p,type:e.target.value}))} style={{...inpStyle,background:"rgba(16,37,52,0.95)"}}>
              {["leader","director","coordinator","support","pastor","vacant"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }} className="px-grid-2">
            <div><Label>Owns & Winning</Label><input value={newRole.owns} onChange={e=>setNewRole(p=>({...p,owns:e.target.value}))} placeholder="What this role owns and what winning looks like" style={inpStyle} /></div>
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
              const isEditing = editingRole === p.role;
              const leftColor = p.type === "vacant" ? "#CC5A4A" : grade ? scoreColor(grade.score) : tc[p.type];
              return (
                <div key={i} style={{
                  background: p.type === "vacant" ? "rgba(242,103,81,0.08)" : isEditing ? "rgba(242,103,81,0.06)" : "var(--surface)",
                  border: `1px solid ${p.type === "vacant" ? "rgba(204,90,74,0.14)" : isEditing ? "rgba(46,196,182,0.3)" : grade ? `${scoreColor(grade.score)}25` : "var(--border)"}`,
                  borderLeft: `3px solid ${leftColor}`,
                  borderRadius: 10, padding: 16, marginBottom: 8
                }}>
                  {!isEditing ? (
                    <div>
                      <div className="px-role-card-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 2.2fr 1fr", gap: 16, alignItems: "start", marginBottom: grade ? 12 : 0 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                            <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0 }}>{p.name}</p>
                            {p.type === "vacant" && <Tag color="#CC5A4A">Vacant</Tag>}
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
                          {p.type !== "vacant" && (
                            <button onClick={() => startEdit(p)} style={{ marginTop: 8, background: "none", border: "1px solid var(--border-strong)", borderRadius: 5, color: "var(--text-primary)", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", padding: "4px 8px" }}>✏ Edit Role</button>
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Owns & Winning</p>
                          <p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0, lineHeight: 1.6 }}>{p.owns}</p>
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
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div>
                          <p style={{ fontSize: 13, color: "var(--accent)", margin: "0 0 2px", fontFamily: MONO }}>{p.role}</p>
                          <p style={{ fontSize: 11, color: "var(--text-primary)", margin: 0 }}>Editing ownership and winning definition</p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn secondary small onClick={() => setEditingRole(null)}>Cancel</Btn>
                          <Btn small onClick={() => saveEdit(p.role)}>Save & Clear Grade ✓</Btn>
                        </div>
                      </div>
                      <textarea value={editOwns} onChange={e => setEditOwns(e.target.value)} style={ta} />
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
            const vacants = people.filter(p => p.type === "vacant").map(p => p.role).join(", ") || "None";
            const overloaded = people.filter(p => p.reports && p.reports.toLowerCase().includes("vacant")).map(p => `${p.name} (${p.role})`).join(", ") || "None";
            const prompt = `You are an organizational clarity expert analyzing a team structure.

Analyze this org chart and identify the real structural pressure points — places where the structure itself is creating friction, risk, or overload.

TEAM:
${people.map(p => `- ${p.role}: ${p.name} (${p.type}) — Reports to: ${p.reports} — Owns: ${p.owns}`).join("\n")}

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

function RhythmView({ data, onUpdate }) {
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
    const prompt = `You are an organizational rhythm expert grading meeting cadences for a business operating system.

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
function HealthOverview({ identity, people, gaps, rhythm }) {
  const [pohi, setPohi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasRhythm = rhythm && rhythm.cadences;

  const runAnalysis = async () => {
    setLoading(true); setError("");
    const vacants = people.filter(p => p.type === "vacant").map(p => p.role).join(", ") || "None";
    const prompt = `You are Perspexis, an AI-powered organizational health assessment system. Analyze this organization using the Perspexis Organizational Health Index (POHI) — a proprietary 6-dimension framework.

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
export default function PerspexisCore() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [active, setActive] = useState("identity");
  const [identity, setIdentity] = useState(DEFAULT_IDENTITY);
  const [identityMode, setIdentityMode] = useState("setup");
  const [people, setPeople] = useState(DEFAULT_PEOPLE);
  const [gaps, setGaps] = useState(DEFAULT_GAPS);
  const [rhythm, setRhythm] = useState(null);
  const [rhythmMode, setRhythmMode] = useState("setup");
  const [dataLoading, setDataLoading] = useState(false);
  const [peopleStarted, setPeopleStarted] = useState(false);

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
      const [profileRes, identityRes, peopleRes, rhythmRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("identity").select("*").eq("user_id", user.id).single(),
        supabase.from("people").select("*").eq("user_id", user.id).single(),
        supabase.from("rhythm").select("*").eq("user_id", user.id).single(),
      ]);
      if (profileRes.data?.org_name) { setOrgName(profileRes.data.org_name); setOnboarded(true); }
      if (identityRes.data) { setIdentity({ mission: identityRes.data.mission, guiding: identityRes.data.guiding, vision_north: identityRes.data.vision_north, vision_phase: identityRes.data.vision_phase, values: identityRes.data.values, positioning: identityRes.data.positioning }); setIdentityMode("view"); }
      if (peopleRes.data?.roles) { setPeople(peopleRes.data.roles); setGaps(peopleRes.data.gaps || ""); }
      if (rhythmRes.data) { setRhythm({ current: rhythmRes.data.current_state, cadences: rhythmRes.data.cadences, breaks: rhythmRes.data.breaks }); setRhythmMode("view"); }
      setDataLoading(false);
    };
    loadData();
  }, [user]);

  // ── Activity logger ──────────────────────────────────────────────────────
  const logActivity = async (action, layer, detail = "") => {
    if (!user) return;
    await supabase.from("activity_logs").insert({ user_id: user.id, action, layer, detail });
  };

  // ── Save functions ───────────────────────────────────────────────────────
  const saveIdentity = async (d) => {
    setIdentity(d); setIdentityMode("view");
    await supabase.from("identity").upsert({ user_id: user.id, ...d, updated_at: new Date().toISOString() });
    await logActivity("Identity layer saved", "identity");
  };

  const saveOnboarding = async (name, type) => {
    setOrgName(name); setOnboarded(true); setIdentityMode("setup");
    await supabase.from("profiles").update({ org_name: name, org_type: type }).eq("id", user.id);
    await logActivity("Onboarding completed", "onboarding", `${name} (${type})`);
  };

  const savePeople = async (newPeople, newGaps) => {
    setPeople(newPeople);
    if (newGaps !== undefined) setGaps(newGaps);
    await supabase.from("people").upsert({ user_id: user.id, roles: newPeople, gaps: newGaps !== undefined ? newGaps : gaps, updated_at: new Date().toISOString() });
    await logActivity("People layer updated", "people");
  };

  const saveRhythm = async (d) => {
    setRhythm(d);
    await supabase.from("rhythm").upsert({ user_id: user.id, current_state: d.current, cadences: d.cadences, breaks: d.breaks, updated_at: new Date().toISOString() });
    await logActivity("Rhythm layer saved", "rhythm");
  };

  const updateRole = (role, owns) => {
    const updated = people.map(r => r.role === role ? { ...r, owns } : r);
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

  // ── Beta whitelist check ─────────────────────────────────────────────────
  const BETA_EMAILS = [
    // Cody
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
        @media (max-width: 767px) {
          .px-sidebar        { display: none !important; }
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
          <span style={{ fontSize: 13, fontFamily: MONO, color: "var(--text-primary)", letterSpacing: 0.3 }}>Kingdom House</span>
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
            <button key={l.id} onClick={() => setActive(l.id)} style={{ width: "100%", padding: "10px 12px", borderRadius: 5, border: "none", background: active === l.id ? "var(--accent-dim)" : "transparent", borderLeft: active === l.id ? "2px solid var(--accent)" : "2px solid transparent", color: active === l.id ? "var(--accent)" : "var(--taupe)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left", marginBottom: 2, animation: `fadeUp 0.3s ease ${li * 50}ms both` }}>
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
          <div style={{ position: "absolute", bottom: 16, left: 10, right: 10, padding: "13px 12px", background: "rgba(46,196,182,0.03)", border: "1px solid rgba(46,196,182,0.1)", borderRadius: 8 }}>
            <p style={{ fontSize: 8, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 5px" }}>Next Tier</p>
            <p style={{ fontSize: 10, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.5, fontFamily: DISPLAY }}>Numbers, Process & Growth</p>
            <div style={{ padding: "7px", background: "var(--accent-dim)", border: "1px solid rgba(228,131,34,0.15)", borderRadius: 3, textAlign: "center", cursor: "pointer" }}>
              <span style={{ fontSize: 8, fontFamily: MONO, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5 }}>Upgrade to Growth →</span>
            </div>
          </div>
        </div>

        <div className="px-content" style={{ flex: 1, overflow: "auto", padding: "30px 34px" }}>
          {LAYERS.map(l => active === l.id && (
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

              {l.id === "health" && <HealthOverview identity={identity} people={people} gaps={gaps} rhythm={rhythm} />}
              {l.id === "identity" && (
                identityMode === "edit" || identityMode === "setup"
                  ? <IdentityEdit data={identity || {mission:"",guiding:"",vision_north:"",vision_phase:"",values:[{name:"",desc:""},{name:"",desc:""},{name:"",desc:""},{name:"",desc:""}],positioning:""}} onSave={saveIdentity} onCancel={() => identity && setIdentityMode("view")} isSetup={!identity} />
                  : <IdentityView data={identity} onEdit={() => setIdentityMode("edit")} />
              )}
              {l.id === "people" && (
                people.length === 0 && !peopleStarted
                  ? <EmptyPeopleState onAdd={() => setPeopleStarted(true)} />
                  : <PeopleView people={people} gaps={gaps} onUpdateRole={updateRole} onUpdateGaps={updateGaps} onAddRole={addRole} onRemoveRole={removeRole} />
              )}
              {l.id === "rhythm" && (rhythm && rhythmMode === "view"
                ? <RhythmView data={rhythm} onUpdate={updateRhythm} />
                : <RhythmSetup onDone={d => { saveRhythm(d); }} />
              )}
            </div>
          ))}
        </div>
      </div>
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

  const inp = { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid #243746", borderRadius: 6, color: "#F5F7FA", fontFamily: BODY, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 };

  const handleSubmit = async () => {
    setLoading(true); setError(""); setMessage("");
    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onAuth(data.user);
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
          <div className="px-show-mobile" style={{ display: "none", justifyContent: "center", marginBottom: 28 }}>
            <PerspexisLogo height={120} />
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
