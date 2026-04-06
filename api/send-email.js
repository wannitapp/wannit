export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, to, data } = req.body;

  if (!type || !to) {
    return res.status(400).json({ error: "Missing type or to" });
  }

  const templates = {
    // Mejora 1 — Correo al crear lista
    list_created: {
      subject: `¡Tu lista "${data?.listName}" está lista en wannit! 🎁`,
      html: `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#222222">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px">
            <div style="width:36px;height:36px;background:#FF385C;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px">🎁</div>
            <span style="font-weight:800;font-size:20px;color:#FF385C">wannit</span>
          </div>
          <h1 style="font-size:24px;font-weight:800;margin-bottom:8px">¡Tu lista está lista! 🎉</h1>
          <p style="color:#717171;margin-bottom:24px">Hola <strong>${data?.ownerName || "ahí"}</strong>, tu lista de deseos fue creada exitosamente.</p>
          <div style="background:#F7F7F7;border-radius:12px;padding:20px;margin-bottom:24px">
            <div style="font-size:13px;color:#717171;margin-bottom:4px">Lista creada</div>
            <div style="font-size:18px;font-weight:700">${data?.listName || "Mi lista"}</div>
            ${data?.eventDate ? `<div style="font-size:13px;color:#717171;margin-top:4px">📅 ${data.eventDate}</div>` : ""}
          </div>
          <a href="https://wannit.cl" style="display:inline-block;background:#FF385C;color:white;border-radius:12px;padding:14px 28px;font-weight:700;font-size:15px;text-decoration:none">
            Ir a mi lista →
          </a>
          <p style="margin-top:32px;font-size:12px;color:#B0B0B0">wannit.cl · Hecho con ❤️ en Chile</p>
        </div>
      `,
    },

    // Mejora 2 — Resumen opcional
    list_summary: {
      subject: `Resumen de tu lista "${data?.listName}" 📋`,
      html: `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#222222">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px">
            <div style="width:36px;height:36px;background:#FF385C;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px">🎁</div>
            <span style="font-weight:800;font-size:20px;color:#FF385C">wannit</span>
          </div>
          <h1 style="font-size:24px;font-weight:800;margin-bottom:8px">Resumen de tu lista 📋</h1>
          <p style="color:#717171;margin-bottom:24px">Aquí está el estado actual de <strong>${data?.listName || "tu lista"}</strong>:</p>
          <div style="border:1px solid #EBEBEB;border-radius:12px;overflow:hidden;margin-bottom:24px">
            ${(data?.items || []).map(item => `
              <div style="padding:14px 16px;border-bottom:1px solid #EBEBEB;display:flex;justify-content:space-between;align-items:center">
                <span style="${item.taken ? "text-decoration:line-through;color:#B0B0B0" : "color:#222222"}">${item.emoji || "🎁"} ${item.name}</span>
                <span style="font-size:12px;color:${item.taken ? "#276749" : "#717171"}">${item.taken ? "✅ Adjudicado" : item.price ? `$${Number(item.price).toLocaleString("es-CL")}` : ""}</span>
              </div>
            `).join("")}
          </div>
          <a href="https://wannit.cl" style="display:inline-block;background:#FF385C;color:white;border-radius:12px;padding:14px 28px;font-weight:700;font-size:15px;text-decoration:none">
            Ver mi lista →
          </a>
          <p style="margin-top:32px;font-size:12px;color:#B0B0B0">wannit.cl · Hecho con ❤️ en Chile</p>
        </div>
      `,
    },

    // Mejora 3 — Lista completa
    list_complete: {
      subject: `🎉 ¡Tu lista "${data?.listName}" está completa!`,
      html: `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#222222">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px">
            <div style="width:36px;height:36px;background:#FF385C;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px">🎁</div>
            <span style="font-weight:800;font-size:20px;color:#FF385C">wannit</span>
          </div>
          <div style="text-align:center;padding:32px 0">
            <div style="font-size:56px;margin-bottom:16px">🎉</div>
            <h1 style="font-size:28px;font-weight:800;margin-bottom:8px">¡Tu lista está completa!</h1>
            <p style="color:#717171;font-size:16px">Todos los regalos de <strong>${data?.listName || "tu lista"}</strong> ya tienen dueño.</p>
          </div>
          <div style="background:#F0FFF4;border:1px solid #86efac;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
            <p style="color:#276749;font-weight:600;font-size:15px">¡Solo queda esperar el gran día! 🎀</p>
            <p style="color:#276749;font-size:13px;margin-top:4px">La sorpresa se mantiene — no se revelan los nombres 🤫</p>
          </div>
          <p style="margin-top:32px;font-size:12px;color:#B0B0B0;text-align:center">wannit.cl · Hecho con ❤️ en Chile</p>
        </div>
      `,
    },

    // Mejora 8 — Pregunta al dueño
    item_question: {
      subject: `💬 Pregunta sobre "${data?.itemName}" en tu lista ${data?.listName}`,
      html: `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#222222">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px">
            <div style="width:36px;height:36px;background:#FF385C;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px">🎁</div>
            <span style="font-weight:800;font-size:20px;color:#FF385C">wannit</span>
          </div>
          <h1 style="font-size:22px;font-weight:800;margin-bottom:8px">¡Alguien tiene una pregunta! 💬</h1>
          <p style="color:#717171;margin-bottom:24px">Sobre <strong>${data?.itemName || "un ítem"}</strong> de tu lista <strong>${data?.listName || ""}</strong>:</p>
          <div style="background:#F7F7F7;border-radius:12px;padding:20px;margin-bottom:24px;border-left:4px solid #FF385C">
            <p style="font-size:15px;color:#222222;line-height:1.6">"${data?.question || ""}"</p>
            ${data?.askerName ? `<p style="font-size:13px;color:#717171;margin-top:8px">— ${data.askerName}</p>` : ""}
          </div>
          <p style="color:#717171;font-size:14px">Respóndele directamente por el medio que prefieras.</p>
          <p style="margin-top:32px;font-size:12px;color:#B0B0B0">wannit.cl · Hecho con ❤️ en Chile</p>
        </div>
      `,
    },
  };

  const template = templates[type];
  if (!template) {
    return res.status(400).json({ error: "Unknown email type" });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "wannit <hola@wannit.cl>",
        to: [to],
        subject: template.subject,
        html: template.html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: result });
    }

    return res.status(200).json({ success: true, id: result.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
