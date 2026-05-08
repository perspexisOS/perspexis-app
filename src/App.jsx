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
const DISPLAY = "'Plus Jakarta Sans', sans-serif";
const BODY = "'DM Sans', sans-serif";

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

const scoreColor = s => s >= 80 ? "#7B9E6B" : s >= 60 ? "var(--accent)" : "#C0392B";
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
      <Animated delay={120}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
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
          {isSetup && <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0, fontFamily: BODY }}>This is the foundation of your operating system. Fill in what you know — you can refine it anytime.</p>}
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
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
  const tc = { pastor: "#FF7A5C", support: "#A87EC8", director: "var(--accent)", leader: "var(--accent)", vacant: "#E74C3C", coordinator: "#7EB8C8" };
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

  const saveNewRole = () => {
    if (!newRole.name.trim() || !newRole.role.trim()) return;
    if (people.length === 1 && people[0].name === "") {
      onUpdateRole(people[0].role, newRole.owns);
      onAddRole && onAddRole({ ...newRole });
      // Actually replace the placeholder
    }
    onAddRole && onAddRole({ ...newRole });
    setNewRole({ type: "leader", name: "", role: "", owns: "", reports: "" });
    setAddingRole(false);
  };


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
  const priorityColor = { high: "#E74C3C", medium: "#F7DC6F", low: "var(--accent)" };

  const groups = [
    { label: "Founding Pastor", types: ["pastor"] },
    { label: "Operations & Support", types: ["support"] },
    { label: "Level 1 — Directors", types: ["director", "vacant"] },
    { label: "Level 2 — Coordinators", types: ["coordinator"] },
  ];

  const ta = { width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(228,131,34,0.25)", borderRadius: 7, color: "var(--text-primary)", fontFamily: BODY, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", minHeight: 80 };
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><Label>Name</Label><input value={newRole.name} onChange={e=>setNewRole(p=>({...p,name:e.target.value}))} placeholder="Full name" style={inpStyle} /></div>
            <div><Label>Role Title</Label><input value={newRole.role} onChange={e=>setNewRole(p=>({...p,role:e.target.value}))} placeholder="e.g. Worship Director" style={inpStyle} /></div>
            <div><Label>Type</Label><select value={newRole.type} onChange={e=>setNewRole(p=>({...p,type:e.target.value}))} style={{...inpStyle,background:"rgba(16,37,52,0.95)"}}>
              {["leader","director","coordinator","support","pastor","vacant"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
            <div><Label>Owns & Winning</Label><input value={newRole.owns} onChange={e=>setNewRole(p=>({...p,owns:e.target.value}))} placeholder="What this role owns and what winning looks like" style={inpStyle} /></div>
            <div><Label>Reports To</Label><input value={newRole.reports} onChange={e=>setNewRole(p=>({...p,reports:e.target.value}))} placeholder="Direct supervisor" style={inpStyle} /></div>
          </div>
        </div></Animated>
      )}

      {/* Grade Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
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
          {gradeError && <p style={{ fontSize: 11, color: "#E74C3C", fontFamily: MONO, margin: 0 }}>{gradeError}</p>}
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
              const leftColor = p.type === "vacant" ? "#E74C3C" : grade ? scoreColor(grade.score) : tc[p.type];
              return (
                <div key={i} style={{
                  background: p.type === "vacant" ? "rgba(255,122,92,0.08)" : isEditing ? "rgba(255,122,92,0.06)" : "var(--surface)",
                  border: `1px solid ${p.type === "vacant" ? "rgba(231,76,60,0.14)" : isEditing ? "rgba(78,205,196,0.3)" : grade ? `${scoreColor(grade.score)}25` : "var(--border)"}`,
                  borderLeft: `3px solid ${leftColor}`,
                  borderRadius: 10, padding: 16, marginBottom: 8
                }}>
                  {!isEditing ? (
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 2.2fr 1fr", gap: 16, alignItems: "start", marginBottom: grade ? 12 : 0 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                            <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0 }}>{p.name}</p>
                            {p.type === "vacant" && <Tag color="#E74C3C">Vacant</Tag>}
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
      <div style={{ background: "rgba(231,76,60,0.03)", border: "1px solid rgba(231,76,60,0.18)", borderLeft: "3px solid #E74C3C", borderRadius: 10, padding: 20, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <Label c="#E74C3C">Structural Pressure Points</Label>
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

        {recError && <p style={{ fontSize: 11, color: "#E74C3C", fontFamily: MONO, margin: "0 0 12px" }}>{recError}</p>}

        {needsInfo && (
          <div style={{ padding: "16px", background: "rgba(247,220,111,0.06)", border: "1px solid rgba(247,220,111,0.2)", borderRadius: 8, marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontFamily: MONO, color: "#F7DC6F", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>More Information Needed</p>
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
      {step === 1 && (<div><h3 style={{ color: "var(--text-primary)", fontWeight: 400, fontSize: 18, margin: "0 0 6px" }}>Build your operating rhythm.</h3><p style={{ color: "var(--text-primary)", fontSize: 13, margin: "0 0 18px"}}>Define the cadences your team will actually run on.</p>{cadences.map((c, i) => (<div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)", padding: 14, marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><span style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1 }}>Cadence {i + 1}</span>{cadences.length > 1 && <button onClick={() => setCadences(p => p.filter((_, x) => x !== i))} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: 16 }}>×</button>}</div><div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginBottom: 8 }}><input value={c.name} onChange={e => upd(i, "name", e.target.value)} placeholder="Meeting name" style={fs} /><input value={c.freq} onChange={e => upd(i, "freq", e.target.value)} placeholder="Frequency" style={fs} /><input value={c.dur} onChange={e => upd(i, "dur", e.target.value)} placeholder="Duration" style={fs} /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}><input value={c.who} onChange={e => upd(i, "who", e.target.value)} placeholder="Who attends" style={fs} /><input value={c.purpose} onChange={e => upd(i, "purpose", e.target.value)} placeholder="Purpose" style={fs} /></div></div>))}<button onClick={() => setCadences(p => [...p, { name: "", freq: "", dur: "", who: "", purpose: "" }])} style={{ width: "100%", padding: 10, background: "transparent", border: "1px dashed var(--border)", borderRadius: 7, color: "var(--text-primary)", fontFamily: MONO, fontSize: 11, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1 }}>+ Add Cadence</button></div>)}
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

  const fs = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(228,131,34,0.25)", borderRadius: 6, color: "var(--text-primary)", fontFamily: BODY, fontSize: 12, outline: "none", boxSizing: "border-box" };

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
  const priorityColor = { high: "#E74C3C", medium: "#F7DC6F", low: "var(--accent)" };

  return (
    <div>
      {/* Grade Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.3)", borderRadius: 6, boxShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
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
          {gradeError && <p style={{ fontSize: 11, color: "#E74C3C", fontFamily: MONO, margin: 0 }}>{gradeError}</p>}
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
          <div key={i} style={{ background: isEditing ? "rgba(255,122,92,0.06)" : "var(--surface)", border: `1px solid ${isEditing ? "rgba(78,205,196,0.3)" : grade ? `${scoreColor(grade.score)}25` : "var(--border)"}`, borderLeft: `3px solid ${leftColor}`, borderRadius: 9, padding: 16, marginBottom: 10 }}>
            {!isEditing ? (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 2fr", gap: 14, alignItems: "start", marginBottom: grade ? 12 : 0 }}>
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
                      {cadences.length > 1 && <button onClick={() => removeCadence(i)} style={{ background: "none", border: "1px solid rgba(231,76,60,0.2)", borderRadius: 5, color: "#E74C3C", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", padding: "3px 8px" }}>Remove</button>}
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
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div><Label>Name</Label><input value={editDraft.name} onChange={e => setEditDraft(p => ({ ...p, name: e.target.value }))} style={fs} /></div>
                  <div><Label>Frequency</Label><input value={editDraft.freq} onChange={e => setEditDraft(p => ({ ...p, freq: e.target.value }))} style={fs} /></div>
                  <div><Label>Duration</Label><input value={editDraft.dur} onChange={e => setEditDraft(p => ({ ...p, dur: e.target.value }))} style={fs} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
                  <div><Label>Who Attends</Label><input value={editDraft.who} onChange={e => setEditDraft(p => ({ ...p, who: e.target.value }))} style={fs} /></div>
                  <div><Label>Purpose</Label><input value={editDraft.purpose} onChange={e => setEditDraft(p => ({ ...p, purpose: e.target.value }))} style={fs} /></div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Communication Gaps */}
      <Card warn><Label c="#E74C3C">Communication Gaps Being Addressed</Label><p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--text-primary)", margin: 0 }}>{data.breaks}</p></Card>

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
        {impError && <p style={{ fontSize: 11, color: "#E74C3C", fontFamily: MONO, margin: "0 0 12px" }}>{impError}</p>}
        {needsInfo && (
          <div style={{ padding: "16px", background: "rgba(247,220,111,0.06)", border: "1px solid rgba(247,220,111,0.2)", borderRadius: 8, marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontFamily: MONO, color: "#F7DC6F", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>More Context Needed</p>
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

  const dimColors = ["var(--accent)", "#7EB8C8", "#A87EC8", "#FF7A5C", "#7EC898", "#C87E7E"];

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
            {error && <p style={{ fontSize: 11, color: "#E74C3C", fontFamily: MONO, margin: "12px 0 0" }}>{error}</p>}
          </div>
        )}
      </div>

      {pohi && (
        <div>
          <Label>The 6 POHI Dimensions</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
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
            <div style={{ padding: "14px 18px", background: "rgba(247,220,111,0.05)", border: "1px solid rgba(247,220,111,0.2)", borderRadius: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#F7DC6F", fontFamily: MONO, margin: 0 }}>⚠ Complete the Rhythm layer to improve your Operational Rhythm and Growth Readiness scores.</p>
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <Btn onClick={runAnalysis}>Re-Run Analysis →</Btn>
            {loading && <Spinner large label="Re-analyzing your organization..." />}
            {error && <p style={{ fontSize: 11, color: "#E74C3C", fontFamily: MONO, margin: "10px 0 0" }}>{error}</p>}
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
    saveRhythm(d);
    await supabase.from("rhythm").upsert({ user_id: user.id, current_state: d.current, cadences: d.cadences, breaks: d.breaks, updated_at: new Date().toISOString() });
    await logActivity("Rhythm layer saved", "rhythm");
  };

  const updateRole = (role, owns) => {
    const updated = people.map(r => r.role === role ? { ...r, owns } : r);
    savePeople(updated, gaps);
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

  if (dataLoading) return (
    <div style={{ minHeight: "100vh", background: "#071827", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner large label="Loading your organization..." />
    </div>
  );

  if (!onboarded) return (
    <OnboardingScreen onStart={(name, type) => saveOnboarding(name, type)} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)", fontFamily: BODY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        :root {
          --bg: #071827;
          --surface: #102534;
          --surface-alt: #0D1F2D;
          --accent: #FF7A5C;
          --accent-dim: rgba(255,122,92,0.1);
          --accent-border: rgba(255,122,92,0.3);
          --teal: #2EC4B6;
          --teal-dim: rgba(46,196,182,0.1);
          --teal-border: rgba(46,196,182,0.25);
          --border: #243746;
          --border-strong: rgba(36,55,70,0.8);
          --danger: #FF7A5C;
          --danger-dim: rgba(255,122,92,0.08);
          --danger-border: rgba(255,122,92,0.25);
          --text-primary: #F5F7FA;
          --text-secondary: #94A3B8;
          --text-muted: rgba(148,163,184,0.6);
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
        input:focus, textarea:focus { border-color: #FF7A5C !important; outline: none; }
      `}</style>

      <div style={{ borderBottom: "1px solid var(--border)", padding: "10px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="data:image/png;base64,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" alt="Perspexis" style={{ height: 80, width: "auto", objectFit: "contain", imageRendering: "crisp-edges", filter: "brightness(1.5) contrast(1.1)" }} />
          </div>
          <div style={{ width: 1, height: 16, background: "var(--border-strong)" }} />
          <span style={{ fontSize: 13, fontFamily: MONO, color: "var(--text-primary)", letterSpacing: 0.3 }}>Kingdom House</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 8, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 3px", opacity: 0.6 }}>Core Progress</p>
            <p style={{ fontSize: 11, fontFamily: MONO, color: "var(--accent)", margin: 0, fontWeight: 500 }}>{pct}% Complete</p>
          </div>
          <div style={{ width: 80 }}><Bar v={pct} /></div>
          <span style={{ padding: "3px 10px", borderRadius: 3, background: "var(--accent-dim)", border: "1px solid rgba(228,131,34,0.25)", color: "var(--accent)", fontSize: 9, fontFamily: MONO, textTransform: "uppercase", letterSpacing: 1.5 }}>Core</span>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: "5px 12px", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-secondary)", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
        <div style={{ width: 194, borderRight: "1px solid var(--border)", padding: "18px 10px", flexShrink: 0, position: "relative", background: "rgba(16,37,52,0.6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <img src="data:image/png;base64,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" alt="" style={{ width: 38, height: 38, objectFit: "contain" }} />
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
          <div style={{ position: "absolute", bottom: 16, left: 10, right: 10, padding: "13px 12px", background: "rgba(78,205,196,0.03)", border: "1px solid rgba(78,205,196,0.1)", borderRadius: 8 }}>
            <p style={{ fontSize: 8, fontFamily: MONO, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 5px" }}>Next Tier</p>
            <p style={{ fontSize: 10, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.5, fontFamily: DISPLAY }}>Numbers, Process & Growth</p>
            <div style={{ padding: "7px", background: "var(--accent-dim)", border: "1px solid rgba(228,131,34,0.15)", borderRadius: 3, textAlign: "center", cursor: "pointer" }}>
              <span style={{ fontSize: 8, fontFamily: MONO, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5 }}>Upgrade to Growth →</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "30px 34px" }}>
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
                !identity
                  ? <IdentitySetupPrompt onStart={() => setIdentityMode("setup")} />
                  : identityMode === "edit" || identityMode === "setup"
                    ? <IdentityEdit data={identity || {mission:"",guiding:"",vision_north:"",vision_phase:"",values:[{name:"",desc:""},{name:"",desc:""},{name:"",desc:""},{name:"",desc:""}],positioning:""}} onSave={saveIdentity} onCancel={() => identity && setIdentityMode("view")} isNew={!identity} />
                    : <IdentityView data={identity} onEdit={() => setIdentityMode("edit")} />
              )}
              {l.id === "people" && (
                !people
                  ? <PeopleSetupPrompt onStart={() => {
                      setPeople([{ type:"pastor", name:"", role:"", owns:"", reports:"—" }]);
                    }} />
                  : <PeopleView people={people} gaps={gaps} onUpdateRole={updateRole} onUpdateGaps={setGaps} />
              )}
              {l.id === "rhythm" && (rhythm && rhythmMode === "view"
                ? <RhythmView data={rhythm} onUpdate={updateRhythm} />
                : <RhythmSetup onDone={d => { saveRhythm(d); }} />
              )}
            </div>
          ))}
        </div>
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
              <circle cx="65" cy="65" r="56" stroke="#FF7A5C" strokeWidth="7" strokeLinecap="round" strokeDasharray="88 264" strokeDashoffset="0" opacity="1" />
              <circle cx="65" cy="65" r="56" stroke="#2EC4B6" strokeWidth="7" strokeLinecap="round" strokeDasharray="55 297" strokeDashoffset="-110" opacity="0.75" />
              <circle cx="65" cy="65" r="56" stroke="#F5F7FA" strokeWidth="7" strokeLinecap="round" strokeDasharray="32 320" strokeDashoffset="-215" opacity="0.3" />
            </svg>
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="data:image/png;base64,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" alt="" style={{ width: 48, height: 48, objectFit: "contain" }} />
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
              <circle cx="36" cy="36" r="30" stroke="#FF7A5C" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="48 140" strokeDashoffset="0" opacity="1" />
              <circle cx="36" cy="36" r="30" stroke="#2EC4B6" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="30 158" strokeDashoffset="-60" opacity="0.7" />
              <circle cx="36" cy="36" r="30" stroke="#F5F7FA" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="18 170" strokeDashoffset="-118" opacity="0.3" />
            </svg>
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="data:image/png;base64,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" alt="" style={{ width: 26, height: 26, objectFit: "contain" }} />
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
            <circle cx="9" cy="9" r="7" stroke="#FF7A5C" strokeWidth="2" strokeLinecap="round" strokeDasharray="14 30" />
            <circle cx="9" cy="9" r="7" stroke="#2EC4B6" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 36" strokeDashoffset="-16" opacity="0.6" />
          </svg>
        </div>
      </div>
      {label && <p style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: MONO, margin: 0, letterSpacing: 1 }}>{label}</p>}
    </div>
  );
}


// ─── Auth Screen ────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inp = { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid #243746", borderRadius: 6, color: "#F5F7FA", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 };

  const handleSubmit = async () => {
    setLoading(true); setError(""); setMessage("");
    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onAuth(data.user);
    } else if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
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
    <div style={{ minHeight: "100vh", background: "#071827", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes arcSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #94A3B8 !important; }
      `}</style>
      <div style={{ width: "100%", maxWidth: 440, padding: "0 24px", animation: "fadeUp 0.4s ease both" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ position: "relative", width: 72, height: 72 }}>
              <div style={{ position: "absolute", inset: 0, animation: "arcSpin 3s linear infinite" }}>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <circle cx="36" cy="36" r="30" stroke="#FF7A5C" strokeWidth="3" strokeLinecap="round" strokeDasharray="48 140" strokeDashoffset="0" opacity="1" />
                  <circle cx="36" cy="36" r="30" stroke="#2EC4B6" strokeWidth="3" strokeLinecap="round" strokeDasharray="30 158" strokeDashoffset="-60" opacity="0.7" />
                  <circle cx="36" cy="36" r="30" stroke="#F5F7FA" strokeWidth="3" strokeLinecap="round" strokeDasharray="18 170" strokeDashoffset="-118" opacity="0.3" />
                </svg>
              </div>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="data:image/png;base64,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" alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
              </div>
            </div>
          </div>
          <img src="data:image/png;base64,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" alt="Perspexis" style={{ height: 36, width: "auto", objectFit: "contain", filter: "brightness(1.5) contrast(1.1)", marginBottom: 10 }} />
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#FF7A5C", textTransform: "uppercase", letterSpacing: 2.5, margin: 0 }}>Clarity. Alignment. Momentum.</p>
        </div>
        <div style={{ background: "#102534", border: "1px solid #243746", borderRadius: 10, padding: 32 }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 18, color: "#F5F7FA", margin: "0 0 22px" }}>
            {mode === "login" ? "Sign in to your account" : mode === "signup" ? "Create your account" : "Reset your password"}
          </h2>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={inp} />
          {mode !== "reset" && <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" style={inp} onKeyDown={e => e.key === "Enter" && handleSubmit()} />}
          {error && <p style={{ fontSize: 12, color: "#FF7A5C", fontFamily: "'DM Sans', sans-serif", margin: "0 0 12px" }}>{error}</p>}
          {message && <p style={{ fontSize: 12, color: "#2EC4B6", fontFamily: "'DM Sans', sans-serif", margin: "0 0 12px" }}>{message}</p>}
          <button onClick={handleSubmit} disabled={loading || !email} style={{ width: "100%", padding: "13px", background: email ? "#FF7A5C" : "rgba(255,255,255,0.04)", border: "none", borderRadius: 6, color: email ? "#071827" : "#94A3B8", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: email ? "pointer" : "not-allowed", marginBottom: 18 }}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : mode === "signup" ? "Create Account →" : "Send Reset Email →"}
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            {mode === "login" && (<><button onClick={() => setMode("signup")} style={{ background: "none", border: "none", color: "#FF7A5C", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer" }}>Don't have an account? Sign up</button><button onClick={() => setMode("reset")} style={{ background: "none", border: "none", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer" }}>Forgot password?</button></>)}
            {mode !== "login" && <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "#FF7A5C", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer" }}>Back to sign in</button>}
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#243746", textTransform: "uppercase", letterSpacing: 1.5 }}>Built for Leadership. Designed for Clarity.</p>
      </div>
    </div>
  );
}

// ─── Onboarding Welcome Screen ─────────────────────────────────────────────
function OnboardingScreen({ onStart }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const orgTypes = ["Business", "Church / Ministry", "Nonprofit", "Agency", "Other"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes arcSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .type-btn:hover { border-color: #FF7A5C !important; color: #FF7A5C !important; }
      `}</style>

      <div style={{ maxWidth: 520, width: "90%", animation: "fadeUp 0.5s ease both" }}>

        {/* Logo + spinner icon */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 48 }}>
          <div style={{ position: "relative", width: 100, height: 100, marginBottom: 24 }}>
            <div style={{ position: "absolute", inset: 0, animation: "arcSpin 4s linear infinite" }}>
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="43" stroke="#FF7A5C" strokeWidth="5" strokeLinecap="round" strokeDasharray="68 202" opacity="0.9" />
                <circle cx="50" cy="50" r="43" stroke="#2EC4B6" strokeWidth="5" strokeLinecap="round" strokeDasharray="42 228" strokeDashoffset="-85" opacity="0.7" />
                <circle cx="50" cy="50" r="43" stroke="#F5F7FA" strokeWidth="5" strokeLinecap="round" strokeDasharray="25 245" strokeDashoffset="-165" opacity="0.25" />
              </svg>
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="data:image/png;base64,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" alt="" style={{ width: 42, height: 42, objectFit: "contain" }} />
            </div>
          </div>
          <img src="data:image/png;base64,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" alt="Perspexis" style={{ height: 44, width: "auto", objectFit: "contain", filter: "brightness(1.5) contrast(1.1)", marginBottom: 12 }} />
          <p style={{ fontSize: 13, fontFamily: BODY, color: "var(--text-secondary)", margin: 0, letterSpacing: 0.3 }}>Clarity. Alignment. Momentum.</p>
        </div>

        {/* Welcome card */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 36, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px", letterSpacing: -0.3 }}>Welcome to Perspexis</h1>
          <p style={{ fontSize: 14, fontFamily: BODY, color: "var(--text-secondary)", margin: "0 0 28px", lineHeight: 1.65 }}>
            Let's build your operating system. Start by telling us about your organization.
          </p>

          {/* Org name */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 8px" }}>Organization Name</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. BuildRight Contracting"
              style={{
                width: "100%", padding: "12px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-primary)",
                fontFamily: DISPLAY, fontSize: 14, outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Org type */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 10px" }}>Organization Type</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {orgTypes.map(t => (
                <button key={t} className="type-btn" onClick={() => setType(t)} style={{
                  padding: "7px 14px", borderRadius: 4,
                  background: type === t ? "var(--accent-dim)" : "transparent",
                  border: `1px solid ${type === t ? "var(--accent)" : "var(--border)"}`,
                  color: type === t ? "var(--accent)" : "var(--text-secondary)",
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
              background: name.trim() && type ? "var(--accent)" : "rgba(255,255,255,0.05)",
              border: "none", borderRadius: 6,
              color: name.trim() && type ? "#071827" : "var(--text-secondary)",
              fontFamily: DISPLAY, fontSize: 13, fontWeight: 700,
              cursor: name.trim() && type ? "pointer" : "not-allowed",
              letterSpacing: 0.5, transition: "all 0.2s ease"
            }}>
            Build My Operating System →
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, fontFamily: MONO, color: "var(--text-secondary)", marginTop: 20, opacity: 0.5 }}>
          Built for Leadership. Designed for Clarity.
        </p>
      </div>
    </div>
  );
}
