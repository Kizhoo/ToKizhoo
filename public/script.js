const toast = (msg) => {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
};

const loading = (show) => {
  document.getElementById("loading").classList.toggle("hidden", !show);
};

document.getElementById("photo").addEventListener("change", function () {
  const box = document.getElementById("previewBox");
  box.innerHTML = "";
  [...this.files].forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    box.appendChild(img);
  });
});

async function sendMessage() {
  document.getElementById("clickSound").play();

  const username = document.getElementById("username").value.trim();
  const message = document.getElementById("message").value.trim();
  const files = document.getElementById("photo").files;

  if (!username || !message) {
    toast("Nama & pesan harus diisi");
    return;
  }

  loading(true);

  let photos = [];
  for (let file of files) {
    photos.push(await toBase64(file));
  }

  fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, message, photos })
  })
  .then(res => res.json())
  .then(data => {
    loading(false);
    if (data.success) {
      toast("Pesan dah dikirim");
      document.getElementById('username').value = '';
      document.getElementById('message').value = '';
      document.getElementById('photo').value = '';
      document.getElementById('previewBox').innerHTML = '';
    } else toast("Gagal mengirim");
  })
  .catch(() => {
    loading(false);
    toast("Terjadi kesalahan");
  });
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
