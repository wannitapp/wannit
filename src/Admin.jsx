import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAIL = "gvarasm@gmail.com";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "lists"), (snap) => {
      setLists(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  if (!user) {
    return <div style={{padding:40, fontFamily:"sans-serif"}}>Cargando...</div>;
  }
  if (user.email !== ADMIN_EMAIL) {
    return <div style={{padding:40, fontFamily:"sans-serif"}}>403 — acceso denegado</div>;
  }

  const totalItems = lists.reduce((acc, l) => acc + (l.items?.length || 0), 0);
  const users = [...new Set(lists.map((l) => l.uid))];

  return (
    <div style={{padding:32, fontFamily:"sans-serif", maxWidth:800, margin:"0 auto"}}>
      <h1 style={{fontSize:24, fontWeight:700, marginBottom:24}}>wannit admin 🎁</h1>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:32}}>
        {[["usuarios", users.length], ["listas", lists.length], ["items totales", totalItems]].map(([label, val]) => (
          <div key={label} style={{background:"#FFF1F2", borderRadius:16, padding:20, textAlign:"center"}}>
            <div style={{fontSize:36, fontWeight:800, color:"#FF385C"}}>{val}</div>
            <div style={{fontSize:13, color:"#484848", marginTop:4}}>{label}</div>
          </div>
        ))}
      </div>
      <h2 style={{fontSize:16, fontWeight:600, marginBottom:12}}>listas recientes</h2>
      <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
        <thead>
          <tr style={{borderBottom:"2px solid #EBEBEB", textAlign:"left"}}>
            <th style={{padding:"8px 12px"}}>nombre</th>
            <th style={{padding:"8px 12px"}}>items</th>
            <th style={{padding:"8px 12px"}}>creada</th>
          </tr>
        </thead>
        <tbody>
          {lists.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0)).map((l) => (
            <tr key={l.id} style={{borderBottom:"1px solid #EBEBEB"}}>
              <td style={{padding:"8px 12px"}}>{l.title || l.name || l.listName || "sin nombre"}</td>
              <td style={{padding:"8px 12px"}}>{l.items?.length || 0}</td>
              <td style={{padding:"8px 12px"}}>{l.createdAt ? new Date(typeof l.createdAt === "number" ? l.createdAt : l.createdAt.seconds*1000).toLocaleDateString("es-CL") : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}