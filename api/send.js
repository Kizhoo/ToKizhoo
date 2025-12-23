export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { username, message, photos } = req.body;

  // Validate input
  if (!username || !message) {
    return res.status(400).json({ 
      success: false, 
      error: "Username and message are required" 
    });
  }

  // Get environment variables
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const OWNER_ID = process.env.OWNER_ID;

  // Check if environment variables are set
  if (!BOT_TOKEN || !OWNER_ID) {
    console.error("Missing environment variables: BOT_TOKEN or OWNER_ID");
    return res.status(500).json({ 
      success: false, 
      error: "Server configuration error" 
    });
  }

  try {
    if (photos && photos.length > 0) {
      // Send photos with caption
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const caption = i === 0 
          ? `📨 Pesan Baru dari To-Kizhoo\n👤 Nama: ${username}\n💬 Pesan: ${message}`
          : `📷 Foto ${i + 1} dari ${username}`;
        
        await sendPhoto(photo, caption, BOT_TOKEN, OWNER_ID);
        
        // Add delay between photos to avoid rate limiting
        if (i < photos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } else {
      // Send text message only
      const text = `📨 Pesan Baru dari To-Kizhoo\n\n👤 Nama: ${username}\n💬 Pesan: ${message}\n\n📅 Dikirim pada: ${new Date().toLocaleString('id-ID')}`;
      await sendText(text, BOT_TOKEN, OWNER_ID);
    }
    
    // Log success
    console.log(`Message sent from ${username} at ${new Date().toISOString()}`);
    
    return res.status(200).json({ 
      success: true, 
      message: "Message sent successfully" 
    });
  } catch (error) {
    console.error("Error sending message:", error);
    
    // Check for specific Telegram API errors
    if (error.response) {
      console.error("Telegram API error:", error.response.data);
    }
    
    return res.status(500).json({ 
      success: false, 
      error: "Failed to send message", 
      details: error.message 
    });
  }
}

// Function to send text message via Telegram Bot API
async function sendText(text, botToken, chatId) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

// Function to send photo via Telegram Bot API
async function sendPhoto(photoBase64, caption, botToken, chatId) {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  
  // Extract base64 data
  const base64Data = photoBase64.split(";base64,").pop();
  const buffer = Buffer.from(base64Data, "base64");
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append("chat_id", chatId);
  formData.append("caption", caption);
  formData.append("photo", new Blob([buffer]), "photo.jpg");
  
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
  }

  return response.json();
}
