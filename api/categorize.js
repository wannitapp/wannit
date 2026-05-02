export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, price } = req.body;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 20,
      messages: [{
        role: "user",
        content: `Clasifica este producto en UNA sola categoría de esta lista exacta:
Tecnología, Moda, Hogar, Deporte, Belleza, Viajes, Entretenimiento, Libros, Juguetes, Alimentación, Otro

Producto: "${name}"${price ? `, precio: $${price}` : ""}

Responde SOLO con el nombre de la categoría, sin puntuación ni explicación.`
      }]
    })
  });

  const data = await response.json();
  const raw = data?.content?.[0]?.text?.trim() ?? "Otro";
  const valid = ["Tecnología","Moda","Hogar","Deporte","Belleza","Viajes","Entretenimiento","Libros","Juguetes","Alimentación","Otro"];
  const category = valid.includes(raw) ? raw : "Otro";

  res.status(200).json({ category });
}