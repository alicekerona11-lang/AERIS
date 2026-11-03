import { useEffect, useState } from "react";
import { Activity, Zap, TrendingUp, AlertTriangle, RefreshCw, BrainCircuit, ShieldCheck, Database, Download, CircleCheck, Clock, Gauge } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from "recharts";
import "./App.css";

const API = "http://127.0.0.1:8000";
const modules = [
  ["Demand Monitoring", "Track statewide electricity demand", Activity],
  ["Concept Drift", "Screen for changing demand patterns", TrendingUp],
  ["Dynamic Model Routing", "Compare candidate forecasting models", BrainCircuit],
  ["Demand Forecasting", "Estimate the next seven days", Gauge],
  ["Forecast Uncertainty", "Display approximate forecast ranges", ShieldCheck],
  ["Model Validation", "Evaluate chronological holdout errors", CircleCheck],
  ["Feature Engineering", "Prepare time-series features", Database],
  ["Grid Decision Support", "Requires verified zone/network data", Zap],
];
const fmt = (v, digits=1) => v == null || v === "" || !Number.isFinite(Number(v)) ? "—" : Number(v).toLocaleString("en-IN",{maximumFractionDigits:digits});

function Metric({title,value,unit,icon:Icon,note}) {
  return <div className="metric"><div className="metric-top"><span>{title}</span><div className="metric-icon"><Icon size={19}/></div></div><div className="metric-value">{value}</div><div className="metric-bottom"><span>{unit}</span><span>{note}</span></div></div>;
}
function Panel({title,subtitle,children,action}) {
  return <section className="panel"><div className="panel-head"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>{children}</section>;
}
export default function App(){
  const [summary,setSummary]=useState({});
  const [trend,setTrend]=useState([]);
  const [forecast,setForecast]=useState([]);
  const [performance,setPerformance]=useState([]);
  const [drift,setDrift]=useState({});
  const [moduleData,setModuleData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [updated,setUpdated]=useState("");

  async function loadDashboard(){
    setLoading(true); setError("");
    try{
      const paths=["/api/summary","/api/trend","/api/forecast","/api/model-performance","/api/drift","/api/modules"];
      const data=await Promise.all(paths.map(async p=>{const r=await fetch(API+p);if(!r.ok)throw new Error(`${p}: HTTP ${r.status}`);return r.json()}));
      setSummary(data[0]||{});setTrend(Array.isArray(data[1])?data[1]:[]);setForecast(Array.isArray(data[2])?data[2]:[]);
      setPerformance(Array.isArray(data[3])?data[3]:[]);setDrift(data[4]||{});setModuleData(Array.isArray(data[5])?data[5]:[]);
      setUpdated(new Date().toLocaleTimeString());
    }catch(e){setError(`${e.message}. Start the backend at http://127.0.0.1:8000 and check /api/health.`)}
    finally{setLoading(false)}
  }
  useEffect(()=>{loadDashboard()},[]);
  function downloadCSV(){
    const rows=[["date","actual_demand_mw"],...trend.map(x=>[x.date,x.actual])];
    const csv=rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));const a=document.createElement("a");a.href=url;a.download="aeris-demand.csv";a.click();URL.revokeObjectURL(url);
  }
  const history=trend.map(x=>({date:x.date,actual:Number(x.actual)}));
  const prediction=forecast.map(x=>({date:x.date,forecast:Number(x.forecast),lower:Number(x.lower),upper:Number(x.upper)}));
  const best=performance[0]?.model||summary.selected_model||"Rolling baseline";
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Zap size={24} fill="currentColor"/></div><div><h1>AERIS</h1><span>ENERGY INTELLIGENCE</span></div></div>
      <div className="side-label">WORKSPACE</div>
      <a className="nav-item active" href="#overview"><Activity size={18}/> Overview</a>
      <a className="nav-item" href="#demand"><TrendingUp size={18}/> Demand analytics</a>
      <a className="nav-item" href="#models"><BrainCircuit size={18}/> Model intelligence</a>
      <a className="nav-item" href="#modules"><Database size={18}/> System modules</a>
      <div className="sidebar-bottom"><div className="connection-dot"><span/> LOCAL API</div><p>Adaptive electricity forecasting and decision support.</p><span className="version">AERIS · Prototype</span></div>
    </aside>
    <main className="main" id="overview">
      <header className="topbar"><div><div className="eyebrow">ENERGY MANAGEMENT / OVERVIEW</div><h1>Grid Intelligence Dashboard</h1><p className="top-subtitle">Electricity demand forecasting and adaptive model monitoring</p></div>
        <div className="top-actions"><span className={`connection ${error?"offline":loading?"pending":"online"}`}><span/>{error?"API disconnected":loading?"Connecting...":"API connected"}</span><button className="refresh-btn" onClick={loadDashboard} disabled={loading}><RefreshCw size={16} className={loading?"spin":""}/> Refresh</button></div>
      </header>
      {error&&<div className="error-banner"><AlertTriangle size={19}/><div><strong>Dashboard data unavailable</strong><p>{error}</p></div><button onClick={loadDashboard}>Retry</button></div>}
      <div className="overview-strip"><div><span className="strip-label">REGION</span><strong>Tamil Nadu · Statewide</strong></div><div><span className="strip-label">SELECTED MODEL</span><strong>{best}</strong></div><div><span className="strip-label">LATEST DATA DATE</span><strong>{summary.latest_date||"—"}</strong></div><div><span className="strip-label">LAST REFRESH</span><strong>{updated||"Waiting for data"}</strong></div></div>
      <div className="section-heading"><div><h2>Demand overview</h2><p>Latest values from the dataset and backend</p></div><span className="unit-tag">UNITS: MW</span></div>
      <div className="metrics-grid">
        <Metric title="Latest Peak Demand" value={fmt(summary.latest_demand_mw)} unit="Megawatts" icon={Zap} note="Latest record"/>
        <Metric title="Peak Shortage" value={fmt(summary.shortage_mw)} unit="Megawatts" icon={AlertTriangle} note="If supplied"/>
        <Metric title="Forecast Horizon" value={`${forecast.length} days`} unit="Predicted points" icon={TrendingUp} note="Baseline forecast"/>
        <Metric title="Models Evaluated" value={performance.length} unit="Candidate models" icon={BrainCircuit} note="Holdout results"/>
      </div>
      <div className="chart-grid" id="demand">
        <Panel title="Historical demand" subtitle="Statewide peak demand from the loaded CSV" action={<button className="icon-btn" title="Export CSV" onClick={downloadCSV}><Download size={17}/></button>}>
          {history.length?<div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={history}><defs><linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0e9f91" stopOpacity={.25}/><stop offset="95%" stopColor="#0e9f91" stopOpacity={.01}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eef2"/><XAxis dataKey="date" tick={{fontSize:10}} minTickGap={35}/><YAxis tick={{fontSize:10}} width={65}/><Tooltip/><Area type="monotone" dataKey="actual" name="Actual demand (MW)" stroke="#0e9f91" fill="url(#demandFill)"/></AreaChart></ResponsiveContainer></div>:<Empty title="No historical data loaded" text="Check backend/data/master.csv and /api/trend."/>}
          <div className="panel-foot"><span><i className="legend-dot teal"/> Actual statewide demand</span></div>
        </Panel>
        <Panel title="Concept drift monitor" subtitle="Prototype rolling-window screening">
          <div className="drift-status"><div className="drift-icon"><Activity size={23}/></div><div><span className="muted">CURRENT STATUS</span><h3>{drift.status||"Waiting for data"}</h3></div></div>
          <div className="detail-list"><div><span>Drift signal</span><strong>{drift.drift_detected==null?"—":String(drift.drift_detected)}</strong></div><div><span>Recent change</span><strong>{drift.change_pct==null?"—":`${drift.change_pct}%`}</strong></div><div><span>Method</span><strong>{drift.method||"Rolling-window mean"}</strong></div></div>
          <div className="notice"><AlertTriangle size={16}/><p>A screening signal is not proof of a permanent or causal change.</p></div>
        </Panel>
      </div>
      <div className="chart-grid" id="models">
        <Panel title="Seven-day forecast" subtitle="Rolling-average baseline with approximate ranges">
          {prediction.length?<div className="chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={prediction}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eef2"/><XAxis dataKey="date" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}} width={65}/><Tooltip/><Legend/><Line dataKey="upper" name="Upper range" stroke="#a6b5e8" strokeDasharray="5 4" dot={false}/><Line dataKey="forecast" name="Forecast" stroke="#5276d9" strokeWidth={2.5} dot={false}/><Line dataKey="lower" name="Lower range" stroke="#a6b5e8" strokeDasharray="5 4" dot={false}/></LineChart></ResponsiveContainer></div>:<Empty title="Forecast unavailable" text="Add a valid dataset with at least a few demand records."/>}
        </Panel>
        <Panel title="Model performance" subtitle="Chronological holdout evaluation; lower errors are better">
          {performance.length?<div className="table-wrap"><table><thead><tr><th>Model</th><th>MAE</th><th>RMSE</th><th>MAPE</th></tr></thead><tbody>{performance.map(m=><tr key={m.model}><td><strong>{m.model}</strong>{m.status&&<small>{m.status}</small>}</td><td>{fmt(m.mae,2)}</td><td>{fmt(m.rmse,2)}</td><td>{fmt(m.mape,2)}%</td></tr>)}</tbody></table></div>:<Empty title="Model metrics unavailable" text="Requires enough data and scikit-learn installed." compact/>}
          <div className="model-note"><CircleCheck size={16}/><span>Models are compared on a chronological holdout, not random splits.</span></div>
        </Panel>
      </div>
      <Panel title="System modules" subtitle="Capabilities and current implementation status">
        <div className="modules-grid" id="modules">{modules.map(([name,description,Icon])=>{const m=moduleData.find(x=>x.name===name);const status=m?.status||"Status unavailable";return <div className="module-card" key={name}><div className="module-icon"><Icon size={20}/></div><div className="module-info"><h3>{name}</h3><p>{description}</p><span className={`module-status ${/monitoring|enabled|evaluation|baseline|prototype|approximate/i.test(status)?"status-ready":"status-pending"}`}><span/>{status}</span></div></div>})}</div>
      </Panel>
      <Panel title="Grid allocation data" subtitle="Zone-level allocation is intentionally disabled without verified network data">
        <div className="allocation-note"><ShieldCheck size={22}/><div><strong>Real zone-level data required</strong><p>The supplied dataset is statewide. AERIS does not invent zone demand, available supply, or transfer recommendations. Provide verified zone, substation, supply and network data to enable allocation support.</p></div></div>
      </Panel>
      <footer className="footer"><span>AERIS · Adaptive Energy & Resource Intelligence System</span><span><Clock size={13}/>{updated?`Updated ${updated}`:"Awaiting backend data"}</span></footer>
    </main>
  </div>;
}
function Empty({title,text,compact=false}){return <div className={`empty-state ${compact?"compact":""}`}><Activity size={26}/><strong>{title}</strong><p>{text}</p></div>}
