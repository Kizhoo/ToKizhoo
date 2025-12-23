export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });

  const { username, message, photos } = req.body;

  if (!username || !message)
    return res.status(400).json({ success: false });

  const BOT = process.env.BOT_TOKEN;
  const OWNER = process.env.OWNER_ID;

  try {
    if (photos && photos.length > 0) {
      for (let img of photos) {
        await sendPhoto(img, `👤 ${username}\n💬 ${message}`, BOT, OWNER);
      }
    } else {
      await sendMessage(`💬 Pesan Baru\n👤 Nama: ${username}\n📝 Pesan: ${message}`, BOT, OWNER);
    }

    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
}

async function sendMessage(text, bot, id) {
  await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, {
    method: 'POST',
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ chat_id: id, text })
  });
}

async function sendPhoto(base64, caption, bot, id) {
  const form = new FormData();
  const file = base64.split(";base64,").pop();
  const buffer = Buffer.from(file, "base64");

  form.append("chat_id", id);
  form.append("caption", caption);
  form.append("photo", new Blob([buffer]), "image.jpg");

  await fetch(`https://api.telegram.org/bot${bot}/sendPhoto`, {
    method:"POST",
    body:form
  });
}
