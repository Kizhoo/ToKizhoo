// Toast
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// Loading
function loading(show) {
  document.getElementById("loading").classList.toggle("hidden", !show);
}

// Preview Foto
document.getElementById("photo").addEventListener("change", function () {
  const box = document.getElementById("previewBox");
  box.innerHTML = "";
  [...this.files].forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    box.appendChild(img);
  });
});

// Convert file → Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function sendMessage() {
  document.getElementById("clickSound").play();

  const username = document.getElementById("username").value.trim();
  const message = document.getElementById("message").value.trim();
  const files = document.getElementById("photo").files;

  if (!username || !message)
    return toast("Nama & pesan wajib diisi!");

  loading(true);

  let photos = [];
  for (let file of files) {
    photos.push(await toBase64(file));
  }

  fetch("https://to-kizhoo.vercel.app/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, message, photos }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        toast("Pesan terkirim!");
        document.getElementById("username").value = "";
        document.getElementById("message").value = "";
        document.getElementById("photo").value = "";
        document.getElementById("previewBox").innerHTML = "";
      } else {
        toast("Gagal mengirim");
      }
    })
    .catch(() => toast("Terjadi kesalahan"))
    .finally(() => loading(false));
}
