import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { Gift, Pencil, Trash2, Share2, Plus, Lock, ShoppingBag, Copy, X, Check, Star, Settings, PlusCircle, ArrowLeft, Calendar, Link, MessageSquare } from "lucide-react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, getDoc } from "firebase/firestore";

/* ══ STYLES ══ */
const injectStyles = () => {
  if (document.getElementById("ws")) return;
  const s = document.createElement("style");
  s.id = "ws";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased;background:#FFFFFF;color:#222222}
    @keyframes popIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
    @keyframes confettiFall{0%{transform:translateY(-16px) rotate(0deg);opacity:1}100%{transform:translateY(100px) rotate(400deg);opacity:0}}
    .pop-in{animation:popIn .3s ease both}
    .fade-up{animation:fadeUp .25s ease both}
    .btn{font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;cursor:pointer;border:none;
      transition:all .2s ease;display:inline-flex;align-items:center;justify-content:center;gap:7px}
    .btn:hover{transform:scale(1.02)}
    .btn:active{transform:scale(.98)}
    .aircard{background:#fff;border-radius:24px;border:1px solid #EBEBEB;transition:box-shadow .2s,transform .2s;overflow:hidden}
    .aircard:hover{box-shadow:0 6px 20px rgba(0,0,0,.12);transform:translateY(-2px)}
    input,textarea{font-family:'Plus Jakarta Sans',sans-serif;font-weight:400}
    input:focus,textarea:focus{outline:none;border-color:#222!important;box-shadow:none!important}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:#ddd;border-radius:8px}
    @media(max-width:600px){.hide-sm{display:none!important}}
  `;
  document.head.appendChild(s);
};

const T = {
  bg:"#FFFFFF", surface:"#FFFFFF", surface2:"#F7F7F7", border:"#EBEBEB",
  text:"#222222", sub:"#484848", muted:"#717171", light:"#B0B0B0",
  accent:"#FF385C", accentL:"#FFF1F2", accentD:"#E31C5F",
  taken:"#F0FFF4", takenT:"#276749",
};

const CATEGORIES = ["🎀 Ropa","💄 Belleza","📚 Libros","🎮 Tech","🏠 Hogar","✈️ Experiencias","🍫 Comida","🎵 Música","💪 Deporte","🌸 Otro"];
const PRIORITIES = [
  { short:"🔥 Lo quiero mucho", color:"#FF385C" },
  { short:"✨ Estaría bueno", color:"#F59E0B" },
  { short:"💙 Si se puede", color:"#6366F1" },
];
const EVENTS = ["🎂 Cumpleaños","🎄 Navidad","👩 Día de la Madre","👨 Día del Padre","👶 Día del Niño","💝 San Valentín","🎓 Graduación","🎉 Otro"];
const EMOJIS = ["🎁","👟","📖","🕯️","💄","🎮","🎵","🌸","💍","🧣","☕","🍰","✈️","🎨","💪","🏠","📷","🌿","🦋","💎","👜","🎧","🍷","🌺","🧴","⌚","🎯","🛋️","🧸","🎀"];
const ICOLORS = ["#FF385C","#6366F1","#10B981","#8B5CF6","#F59E0B","#EC4899","#14B8A6","#F97316"];
const PRANGES = [["todo","Todos"],["u50","Hasta $50k"],["m50","$50k–$100k"],["o100","Más de $100k"]];

const fmt = n => n ? `$${Number(n).toLocaleString("es-CL")}` : "";
const fmtDate = d => { if(!d) return ""; return new Date(d+"T00:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"long",year:"numeric"}); };
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2);

/* ══ LOGO ══ */
function Logo({ size=32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect width="120" height="120" rx="20" fill={T.accent}/>
      <rect x="20" y="68" width="80" height="40" rx="6" fill="white" opacity=".9"/>
      <rect x="14" y="55" width="92" height="17" rx="6" fill="white"/>
      <rect x="54" y="55" width="12" height="53" rx="4" fill={T.accent}/>
      <rect x="14" y="60" width="92" height="8" rx="3" fill={T.accent}/>
      <path d="M60 55 C53 37 28 29 24 43 C20 55 36 60 60 55Z" fill="white"/>
      <path d="M60 55 C67 37 92 29 96 43 C100 55 84 60 60 55Z" fill="white" opacity=".85"/>
      <circle cx="60" cy="55" r="7" fill={T.accent}/>
      <circle cx="60" cy="55" r="3.5" fill="white"/>
    </svg>
  );
}

/* ══ GOOGLE BUTTON ══ */
const GSvg = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.4-7.8 19.4-20 0-1.3-.1-2.7-.4-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.4 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.5-4.7l-6.2-5.2C29.3 35.8 26.8 36 24 36c-5.2 0-9.6-3.4-11.2-8H6.2C9.5 36.8 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.5 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
  </svg>
);

function GBtn({ onClick, label="Continuar con Google", full=false, small=false }) {
  return (
    <button className="btn" onClick={onClick} style={{
      background:"white", color:T.text, border:"1px solid #DCDCDC", borderRadius:8,
      padding:small?"10px 16px":"14px 24px", fontSize:small?13:15, fontWeight:600,
      width:full?"100%":"auto", boxShadow:"0 1px 2px rgba(0,0,0,0.08)",
    }}><GSvg/>{label}</button>
  );
}

function PillBtn({ label, active, onClick }) {
  return (
    <button className="btn" onClick={onClick} style={{
      background:active?T.text:"white", color:active?"white":T.text,
      border:`1.5px solid ${active?T.text:"#DCDCDC"}`, borderRadius:30,
      padding:"8px 16px", fontSize:13, fontWeight:active?600:500,
    }}>{label}</button>
  );
}

function Swatch({ color, selected, onClick }) {
  return (
    <div onClick={onClick} style={{
      width:20, height:20, borderRadius:"50%", background:color, cursor:"pointer",
      boxShadow:selected?`0 0 0 2px white, 0 0 0 4px ${color}`:"none", transition:"box-shadow .15s",
    }}/>
  );
}

function EmojiPick({ value, onChange }) {
  const [open,setOpen] = useState(false);
  return (
    <div style={{position:"relative",display:"inline-block"}}>
      <button className="btn" onClick={()=>setOpen(!open)} style={{
        fontSize:22, background:T.surface2, border:"1px solid #EBEBEB", borderRadius:12, width:52, height:52,
      }}>{value}</button>
      {open && (
        <div className="pop-in" style={{
          position:"absolute", top:58, left:0, background:T.surface,
          border:"1px solid #EBEBEB", borderRadius:16, padding:10,
          display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:2,
          zIndex:400, boxShadow:"0 8px 30px rgba(0,0,0,0.15)",
        }}>
          {EMOJIS.map(e=>(
            <button key={e} className="btn" onClick={()=>{onChange(e);setOpen(false);}} style={{
              fontSize:18, background:value===e?T.surface2:"transparent", borderRadius:6, padding:4,
            }}>{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function Confetti({ active }) {
  if (!active) return null;
  const cols = ["#FF385C","#6366F1","#10B981","#F59E0B","#EC4899"];
  const p = Array.from({length:18},(_,i)=>({
    id:i, color:cols[i%cols.length],
    left:`${5+Math.random()*90}%`, delay:`${Math.random()*.5}s`,
    size:6+Math.random()*8, circle:Math.random()>.5,
  }));
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,pointerEvents:"none",zIndex:9999,overflow:"hidden",height:120}}>
      {p.map(x=>(
        <div key={x.id} style={{
          position:"absolute", left:x.left, top:-8, width:x.size, height:x.size,
          background:x.color, borderRadius:x.circle?"50%":2,
          animation:`confettiFall 1.1s ${x.delay} ease-in forwards`,
        }}/>
      ))}
    </div>
  );
}

function Lightbox({ src, onClose }) {
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.88)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:900, padding:20, cursor:"zoom-out",
    }}>
      <button className="btn" onClick={onClose} style={{
        position:"absolute", top:20, right:20,
        background:"rgba(255,255,255,0.1)", borderRadius:"50%", width:44, height:44, color:"white",
      }}><X size={20}/></button>
      <img src={src} alt="ref" onClick={e=>e.stopPropagation()} style={{
        maxWidth:"100%", maxHeight:"88vh", borderRadius:12,
        boxShadow:"0 20px 60px rgba(0,0,0,0.5)", objectFit:"contain",
      }}/>
    </div>
  );
}

const fs = {
  width:"100%", border:"1.5px solid #EBEBEB", borderRadius:12,
  padding:"14px 16px", fontSize:15, background:"#FFFFFF", color:"#222222",
};

/* ══ ITEM MODAL ══ */
function ItemModal({ item, onSave, onClose }) {
  const blank = { name:"",category:CATEGORIES[0],price:"",link:"",priority:0,notes:"",color:ICOLORS[0],emoji:"🎁",taken:false,takenBy:"",description:"",photo:null,activeTab:"link" };
  const [f,setF] = useState(item || blank);
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  const handlePhoto = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set("photo", ev.target.result);
    reader.readAsDataURL(file);
  };

  const priorityConfig = [
    { emoji:"🔥", label:"Lo quiero mucho", color:"#FF385C", bg:"#FFF1F2" },
    { emoji:"✨", label:"Estaría bueno", color:"#F59E0B", bg:"#FFFBEB" },
    { emoji:"💙", label:"Si se puede", color:"#6366F1", bg:"#EEF2FF" },
  ];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:500,backdropFilter:"blur(8px)"}}>
      <div className="pop-in" style={{background:T.surface,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:640,paddingBottom:28,boxShadow:"0 -12px 60px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 6px"}}>
          <div style={{width:40,height:4,borderRadius:2,background:"#DCDCDC"}}/>
        </div>
        <div style={{padding:"0 20px"}}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontWeight:800,fontSize:18,color:T.text}}>{item?.id?"Editar deseo":"Nuevo deseo 🎁"}</div>
            <button className="btn" onClick={onClose} style={{background:T.surface2,borderRadius:"50%",width:36,height:36,flexShrink:0}}><X size={16}/></button>
          </div>

          {/* Fila 1: ¿Qué quieres? */}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:5}}>
              ¿Qué quieres? <span style={{background:"#FEE2E2",color:"#DC2626",borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700,marginLeft:4}}>obligatorio</span>
            </div>
            <input value={f.name} onChange={e=>set("name",e.target.value)}
              placeholder="Ej: Sombrero de paja de Providencia"
              style={{...fs,padding:"11px 14px",fontSize:14,borderColor:f.name?"#10B981":"#EBEBEB",background:f.name?"#F0FFF4":"white"}}/>
          </div>

          {/* Fila 2: Link + Descripción + Foto en línea — iguales */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:5}}>🔗 Link <span style={{fontSize:9,fontWeight:400}}>opcional</span></div>
              <input type="url" value={f.link} onChange={e=>set("link",e.target.value)}
                placeholder="https://..." style={{...fs,padding:"10px 12px",fontSize:13,borderColor:f.link?"#10B981":"#EBEBEB"}}/>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:5}}>📝 Descripción <span style={{fontSize:9,fontWeight:400}}>opcional</span></div>
              <input value={f.description} onChange={e=>set("description",e.target.value)}
                placeholder="Color, talla, modelo..."
                style={{...fs,padding:"10px 12px",fontSize:13,borderColor:f.description?"#10B981":"#EBEBEB"}}/>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:5}}>📷 Foto <span style={{fontSize:9,fontWeight:400}}>opcional</span></div>
              {f.photo ? (
                <div style={{position:"relative"}}>
                  <img src={f.photo} alt="ref" style={{width:"100%",height:44,objectFit:"cover",borderRadius:10,border:"2px solid #10B981"}}/>
                  <button className="btn" onClick={()=>set("photo",null)} style={{position:"absolute",top:-5,right:-5,background:"#EF4444",borderRadius:"50%",width:16,height:16,color:"white",fontSize:9,padding:0}}>✕</button>
                </div>
              ) : (
                <label style={{display:"flex",alignItems:"center",justifyContent:"center",height:44,border:"2px dashed #DCDCDC",borderRadius:10,cursor:"pointer",background:T.surface2}}>
                  <span style={{fontSize:20}}>📷</span>
                  <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
                </label>
              )}
            </div>
          </div>

          {/* Fila 3: ¿Cuánto lo quieres? */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:5}}>¿Cuánto lo quieres?</div>
            <div style={{display:"flex",gap:8}}>
              {priorityConfig.map((p,i)=>(
                <button key={i} className="btn" onClick={()=>set("priority",i)} style={{
                  flex:1,gap:6,
                  background:f.priority===i?p.bg:T.surface2,
                  border:`2px solid ${f.priority===i?p.color:"#EBEBEB"}`,
                  borderRadius:12,padding:"10px 8px",
                  color:f.priority===i?p.color:T.muted,
                  transition:"all .2s",
                }}>
                  <span style={{fontSize:18}}>{p.emoji}</span>
                  <span style={{fontSize:11,fontWeight:f.priority===i?700:500,lineHeight:1.2}}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fila 4: Botón */}
          <button className="btn" onClick={()=>{
            if(!f.name.trim()) return;
            onSave({...f, id:f.id||uid(), price:Number(f.price)||0});
          }} style={{
            width:"100%",background:f.name.trim()?T.accent:"#DCDCDC",
            color:"white",borderRadius:14,padding:"14px",fontSize:15,fontWeight:800,
            boxShadow:f.name.trim()?"0 4px 16px rgba(255,56,92,0.35)":"none",
            transition:"all .3s",
          }}>
            {item?.id?"Guardar cambios ✓":"Agregar a mi lista 🎁"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ LIST MODAL ══ */
function ListModal({ list, onSave, onClose }) {
  const [f,setF] = useState(list||{event:EVENTS[0],date:"",message:"",customEvent:""});
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const isOtro = f.event === "🎉 Otro";
  const eventLabel = isOtro && f.customEvent.trim() ? `🎉 ${f.customEvent.trim()}` : f.event;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:500,backdropFilter:"blur(4px)"}}>
      <div className="pop-in" style={{background:T.surface,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:640,padding:"12px 0 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"0 0 8px"}}><div style={{width:40,height:4,borderRadius:2,background:"#DCDCDC"}}/></div>
        <div style={{padding:"0 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
            <div style={{fontWeight:800,fontSize:20,color:T.text}}>{list?.id?"Editar lista":"Nueva lista"}</div>
            <button className="btn" onClick={onClose} style={{background:T.surface2,borderRadius:"50%",width:36,height:36}}><X size={16}/></button>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:10}}>Ocasión</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {EVENTS.map(e=><PillBtn key={e} label={e} active={f.event===e} onClick={()=>set("event",e)}/>)}
            </div>
            {isOtro && (
              <input
                value={f.customEvent||""}
                onChange={e=>set("customEvent",e.target.value)}
                placeholder="Ej: Baby shower, despedida de soltera..."
                style={{...fs,marginTop:10,borderColor:f.customEvent?"#10B981":"#EBEBEB"}}
                autoFocus
              />
            )}
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:8}}>
              Fecha del evento <span style={{fontSize:11,fontWeight:400,color:T.muted}}>opcional</span>
            </label>
            <input type="date" value={f.date||""} onChange={e=>set("date",e.target.value)} style={fs}/>
          </div>
          <div style={{marginBottom:28}}>
            <label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:8}}>
              Mensaje para tus amigos <span style={{fontSize:11,fontWeight:400,color:T.muted}}>opcional</span>
            </label>
            <input value={f.message||""} onChange={e=>set("message",e.target.value)} placeholder="¡Este año quiero celebrar a lo grande! 🎉" style={fs}/>
          </div>
          <button className="btn" onClick={()=>onSave({...f, event:eventLabel})} style={{width:"100%",background:T.text,color:"white",borderRadius:12,padding:"16px",fontSize:16,fontWeight:700}}>
            {list?.id?"Guardar cambios":"Crear lista"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ SHARE MODAL ══ */
function ShareModal({ list, onClose }) {
  const origin = window.location.origin.includes("localhost") ? window.location.origin : "https://wannit.cl";
  const link = `${origin}/lista/${list.id}`;
  const [copied,setCopied] = useState(false);
  const [igCopied,setIgCopied] = useState(null);
  const ownerName = list.ownerName || "alguien especial";
  const waText = encodeURIComponent(`¡Hola! Te comparto la lista de regalos de ${ownerName} 🎁: ${link}`);

  const copyIg = (type) => {
    navigator.clipboard.writeText(link);
    setIgCopied(type);
    setTimeout(()=>setIgCopied(null), 2000);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:500,backdropFilter:"blur(4px)"}}>
      <div className="pop-in" style={{background:T.surface,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:640,maxHeight:"90vh",overflowY:"auto",padding:"12px 0 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"0 0 8px"}}><div style={{width:40,height:4,borderRadius:2,background:"#DCDCDC"}}/></div>
        <div style={{padding:"0 24px"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:40,marginBottom:8,animation:"floatY 2.5s ease-in-out infinite"}}>🎉</div>
            <div style={{fontWeight:800,fontSize:20,color:T.text}}>¡Comparte tu lista!</div>
            <div style={{color:T.muted,fontSize:14,marginTop:4}}>Mándale este link a tus amigos y familia</div>
          </div>

          <div style={{background:T.surface2,borderRadius:12,padding:"12px 14px",fontSize:12,color:T.muted,wordBreak:"break-all",marginBottom:16}}>{link}</div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>

            {/* 1. WhatsApp */}
            <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noreferrer" style={{
              background:"#25D366",color:"white",borderRadius:14,padding:"16px 12px",
              textDecoration:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:8,fontWeight:700,fontSize:14
            }}>
              <span style={{fontSize:28}}>💬</span>
              <div style={{textAlign:"center"}}>
                <div>WhatsApp</div>
                <div style={{fontSize:11,fontWeight:400,opacity:.85}}>Link prellenado</div>
              </div>
            </a>

            {/* 2. Instagram */}
            <button className="btn" onClick={()=>{
              if(navigator.share) {
                navigator.share({ title:"Lista de regalos 🎁", text:`¡Mira la lista de ${ownerName}!`, url:link }).catch(()=>{});
              } else {
                const el = document.createElement("textarea");
                el.value = link; el.style.position="fixed"; el.style.opacity="0";
                document.body.appendChild(el); el.focus(); el.select();
                document.execCommand("copy"); document.body.removeChild(el);
                setIgCopied("dm"); setTimeout(()=>setIgCopied(null), 2400);
              }
            }} style={{
              background:igCopied==="dm"?"#10B981":"linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)",
              color:"white",borderRadius:14,padding:"16px 12px",
              fontSize:14,fontWeight:700,flexDirection:"column",gap:8,border:"none",cursor:"pointer",
              transition:"background .3s",
            }}>
              <span style={{fontSize:28}}>{igCopied==="dm"?"✅":"📸"}</span>
              <div style={{textAlign:"center"}}>
                <div>{igCopied==="dm"?"¡Copiado!":"Instagram"}</div>
                <div style={{fontSize:11,fontWeight:400,opacity:.85}}>
                  {igCopied==="dm"?"Pégalo en tu DM":navigator.share?"Compartir por DM":"Copiar link"}
                </div>
              </div>
            </button>

            {/* 3. Email */}
            <a href={`mailto:?subject=Lista de regalos 🎁&body=¡Hola! Te comparto la lista de ${ownerName}: ${link}`} style={{
              background:T.accentL,color:T.accent,borderRadius:14,padding:"16px 12px",
              textDecoration:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:8,
              fontWeight:700,fontSize:14,border:`1px solid ${T.accent}30`
            }}>
              <span style={{fontSize:28}}>✉️</span>
              <div style={{textAlign:"center"}}>
                <div>Email</div>
                <div style={{fontSize:11,fontWeight:400,opacity:.8}}>Abre tu correo</div>
              </div>
            </a>

            {/* 4. Copiar link */}
            <button className="btn" onClick={()=>{navigator.clipboard.writeText(link);setCopied(true);setTimeout(()=>setCopied(false),2400);}} style={{
              background:copied?"#10B981":T.text,color:"white",borderRadius:14,
              padding:"16px 12px",fontSize:14,fontWeight:700,transition:"background .3s",
              flexDirection:"column",gap:8,border:"none",
            }}>
              <span style={{fontSize:28}}>{copied?"✅":"🔗"}</span>
              <div style={{textAlign:"center"}}>
                <div>{copied?"¡Copiado!":"Copiar link"}</div>
                <div style={{fontSize:11,fontWeight:400,opacity:.8}}>Para pegar donde quieras</div>
              </div>
            </button>
          </div>

          <button className="btn" onClick={onClose} style={{width:"100%",color:T.muted,fontSize:14,background:"none",textDecoration:"underline"}}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ══ OWNER CARD ══ */
function OwnerCard({ item, onEdit, onDelete }) {
  const pr = PRIORITIES[item.priority];
  const [lb,setLb] = useState(false);
  return (
    <>
      {lb && <Lightbox src={item.photo} onClose={()=>setLb(false)}/>}
      <div className="aircard pop-in">
        {item.photo ? (
          <div onClick={()=>setLb(true)} style={{height:160,cursor:"zoom-in",position:"relative",background:"#F0F0F0"}}>
            <img src={item.photo} alt="ref" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
        ) : (
          <div style={{height:80,background:`linear-gradient(135deg,${item.color}22,${item.color}08)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>{item.emoji}</div>
        )}
        <div style={{padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:4,lineHeight:1.3}}>{item.name}</div>
              {item.description && <div style={{fontSize:12,color:T.muted,marginBottom:6,fontStyle:"italic"}}>{item.description}</div>}
              {item.price>0 && <div style={{fontWeight:700,fontSize:15,color:T.text}}>{fmt(item.price)} CLP</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
              <button className="btn" onClick={()=>onEdit(item)} style={{background:T.surface2,borderRadius:8,padding:"7px 9px"}}><Pencil size={14}/></button>
              <button className="btn" onClick={()=>onDelete(item.id)} style={{background:"#FFF0F0",borderRadius:8,padding:"7px 9px"}}><Trash2 size={14} color="#EF4444"/></button>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,flexWrap:"wrap"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:4,background:T.accentL,color:T.accent,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>
              <Star size={10} fill={T.accent}/>{pr.short.split(" ").slice(1).join(" ")}
            </span>
            {item.taken && (
              <span style={{display:"inline-flex",alignItems:"center",gap:4,background:T.taken,color:T.takenT,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>
                <Lock size={10}/>Ya elegido
              </span>
            )}
          </div>
          {item.description && <div style={{marginTop:10,fontSize:13,color:T.sub,lineHeight:1.55,borderTop:"1px solid #EBEBEB",paddingTop:10,fontStyle:"italic"}}>"{item.description}"</div>}
          {item.notes && <div style={{marginTop:8,fontSize:12,color:T.muted,background:T.surface2,borderRadius:8,padding:"6px 10px"}}>💬 {item.notes}</div>}
          {item.link && (
            <a href={item.link} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:8,fontSize:13,color:T.accent,fontWeight:600,textDecoration:"none"}}>
              <ShoppingBag size={12}/>Ver en tienda
            </a>
          )}
        </div>
      </div>
    </>
  );
}

/* ══ LA SALITA ══ */
function GrupoBtn({ item, allItems=[] }) {
  const [open,setOpen] = useState(false);
  const [salitaCreada,setSalitaCreada] = useState(false);
  const [salitaLinkCopied,setSalitaLinkCopied] = useState(false);
  const salitaLink = `${window.location.origin}/salita/${item.id}`;
  const [selectedIds,setSelectedIds] = useState([item.id]);
  const [costos,setCostos] = useState({[item.id]: item.price||0});
  const [numPersonas,setNumPersonas] = useState(2);

  const pool = allItems.filter(i=>selectedIds.includes(i.id));
  const total = pool.reduce((s,i)=>s+(Number(costos[i.id])||0),0);
  const porPersona = numPersonas>0 ? Math.ceil(total/numPersonas) : 0;

  const toggleItem = (id) => {
    setSelectedIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  };

  if(!open) return (
    <button className="btn" onClick={()=>setOpen(true)} style={{
      marginTop:8,width:"100%",background:"#F5F3FF",color:"#7C3AED",
      border:"1.5px solid #DDD6FE",borderRadius:12,padding:"11px 14px",
      fontSize:13,fontWeight:700,justifyContent:"flex-start",gap:10
    }}>
      <span style={{fontSize:20}}>🏠</span>
      <span style={{flex:1,textAlign:"left"}}>La salita</span>
      <span style={{fontSize:11,fontWeight:400,color:"#A78BFA"}}>Regalar entre varios →</span>
    </button>
  );

  return (
    <div style={{marginTop:8,background:"white",borderRadius:16,border:"1.5px solid #DDD6FE",overflow:"hidden"}}>
      <div style={{background:"linear-gradient(135deg,#7C3AED,#6366F1)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>🏠</span>
          <div>
            <div style={{color:"white",fontWeight:700,fontSize:14}}>La salita</div>
            <div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>Solo lo ven los que tú invites 🤫</div>
          </div>
        </div>
        <button className="btn" onClick={()=>setOpen(false)} style={{background:"rgba(255,255,255,0.2)",borderRadius:"50%",width:28,height:28,color:"white"}}><X size={13}/></button>
      </div>

      <div style={{padding:14}}>
        {/* Paso 1: Elegir regalos */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7C3AED",marginBottom:8}}>🎁 ¿Qué van a regalar?</div>
          {allItems.map(i=>{
            const sel = selectedIds.includes(i.id);
            return (
              <div key={i.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:10,marginBottom:4,background:sel?"#F5F3FF":"#FAFAFA",border:`1.5px solid ${sel?"#DDD6FE":"#EBEBEB"}`,cursor:"pointer",transition:"all .15s"}}
                onClick={()=>toggleItem(i.id)}>
                <div style={{width:18,height:18,borderRadius:4,background:sel?"#7C3AED":"white",border:`2px solid ${sel?"#7C3AED":"#DCDCDC"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {sel && <Check size={11} color="white"/>}
                </div>
                <span style={{fontSize:13,flex:1,fontWeight:sel?600:400,color:sel?"#7C3AED":T.text}}>{i.emoji||"🎁"} {i.name}</span>
                {sel && (
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:11,color:"#9CA3AF"}}>$</span>
                    <input type="number" value={costos[i.id]||""} onChange={e=>{e.stopPropagation();setCostos(p=>({...p,[i.id]:e.target.value}));}}
                      onClick={e=>e.stopPropagation()}
                      placeholder="precio"
                      style={{width:70,border:"1px solid #DDD6FE",borderRadius:6,padding:"3px 6px",fontSize:12,color:"#7C3AED",fontWeight:600,fontFamily:"inherit",outline:"none"}}/>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Paso 2: Cuántos participan */}
        {selectedIds.length>0 && (
          <div style={{background:"#F5F3FF",borderRadius:12,padding:12,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:"#7C3AED",marginBottom:8}}>👥 ¿Cuántos participan?</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>setNumPersonas(p=>Math.max(1,p-1))} style={{width:32,height:32,borderRadius:"50%",border:"1.5px solid #DDD6FE",background:"white",fontSize:18,cursor:"pointer",color:"#7C3AED",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <span style={{fontWeight:800,fontSize:22,color:"#7C3AED",minWidth:32,textAlign:"center"}}>{numPersonas}</span>
              <button onClick={()=>setNumPersonas(p=>p+1)} style={{width:32,height:32,borderRadius:"50%",border:"1.5px solid #DDD6FE",background:"white",fontSize:18,cursor:"pointer",color:"#7C3AED",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              <span style={{fontSize:12,color:"#9CA3AF"}}>personas</span>
            </div>
            {total>0 && (
              <div style={{marginTop:10,background:"white",borderRadius:10,padding:"10px 12px",border:"1px solid #DDD6FE"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                  <span style={{color:"#9CA3AF"}}>Total estimado</span>
                  <span style={{fontWeight:700,color:"#7C3AED"}}>${total.toLocaleString("es-CL")}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:800}}>
                  <span style={{color:T.text}}>Cada uno pone</span>
                  <span style={{color:T.accent}}>${porPersona.toLocaleString("es-CL")}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Link salita */}
        <div style={{background:"#F5F3FF",borderRadius:12,padding:12}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7C3AED",marginBottom:8}}>🔗 Link secreto de la salita</div>
          {!salitaCreada ? (
            <button className="btn" onClick={()=>setSalitaCreada(true)} style={{width:"100%",background:"#7C3AED",color:"white",border:"none",borderRadius:10,padding:"11px",fontSize:13,fontWeight:700}}>
              Crear la salita →
            </button>
          ) : (
            <>
              <div style={{background:"white",borderRadius:8,padding:"7px 10px",fontSize:11,color:"#9CA3AF",marginBottom:8,wordBreak:"break-all"}}>{salitaLink}</div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn" onClick={()=>{setSalitaLinkCopied(true);navigator.clipboard.writeText(salitaLink);setTimeout(()=>setSalitaLinkCopied(false),2000);}} style={{flex:1,background:salitaLinkCopied?"#10B981":"#7C3AED",color:"white",border:"none",borderRadius:8,padding:"9px",fontSize:12,fontWeight:700,transition:"background .3s"}}>
                  {salitaLinkCopied?"✅ Copiado":"📋 Copiar link"}
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent("¡Únete a la salita! "+salitaLink)}`} target="_blank" rel="noreferrer" style={{flex:1,background:"#25D366",color:"white",border:"none",borderRadius:8,padding:"9px",fontSize:12,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                  💬 Invitar por WA
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


/* ══ QUESTION BOX — Mejora 8 ══ */
function QuestionBox({ item, ownerName }) {
  const [open,setOpen] = useState(false);
  const [question,setQuestion] = useState("");
  const [sent,setSent] = useState(false);

  const fsQ = {width:"100%",border:"1.5px solid #EBEBEB",borderRadius:10,padding:"10px 14px",fontSize:13,background:"#FFFFFF",color:"#222222",fontFamily:"inherit",boxSizing:"border-box",outline:"none"};

  const send = async () => {
    if(!question.trim()) return;
    await sendEmail("item_question", item.ownerEmail||"", {
      itemName:item.name, listName:item.listName||"",
      question:question.trim(), askerName:"Alguien",
    });
    setSent(true);
  };

  if(sent) return (
    <div className="fade-up" style={{marginTop:8,background:"#F0FFF4",border:"1px solid #86efac",borderRadius:12,padding:12,color:"#276749",fontWeight:600,fontSize:13}}>
      ✅ ¡Pregunta enviada! {ownerName} te responderá 💌
    </div>
  );

  if(!open) return (
    <button className="btn" onClick={()=>setOpen(true)} style={{
      marginTop:8,background:"white",border:"1.5px dashed #DCDCDC",borderRadius:12,
      padding:"10px 14px",width:"100%",fontSize:13,color:T.muted,
      justifyContent:"flex-start",gap:8,fontWeight:500
    }}>
      <span style={{fontSize:18}}>💬</span>
      <span>¿Tienes dudas? <strong style={{color:T.text}}>¡Pregúntale a {ownerName}!</strong></span>
      <span style={{marginLeft:"auto"}}>→</span>
    </button>
  );

  return (
    <div className="fade-up" style={{marginTop:8,background:"white",border:"1.5px solid #EBEBEB",borderRadius:12,padding:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <span style={{fontSize:20}}>💬</span>
        <div>
          <div style={{fontWeight:700,fontSize:13}}>¡Pregúntale a {ownerName}!</div>
          <div style={{fontSize:11,color:T.muted}}>Sobre "{item.name}"</div>
        </div>
        <button className="btn" onClick={()=>setOpen(false)} style={{marginLeft:"auto",background:"none",color:T.muted}}>✕</button>
      </div>
      <textarea value={question} onChange={e=>setQuestion(e.target.value)}
        placeholder="Ej: ¿En qué talla? ¿Prefieres algún color? 🎨"
        rows={2} style={{...fsQ,resize:"none",lineHeight:1.5,marginBottom:8}}/>
      <button className="btn" onClick={send} style={{width:"100%",background:T.text,color:"white",border:"none",borderRadius:10,padding:"11px",fontSize:13,fontWeight:700}}>
        Enviar pregunta 💌
      </button>
    </div>
  );
}

/* ══ FRIEND CARD ══ */
function FriendCard({ item, onTake, ownerName="", allItems=[] }) {
  const [step,setStep] = useState("idle");
  const [lb,setLb] = useState(false);
  const pr = PRIORITIES[item.priority];

  useEffect(()=>{
    if(!item.taken) setStep("idle");
  },[item.taken]);
  return (
    <>
      {lb && <Lightbox src={item.photo} onClose={()=>setLb(false)}/>}
      <div className="aircard pop-in" style={{opacity:item.taken?0.65:1}}>
        {item.photo && !item.taken ? (
          <div onClick={()=>setLb(true)} style={{height:160,cursor:"zoom-in",position:"relative",background:"#F0F0F0"}}>
            <img src={item.photo} alt="ref" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
        ) : (
          <div style={{height:80,background:item.taken?"#F5F5F5":`linear-gradient(135deg,${item.color}22,${item.color}08)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,filter:item.taken?"grayscale(1)":"none"}}>{item.emoji}</div>
        )}
        <div style={{padding:16}}>
          {item.taken && (
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:T.taken,color:T.takenT,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600}}>
                <Lock size={11}/>Adjudicado
              </div>
              <button className="btn" onClick={()=>onTake(item.id,null)} style={{background:"#FFF7ED",color:"#C2410C",border:"1px solid #FED7AA",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,gap:4}}>
                ↩ Deshacer
              </button>
            </div>
          )}
          <div style={{fontWeight:700,fontSize:15,color:item.taken?T.muted:T.text,textDecoration:item.taken?"line-through":"none",marginBottom:4}}>{item.name}</div>
          {item.description && <div style={{fontSize:12,color:T.muted,marginBottom:6,fontStyle:"italic"}}>{item.description}</div>}
          {!item.taken && item.price>0 && <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:8}}>{fmt(item.price)} CLP</div>}
          {!item.taken && step==="idle" && (
            <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
              <button className="btn" onClick={()=>{onTake(item.id,"anónimo");setStep("done");}} style={{flex:1,background:T.accent,color:"white",borderRadius:10,padding:"12px",fontSize:14,fontWeight:700}}>
                <Gift size={15}/>Quiero regalar esto
              </button>
              {item.link && (
                <a href={item.link} target="_blank" rel="noreferrer" style={{flex:1,background:T.surface2,color:T.text,border:"1px solid #EBEBEB",borderRadius:10,padding:"12px",textDecoration:"none",fontWeight:600,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <ShoppingBag size={15}/>Ver en tienda
                </a>
              )}
            </div>
          )}
          {!item.taken && step==="idle" && (
            <GrupoBtn item={item} allItems={allItems}/>
          )}
          {step==="done" && (
            <div className="fade-up" style={{marginTop:14,background:T.surface2,borderRadius:16,padding:16,border:"1px solid #EBEBEB"}}>
              <div style={{fontWeight:700,color:T.text,fontSize:15,marginBottom:8}}>¡Anotado como tuyo! 🎉</div>
              {item.link && (
                <a href={item.link} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:T.text,color:"white",borderRadius:12,padding:"14px",textDecoration:"none",fontWeight:700,fontSize:14}}>
                  <ShoppingBag size={16}/>Ir a comprarlo
                </a>
              )}
            </div>
          )}
          {/* Mejora 8 — Pregunta al dueño */}
          {!item.taken && step !== "name" && (
            <QuestionBox item={item} ownerName={ownerName}/>
          )}
        </div>
      </div>
    </>
  );
}

/* ══ LISTS SCREEN ══ */
function ListsScreen({ lists, user, onSelect, onNew, onEdit, onDelete, onLogout }) {
  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <nav style={{background:T.surface,borderBottom:"1px solid #EBEBEB",position:"sticky",top:0,zIndex:40}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:72}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Logo size={36}/>
            <span style={{fontWeight:800,fontSize:20,color:T.accent,letterSpacing:"-0.5px"}}>wannit</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10,border:"1px solid #DCDCDC",borderRadius:30,padding:"8px 12px 8px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
              {user.photoURL && <img src={user.photoURL} alt="" style={{width:30,height:30,borderRadius:"50%"}}/>}
              <span style={{fontSize:13,fontWeight:600,color:T.text}}>{user.displayName?.split(" ")[0]}</span>
            </div>
            <button className="btn" onClick={onLogout} style={{background:"none",color:T.muted,fontSize:13,fontWeight:500}}>Salir</button>
          </div>
        </div>
      </nav>
      <div style={{maxWidth:960,margin:"0 auto",padding:"40px 24px"}}>
        <div style={{marginBottom:32}}>
          <h1 style={{fontWeight:800,fontSize:32,color:T.text,marginBottom:6}}>Mis listas</h1>
          <p style={{color:T.muted,fontSize:16}}>Crea una lista para cada evento y compártela con quien quieras</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:24,marginBottom:32}}>
          {lists.map((list,i)=>{
            const taken = list.items?.filter(it=>it.taken).length || 0;
            const total = list.items?.length || 0;
            const pct = total ? Math.round(taken/total*100) : 0;
            const color = ["#FF385C","#6366F1","#10B981","#F59E0B"][i%4];
            return (
              <div key={list.id} className="aircard" style={{cursor:"pointer"}} onClick={()=>onSelect(list.id)}>
                <div style={{height:160,background:`linear-gradient(135deg,${color}33,${color}11)`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                  <div style={{fontSize:52,animation:"floatY 3s ease-in-out infinite"}}>{list.event.split(" ")[0]}</div>
                  <div style={{position:"absolute",top:10,right:10,display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
                    <button className="btn" onClick={()=>onEdit(list)} style={{background:"rgba(255,255,255,0.9)",borderRadius:8,padding:"5px 7px"}}><Settings size={13}/></button>
                    <button className="btn" onClick={()=>onDelete(list.id)} style={{background:"rgba(255,255,255,0.9)",borderRadius:8,padding:"5px 7px"}}><Trash2 size={13} color="#EF4444"/></button>
                  </div>
                </div>
                <div style={{padding:"14px 16px 16px"}}>
                  <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:2}}>{list.event}</div>
                  {list.date && <div style={{fontSize:13,color:T.muted,marginBottom:8}}>{fmtDate(list.date)}</div>}
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{flex:1,background:T.surface2,borderRadius:20,height:4,overflow:"hidden"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:20,transition:"width .5s"}}/>
                    </div>
                    <span style={{fontSize:12,color:T.muted,fontWeight:500,flexShrink:0}}>{taken}/{total} elegidos</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="aircard" style={{cursor:"pointer",border:"2px dashed #DCDCDC",boxShadow:"none",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:220,gap:12}} onClick={onNew}>
            <div style={{width:48,height:48,borderRadius:"50%",background:T.accentL,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <PlusCircle size={24} color={T.accent}/>
            </div>
            <div style={{fontWeight:700,fontSize:15,color:T.accent}}>Nueva lista</div>
            <div style={{fontSize:13,color:T.muted,textAlign:"center",padding:"0 20px"}}>Para cumpleaños, Navidad, Día de la Madre...</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ LIST DETAIL ══ */
function ListDetail({ list, user, onBack, onUpdateItems, viewMode, setViewMode }) {
  const ownerName = list.ownerName || user?.displayName?.split(" ")[0] || "el dueño";
  const [items,setItems] = useState(list.items||[]);
  const [modal,setModal] = useState(null);
  const [editItem,setEditItem] = useState(null);
  const [shareOpen,setShareOpen] = useState(false);
  const [filterP,setFilterP] = useState("todo");
  const [sortBy,setSortBy] = useState("priority");
  const [confetti,setConfetti] = useState(false);

  const burst = () => { setConfetti(true); setTimeout(()=>setConfetti(false),1400); };

  const [showSummaryBtn, setShowSummaryBtn] = useState(false);
  const [summarySent, setSummarySent] = useState(false);

  const saveItem = async item => {
    const updated = items.find(i=>i.id===item.id)
      ? items.map(i=>i.id===item.id?item:i)
      : [...items,item];
    setItems(updated);
    await onUpdateItems(list.id, updated);
    setModal(null); setEditItem(null); burst();
    setShowSummaryBtn(true); setSummarySent(false);
    setTimeout(()=>setShowSummaryBtn(false), 8000);
  };

  const sendSummary = async () => {
    if(!user?.email) return;
    await sendEmail("list_summary", user.email, { listName: list.event, items });
    setSummarySent(true); setShowSummaryBtn(false);
  };

  const deleteItem = async id => {
    const updated = items.filter(i=>i.id!==id);
    setItems(updated);
    await onUpdateItems(list.id, updated);
  };

  const takeItem = async (id,by) => {
    const updated = by === null
      ? items.map(i=>i.id===id?{...i,taken:false,takenBy:""}:i)
      : items.map(i=>i.id===id?{...i,taken:true,takenBy:by}:i);
    setItems(updated);
    await onUpdateItems(list.id, updated);
    if(by !== null) {
      burst();
      if(updated.length > 0 && updated.every(i=>i.taken) && user?.email) {
        await sendEmail("list_complete", user.email, { listName: list.event });
      }
    }
  };

  const filtered = items
    .filter(i=>{
      if(filterP==="u50" && i.price>=50000) return false;
      if(filterP==="m50" && (i.price<50000||i.price>100000)) return false;
      if(filterP==="o100" && i.price<=100000) return false;
      return true;
    })
    .sort((a,b)=>sortBy==="priority"?a.priority-b.priority:b.price-a.price);

  const isShared = viewMode==="shared";
  const stats = { total:items.length, taken:items.filter(i=>i.taken).length };
  const pct = stats.total ? Math.round(stats.taken/stats.total*100) : 0;

  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <Confetti active={confetti}/>
      {showSummaryBtn && (
        <div style={{position:"fixed",bottom:160,left:"50%",transform:"translateX(-50%)",zIndex:200,background:"white",border:"1px solid #EBEBEB",borderRadius:16,padding:"12px 20px",boxShadow:"0 8px 30px rgba(0,0,0,0.12)",display:"flex",alignItems:"center",gap:12,maxWidth:400,width:"calc(100% - 48px)"}}>
          <span style={{fontSize:18}}>📬</span>
          <span style={{fontSize:13,color:T.text,flex:1}}>¿Quieres un resumen actualizado?</span>
          <button className="btn" onClick={sendSummary} style={{background:T.accent,color:"white",borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:700}}>Enviar</button>
        </div>
      )}
      {summarySent && (
        <div style={{position:"fixed",bottom:160,left:"50%",transform:"translateX(-50%)",zIndex:200,background:"#F0FFF4",border:"1px solid #86efac",borderRadius:16,padding:"12px 20px",boxShadow:"0 8px 30px rgba(0,0,0,0.08)",color:"#276749",fontWeight:600,fontSize:13}}>
          ✅ Resumen enviado a tu email
        </div>
      )}
      <nav style={{background:T.surface,borderBottom:"1px solid #EBEBEB",position:"sticky",top:0,zIndex:40}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",gap:14,height:72}}>
          <button className="btn" onClick={onBack} style={{background:T.surface2,borderRadius:"50%",width:38,height:38}}><ArrowLeft size={18}/></button>
          <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
            <Logo size={30}/>
            <span style={{fontWeight:800,fontSize:18,color:T.accent}}>wannit</span>
          </div>
          <div style={{display:"flex",background:T.surface2,borderRadius:30,padding:4,gap:4}}>
            {[["owner","👤 Mi lista"],["shared","👀 Vista amigos"]].map(([v,label])=>(
              <button key={v} className="btn" onClick={()=>setViewMode(v)} style={{
                background:viewMode===v?T.surface:"transparent",
                color:viewMode===v?T.text:T.muted,
                border:viewMode===v?"1px solid #EBEBEB":"1px solid transparent",
                borderRadius:24, padding:"7px 14px", fontSize:12, fontWeight:600,
                boxShadow:viewMode===v?"0 1px 4px rgba(0,0,0,0.08)":"none",
              }}>{label}</button>
            ))}
          </div>

        </div>
      </nav>
      <div style={{background:T.surface,borderBottom:"1px solid #EBEBEB"}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"28px 24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{fontSize:32}}>{list.event.split(" ")[0]}</div>
            <div>
              <h2 style={{fontWeight:800,fontSize:20,color:T.text}}>
                Lista de <span style={{color:T.accent}}>{list.event.replace(/^[\p{Emoji}\s]+/u,"").trim().toLowerCase()}</span> de <span style={{color:T.accent}}>{ownerName}</span>
              </h2>
              {list.date && <div style={{fontSize:13,color:T.muted,display:"flex",alignItems:"center",gap:5,marginTop:2}}><Calendar size={12}/>{fmtDate(list.date)}</div>}
            </div>
          </div>
          {list.message && <p style={{marginTop:14,fontSize:15,color:T.sub,lineHeight:1.6,fontStyle:"italic",borderTop:"1px solid #EBEBEB",paddingTop:14}}>"{list.message}"</p>}
        </div>
      </div>
      <div style={{background:T.surface,borderBottom:"1px solid #EBEBEB",position:"sticky",top:72,zIndex:30}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"12px 24px",display:"flex",gap:8,alignItems:"center",overflowX:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginRight:8,flexShrink:0}}>
            <div style={{width:36,background:T.surface2,borderRadius:20,height:5,overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",background:T.accent,borderRadius:20,transition:"width .5s"}}/>
            </div>
            <span style={{fontSize:12,color:T.muted,fontWeight:500,flexShrink:0}}>{stats.taken}/{stats.total}</span>
          </div>
          {PRANGES.map(([v,l])=><PillBtn key={v} label={l} active={filterP===v} onClick={()=>setFilterP(v)}/>)}
          <div style={{width:1,height:24,background:"#EBEBEB",flexShrink:0}}/>
          {[["priority","Prioridad"],["price","Precio"]].map(([v,l])=><PillBtn key={v} label={l} active={sortBy===v} onClick={()=>setSortBy(v)}/>)}
        </div>
      </div>
      <div style={{maxWidth:960,margin:"0 auto",padding:"28px 24px 100px"}}>
        {filtered.length===0 && (
          <div style={{textAlign:"center",padding:"80px 20px"}}>
            <div style={{fontSize:56,animation:"floatY 2.5s ease-in-out infinite",marginBottom:16}}>🎁</div>
            <div style={{fontWeight:700,fontSize:20,color:T.text,marginBottom:8}}>Nada acá todavía</div>
            {!isShared && <div style={{fontSize:15,color:T.muted}}>Agrega tu primer deseo con el botón de abajo</div>}
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}}>
          {filtered.map((item,i)=>(
            <div key={item.id} style={{animationDelay:`${i*.05}s`}}>
              {isShared
                ? <FriendCard item={item} onTake={takeItem} ownerName={ownerName} allItems={items}/>
                : <OwnerCard item={item} onEdit={it=>{setEditItem(it);setModal("edit");}} onDelete={deleteItem}/>
              }
            </div>
          ))}
        </div>
      </div>
      {!isShared && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,padding:"16px 24px 32px",background:"linear-gradient(transparent,rgba(255,255,255,0.97) 35%)",display:"flex",flexDirection:"column",alignItems:"center",gap:10,pointerEvents:"none"}}>
          <button className="btn" onClick={()=>setShareOpen(true)} style={{
            background:T.accent,color:"white",borderRadius:30,padding:"16px 36px",
            fontSize:16,fontWeight:800,boxShadow:"0 8px 28px rgba(255,56,92,0.45)",
            pointerEvents:"all",width:"100%",maxWidth:420,
          }}><Share2 size={18}/>Compartir mi lista</button>
          <button className="btn" onClick={()=>{setEditItem(null);setModal("add");}} style={{
            background:T.text,color:"white",borderRadius:30,padding:"13px 28px",
            fontSize:14,fontWeight:700,boxShadow:"0 4px 16px rgba(0,0,0,0.2)",
            pointerEvents:"all",
          }}><Plus size={16}/>Agregar deseo</button>
        </div>
      )}
      {modal==="add"  && <ItemModal item={null} onSave={saveItem} onClose={()=>setModal(null)}/>}
      {modal==="edit" && <ItemModal item={editItem} onSave={saveItem} onClose={()=>{setModal(null);setEditItem(null);}}/>}
      {shareOpen && <ShareModal list={list} onClose={()=>setShareOpen(false)}/>}
    </div>
  );
}

/* ══ LANDING ══ */
function Landing({ onLogin }) {
  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <nav style={{background:T.surface,borderBottom:"1px solid #EBEBEB",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:72,position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Logo size={34}/>
          <span style={{fontWeight:800,fontSize:20,color:T.accent,letterSpacing:"-0.5px"}}>wannit</span>
        </div>
        <GBtn onClick={onLogin} label="Entrar" small/>
      </nav>
      <div style={{background:"linear-gradient(160deg,#FFF1F2 0%,#FFFFFF 40%,#EEF2FF 100%)",padding:"80px 24px 72px",textAlign:"center"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"white",border:"1px solid #EBEBEB",borderRadius:30,padding:"6px 16px",fontSize:13,fontWeight:600,color:T.sub,marginBottom:24,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <span>🇨🇱</span> Hecho en Chile · Gratis para siempre
          </div>
          <h1 style={{fontWeight:800,fontSize:"clamp(32px,6vw,52px)",color:T.text,lineHeight:1.08,marginBottom:20}}>
            Di lo que quieres.<br/>Recibe lo que quieres.<br/>
            <span style={{color:T.accent}}>Wannit.</span>
          </h1>
          <p style={{fontSize:18,color:T.muted,maxWidth:440,margin:"0 auto 36px",lineHeight:1.6}}>
            Arma tu wishlist, compártela con quien quieras y recibe exactamente lo que quieres.
          </p>
          <GBtn onClick={onLogin} label="Crear mi lista — es gratis"/>
          <div style={{fontSize:12,color:T.light,marginTop:12}}>Solo tu cuenta Google · Sin tarjeta · Sin contraseñas</div>
        </div>
      </div>
      <div style={{maxWidth:960,margin:"0 auto",padding:"72px 24px"}}>
        <h2 style={{fontWeight:800,fontSize:28,color:T.text,textAlign:"center",marginBottom:48}}>¿Cómo funciona?</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:32}}>
          {[
            {emoji:"🎁",title:"Arma tu lista",text:"Agrega lo que quieres con foto, precio y link."},
            {emoji:"🔗",title:"Comparte el link",text:"Un link directo. Tus amigos lo abren sin instalar nada."},
            {emoji:"🔒",title:"Sin spoilers",text:"Tus amigos marcan su regalo en secreto."},
            {emoji:"🤝",title:"Coordínense",text:"Varios amigos pueden juntarse para regalar algo más grande."},
          ].map((f,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontSize:44,marginBottom:16,animation:`floatY ${2.5+i*.3}s ease-in-out infinite`}}>{f.emoji}</div>
              <div style={{fontWeight:700,fontSize:17,color:T.text,marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:14,color:T.muted,lineHeight:1.65}}>{f.text}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"linear-gradient(160deg,#FFF1F2,#EEF2FF)",padding:"80px 24px",textAlign:"center"}}>
        <h2 style={{fontWeight:800,fontSize:28,color:T.text,marginBottom:10}}>¿Lista para pedir lo que quieres?</h2>
        <p style={{color:T.muted,fontSize:16,marginBottom:32}}>Lo quieres, lo tienes.</p>
        <GBtn onClick={onLogin} label="Crear mi lista con Google →"/>
      </div>
      <div style={{borderTop:"1px solid #EBEBEB",padding:"28px 24px"}}>
        <div style={{maxWidth:960,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><Logo size={24}/><span style={{fontWeight:700,fontSize:15,color:T.accent}}>wannit</span></div>
          <p style={{fontSize:13,color:T.muted,maxWidth:420,lineHeight:1.6}}>
            🐦 Anita se aburrió de recibir lo que no quería. Creó wannit para que tus amigos siempre sepan exactamente qué regalarte.
          </p>
          <span style={{fontSize:12,color:T.light}}>Hecho con ❤️ en Chile · {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}

/* ══ ROOT ══ */
function SharedListPage() {
  const { listId } = useParams();
  const [list,setList] = useState(null);
  const [loading,setLoading] = useState(true);
  const [notFound,setNotFound] = useState(false);
  const [filterP,setFilterP] = useState("todo");
  const [confetti,setConfetti] = useState(false);

  useEffect(()=>{
    getDoc(doc(db,"lists",listId)).then(snap=>{
      if(!snap.exists()){setNotFound(true);setLoading(false);return;}
      setList({id:snap.id,...snap.data()});
      setLoading(false);
    }).catch(()=>{setNotFound(true);setLoading(false);});
  },[listId]);

  const takeItem = async (id,by) => {
    const updated = by === null
      ? list.items.map(i=>i.id===id?{...i,taken:false,takenBy:""}:i)
      : list.items.map(i=>i.id===id?{...i,taken:true,takenBy:by}:i);
    await updateDoc(doc(db,"lists",listId),{items:updated});
    setList(prev=>({...prev,items:updated}));
    if(by !== null) { setConfetti(true); setTimeout(()=>setConfetti(false),1400); }
  };

  if(loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg}}>
      <div style={{textAlign:"center"}}><Logo size={56}/><div style={{marginTop:16,fontSize:16,color:T.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Cargando...</div></div>
    </div>
  );

  if(notFound) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg}}>
      <div style={{textAlign:"center",padding:24}}>
        <div style={{fontSize:64,marginBottom:16}}>🎁</div>
        <div style={{fontWeight:800,fontSize:24,color:T.text,marginBottom:8}}>Lista no encontrada</div>
        <div style={{color:T.muted,fontSize:15}}>El link puede haber expirado o estar incorrecto.</div>
      </div>
    </div>
  );

  const filtered = (list.items||[]).filter(i=>{
    if(filterP==="u50"&&i.price>=50000) return false;
    if(filterP==="m50"&&(i.price<50000||i.price>100000)) return false;
    if(filterP==="o100"&&i.price<=100000) return false;
    return true;
  });

  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <Confetti active={confetti}/>
      {showSummaryBtn && (
        <div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",zIndex:200,background:"white",border:"1px solid #EBEBEB",borderRadius:16,padding:"12px 20px",boxShadow:"0 8px 30px rgba(0,0,0,0.12)",display:"flex",alignItems:"center",gap:12,maxWidth:400,width:"calc(100% - 48px)"}}>
          <span style={{fontSize:18}}>📬</span>
          <span style={{fontSize:13,color:T.text,flex:1}}>¿Quieres un resumen actualizado?</span>
          <button className="btn" onClick={sendSummary} style={{background:T.accent,color:"white",borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:700}}>Enviar</button>
        </div>
      )}
      {summarySent && (
        <div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",zIndex:200,background:"#F0FFF4",border:"1px solid #86efac",borderRadius:16,padding:"12px 20px",boxShadow:"0 8px 30px rgba(0,0,0,0.08)",color:"#276749",fontWeight:600,fontSize:13}}>
          ✅ Resumen enviado a tu email
        </div>
      )}
      <nav style={{background:T.surface,borderBottom:"1px solid #EBEBEB",position:"sticky",top:0,zIndex:40}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",gap:8,height:72}}>
          <Logo size={30}/>
          <span style={{fontWeight:800,fontSize:18,color:T.accent}}>wannit</span>
        </div>
      </nav>
      <div style={{background:"linear-gradient(160deg,#FFF1F2 0%,#FFFFFF 60%)",borderBottom:"1px solid #EBEBEB"}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"32px 24px 24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
            <div style={{width:64,height:64,borderRadius:20,background:"linear-gradient(135deg,#FF385C,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,animation:"floatY 3s ease-in-out infinite",boxShadow:"0 8px 24px rgba(255,56,92,0.25)",flexShrink:0}}>
              {list.event.split(" ")[0]}
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:T.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{list.event}</div>
              <h1 style={{fontWeight:800,fontSize:"clamp(20px,5vw,28px)",color:T.text,lineHeight:1.1,marginBottom:4}}>
                Lista de <span style={{color:T.accent}}>{list.event.replace(/^[\p{Emoji}\s]+/u,"").trim().toLowerCase()}</span> de <span style={{color:T.accent}}>{list.ownerName||"alguien"}</span> 🎁
              </h1>
              {list.date && <div style={{fontSize:13,color:T.muted,display:"flex",alignItems:"center",gap:5}}><Calendar size={12}/>{fmtDate(list.date)}</div>}
            </div>
          </div>
          {list.message && (
            <div style={{background:"white",borderRadius:14,padding:"12px 16px",border:"1px solid #EBEBEB",fontSize:14,color:T.sub,lineHeight:1.6,fontStyle:"italic"}}>
              💬 "{list.message}"
            </div>
          )}
        </div>
      </div>
      <div style={{background:T.surface,borderBottom:"1px solid #EBEBEB",position:"sticky",top:72,zIndex:30}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"12px 24px",display:"flex",gap:8,overflowX:"auto"}}>
          {PRANGES.map(([v,l])=><PillBtn key={v} label={l} active={filterP===v} onClick={()=>setFilterP(v)}/>)}
        </div>
      </div>
      <div style={{maxWidth:960,margin:"0 auto",padding:"28px 24px 100px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}}>
          {filtered.map((item,i)=>(
            <div key={item.id} style={{animationDelay:`${i*.05}s`}}>
              <FriendCard item={item} onTake={takeItem} ownerName={list.ownerName||"el dueño"} allItems={list.items||[]}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WannitApp() {
  useEffect(()=>{ injectStyles(); },[]);
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);
  const [lists,setLists] = useState([]);
  const [activeId,setActiveId] = useState(null);
  const [listModal,setListModal] = useState(null);
  const [viewMode,setViewMode] = useState("owner");

  // Auth listener
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  },[]);

  // Firestore listener
  useEffect(()=>{
    if (!user) return;
    const q = query(collection(db,"lists"), where("uid","==",user.uid));
    const unsub = onSnapshot(q, snap => {
      setLists(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return unsub;
  },[user]);

  const handleLogin = () => {
    signInWithPopup(auth, provider).catch(e => console.error(e));
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setActiveId(null);
  };

  const createList = async (data) => {
    const docRef = await addDoc(collection(db,"lists"), {
      ...data, uid:user.uid, items:[], createdAt:Date.now(),
      ownerName: user.displayName?.split(" ")[0] || user.displayName || "alguien",
      ownerEmail: user.email
    });
    // Mejora 1 — correo automático al crear lista
    await sendEmail("list_created", user.email, {
      listName: data.event,
      ownerName: user.displayName?.split(" ")[0] || "ahí",
      eventDate: data.date || null,
    });
    setListModal(null);
  };

  const updateList = async (id, data) => {
    await updateDoc(doc(db,"lists",id), data);
    setListModal(null);
  };

  const deleteList = async (id) => {
    await deleteDoc(doc(db,"lists",id));
  };

  const updateItems = async (listId, items) => {
    await updateDoc(doc(db,"lists",listId), { items });
  };

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg}}>
      <div style={{textAlign:"center"}}>
        <Logo size={56}/>
        <div style={{marginTop:16,fontSize:16,color:T.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Cargando...</div>
      </div>
    </div>
  );

  if (!user) return (
    <Landing onLogin={handleLogin}/>
  );

  const activeList = lists.find(l=>l.id===activeId);

  if (activeList) return (
    <ListDetail
      list={activeList} user={user}
      viewMode={viewMode} setViewMode={setViewMode}
      onBack={()=>{ setActiveId(null); setViewMode("owner"); }}
      onUpdateItems={updateItems}
    />
  );

  return (
    <>
      <ListsScreen
        lists={lists} user={user}
        onSelect={id=>setActiveId(id)}
        onNew={()=>setListModal("new")}
        onEdit={list=>setListModal(list)}
        onDelete={deleteList}
        onLogout={handleLogout}
      />
      {listModal==="new" && <ListModal onSave={createList} onClose={()=>setListModal(null)}/>}
      {listModal && listModal!=="new" && (
        <ListModal list={listModal} onSave={data=>updateList(listModal.id,data)} onClose={()=>setListModal(null)}/>
      )}
    </>
  );
}

function AppWithRouter() {
  useEffect(()=>{ injectStyles(); },[]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/lista/:listId" element={<SharedListPage/>}/>
        <Route path="/*" element={<WannitApp/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export { AppWithRouter };
export default AppWithRouter;

/* ══ EMAIL HELPER ══ */
const sendEmail = async (type, to, data) => {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, to, data }),
    });
  } catch(e) { console.error("Email error:", e); }
};
