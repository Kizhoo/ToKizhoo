export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false });

  const { username, message, photos } = req.body;

  const BOT = process.env.BOT_TOKEN;
  const OWNER = process.env.OWNER_ID;

  try {
    if (photos.length > 0) {
      for (let p of photos) {
        await sendPhoto(p, `👤 ${username}\n💬 ${message}`, BOT, OWNER);
      }
    } else {
      await sendText(`💬 Pesan Baru\n👤 Nama: ${username}\n📝 Pesan: ${message}`, BOT, OWNER);
    }
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
}

async function sendText(text, bot, chat) {
  await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ chat_id: chat, text })
  });
}

async function sendPhoto(b64, caption, bot, chat) {
  const form = new FormData();
  const file = b64.split(";base64,")[1];
  const buffer = Buffer.from(file, "base64");

  form.append("chat_id", chat);
  form.append("caption", caption);
  form.append("photo", new Blob([buffer]), "img.jpg");

  await fetch(`https://api.telegram.org/bot${bot}/sendPhoto`, {
    method: "POST",
    body: form
  });
}
