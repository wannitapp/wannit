import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { type, to, data } = req.body;

  try {
    let subject, html;

    if (type === "list_created") {
      subject = `¡Tu lista de ${data.listName} está lista! 🎁`;
      html = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="color:#FF385C">¡Hola ${data.ownerName}! 🎉</h2>
          <p>Tu lista de <strong>${data.listName}</strong> fue creada exitosamente en wannit.</p>
          ${data.eventDate ? `<p>📅 Fecha del evento: <strong>${data.eventDate}</strong></p>` : ""}
          <p>Compártela con tus amigos y familia para que sepan exactamente qué regalarte.</p>
          <p style="color:#717171;font-size:13px">— El equipo de wannit 🐦</p>
        </div>`;

    } else if (type === "list_summary") {
      const itemList = (data.items || [])
        .map(i => `<li>${i.emoji || "🎁"} <strong>${i.name}</strong>${i.taken ? " ✅ adjudicado" : ""}</li>`)
        .join("");
      subject = `Resumen de tu lista: ${data.listName} 📋`;
      html = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="color:#FF385C">Resumen de tu lista 🎁</h2>
          <p><strong>${data.listName}</strong></p>
          <ul style="line-height:2">${itemList}</ul>
          <p style="color:#717171;font-size:13px">— El equipo de wannit 🐦</p>
        </div>`;

    } else if (type === "list_complete") {
      subject = `¡Todos tus regalos fueron elegidos! 🎊`;
      html = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="color:#FF385C">¡Lista completa! 🎊</h2>
          <p>Todos los regalos de tu lista <strong>${data.listName}</strong> ya fueron adjudicados.</p>
          <p style="color:#717171;font-size:13px">— El equipo de wannit 🐦</p>
        </div>`;

    } else if (type === "item_question") {
      subject = `Pregunta sobre "${data.itemName}" en tu lista`;
      html = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="color:#FF385C">Alguien tiene una pregunta 💬</h2>
          <p>Sobre el ítem <strong>${data.itemName}</strong> en tu lista <strong>${data.listName}</strong>:</p>
          <blockquote style="border-left:3px solid #FF385C;padding-left:16px;color:#484848;font-style:italic">
            "${data.question}"
          </blockquote>
          <p style="color:#717171;font-size:13px">— El equipo de wannit 🐦</p>
        </div>`;
    }

    await resend.emails.send({
      from: "wannit <hola@wannit.cl>",
      to,
      subject,
      html,
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Email error:", e);
    res.status(500).json({ error: e.message });
  }
}
