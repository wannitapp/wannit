export default function Privacy() {
  return (
    <div style={{maxWidth:680,margin:"0 auto",padding:"60px 24px",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#222222",lineHeight:1.7}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:40}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
          <svg width="32" height="32" viewBox="0 0 120 120" fill="none">
            <rect width="120" height="120" rx="20" fill="#FF385C"/>
            <rect x="20" y="68" width="80" height="40" rx="6" fill="white" opacity=".9"/>
            <rect x="14" y="55" width="92" height="17" rx="6" fill="white"/>
            <rect x="54" y="55" width="12" height="53" rx="4" fill="#FF385C"/>
            <rect x="14" y="60" width="92" height="8" rx="3" fill="#FF385C"/>
            <path d="M60 55 C53 37 28 29 24 43 C20 55 36 60 60 55Z" fill="white"/>
            <path d="M60 55 C67 37 92 29 96 43 C100 55 84 60 60 55Z" fill="white" opacity=".85"/>
            <circle cx="60" cy="55" r="7" fill="#FF385C"/>
            <circle cx="60" cy="55" r="3.5" fill="white"/>
          </svg>
          <span style={{fontWeight:800,fontSize:20,color:"#FF385C"}}>wannit</span>
        </a>
      </div>

      <h1 style={{fontWeight:800,fontSize:32,marginBottom:8}}>Política de Privacidad</h1>
      <p style={{color:"#717171",marginBottom:40}}>Última actualización: {new Date().toLocaleDateString("es-CL",{day:"numeric",month:"long",year:"numeric"})}</p>

      <h2 style={{fontWeight:700,fontSize:20,marginBottom:12}}>1. ¿Qué es wannit?</h2>
      <p style={{marginBottom:24}}>wannit es una plataforma chilena de listas de deseos que permite a los usuarios crear y compartir listas de regalos con amigos y familia. El servicio está disponible en wannit.cl.</p>

      <h2 style={{fontWeight:700,fontSize:20,marginBottom:12}}>2. Información que recopilamos</h2>
      <p style={{marginBottom:12}}>Cuando usas wannit, recopilamos la siguiente información:</p>
      <ul style={{paddingLeft:24,marginBottom:24}}>
        <li style={{marginBottom:8}}><strong>Información de cuenta:</strong> nombre, dirección de correo electrónico e imagen de perfil, obtenidos a través de Google Sign-In.</li>
        <li style={{marginBottom:8}}><strong>Contenido de listas:</strong> los ítems, descripciones, precios y fotos que agregas a tus listas de deseos.</li>
        <li style={{marginBottom:8}}><strong>Datos de uso:</strong> información sobre cómo interactúas con la plataforma.</li>
      </ul>

      <h2 style={{fontWeight:700,fontSize:20,marginBottom:12}}>3. Cómo usamos tu información</h2>
      <p style={{marginBottom:12}}>Usamos tu información para:</p>
      <ul style={{paddingLeft:24,marginBottom:24}}>
        <li style={{marginBottom:8}}>Proporcionar y mejorar el servicio de wannit.</li>
        <li style={{marginBottom:8}}>Permitirte crear y compartir listas de deseos.</li>
        <li style={{marginBottom:8}}>Identificarte cuando inicias sesión.</li>
      </ul>

      <h2 style={{fontWeight:700,fontSize:20,marginBottom:12}}>4. Compartir información</h2>
      <p style={{marginBottom:24}}>No vendemos ni compartimos tu información personal con terceros, excepto cuando es necesario para operar el servicio (por ejemplo, Firebase de Google para almacenamiento de datos).</p>

      <h2 style={{fontWeight:700,fontSize:20,marginBottom:12}}>5. Seguridad</h2>
      <p style={{marginBottom:24}}>Utilizamos Firebase de Google para almacenar tus datos de forma segura. Todas las conexiones están protegidas con HTTPS.</p>

      <h2 style={{fontWeight:700,fontSize:20,marginBottom:12}}>6. Tus derechos</h2>
      <p style={{marginBottom:24}}>Puedes eliminar tu cuenta y todos tus datos en cualquier momento contactándonos. También puedes eliminar tus listas directamente desde la plataforma.</p>

      <h2 style={{fontWeight:700,fontSize:20,marginBottom:12}}>7. Contacto</h2>
      <p style={{marginBottom:40}}>Si tienes preguntas sobre esta política de privacidad, puedes contactarnos en <a href="mailto:hola@wannit.cl" style={{color:"#FF385C"}}>hola@wannit.cl</a>.</p>

      <div style={{borderTop:"1px solid #EBEBEB",paddingTop:24,color:"#717171",fontSize:13}}>
        © {new Date().getFullYear()} wannit · Hecho con ❤️ en Chile
      </div>
    </div>
  );
}
