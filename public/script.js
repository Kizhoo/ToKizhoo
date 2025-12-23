// DOM Elements
// DOM Elementst = st usern.meInput = document.getElem;
const messageInput = document.getElementById('message');
const photoInput = document.getElementById('photo');
const sendBtn = document.getElementById('sendBtn');
const charCount = document.getElementById('charCount');
const uploadArea = document.getElementById('uploadArea');
const previewContainer = document.getElementById('previewContainer');
const previewBox = document.getElementById('previewBox');
const clearAllBtn = document.getElementById('clearAllBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const steps = document.querySelectorAll('.step');
const toast = document.getElementById('toast');
const toastMessage = document.querySelector('.toast-message');
const toastIcon = document.querySelector('.toast-icon');
const successModal = document.getElementById('successModal');
const newMessageBtn = document.getElementById('newMessageBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const clickSound = document.getElementById('clickSound');

// Statistics
const messagesSentElement = document.getElementById('messagesSent');
const photosSentElement = document.getElementById('photosSent');
const todayMessagesElement = document.getElementById('todayMessages');

// App State
let files = [];
let uploadProgress = 0;
let isSending = false;

// Initialize the app
function init() {
  // Load statistics from localStorage
  loadStatistics();
  
  // Setup event listeners
  setupEventListeners();
  
  // Update character count
  updateCharCount();
}

// Load statistics from localStorage
function loadStatistics() {
  // Get today's date as string
  const today = new Date().toDateString();
  
  // Get stored data or initialize
  const totalMessages = parseInt(localStorage.getItem('totalMessages')) || 0;
  const totalPhotos = parseInt(localStorage.getItem('totalPhotos')) || 0;
  const lastSentDate = localStorage.getItem('lastSentDate');
  const todayMessages = lastSentDate === today ? parseInt(localStorage.getItem('todayMessages')) || 0 : 0;
  
  // Update UI
  messagesSentElement.textContent = totalMessages;
  photosSentElement.textContent = totalPhotos;
  todayMessagesElement.textContent = todayMessages;
}

// Update statistics
function updateStatistics(hasPhotos) {
  const today = new Date().toDateString();
  const lastSentDate = localStorage.getItem('lastSentDate');
  
  // Update total messages
  const totalMessages = parseInt(localStorage.getItem('totalMessages')) || 0;
  localStorage.setItem('totalMessages', totalMessages + 1);
  messagesSentElement.textContent = totalMessages + 1;
  
  // Update today's messages
  let todayMessages = 0;
  if (lastSentDate === today) {
    todayMessages = parseInt(localStorage.getItem('todayMessages')) || 0;
  }
  localStorage.setItem('todayMessages', todayMessages + 1);
  localStorage.setItem('lastSentDate', today);
  todayMessagesElement.textContent = todayMessages + 1;
  
  // Update photos count
  if (hasPhotos && files.length > 0) {
    const totalPhotos = parseInt(localStorage.getItem('totalPhotos')) || 0;
    localStorage.setItem('totalPhotos', totalPhotos + files.length);
    photosSentElement.textContent = totalPhotos + files.length;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Character count for message
  messageInput.addEventListener('input', updateCharCount);
  
  // Upload area drag and drop
  uploadArea.addEventListener('dragover', handleDragOver);
  uploadArea.addEventListener('dragleave', handleDragLeave);
  uploadArea.addEventListener('drop', handleDrop);
  
  // File input change
  photoInput.addEventListener('change', handleFileSelect);
  
  // Clear all button
  clearAllBtn.addEventListener('click', clearAllFiles);
  
  // Modal buttons
  newMessageBtn.addEventListener('click', resetForm);
  closeModalBtn.addEventListener('click', () => {
    successModal.classList.remove('show');
    successModal.classList.add('hidden');
  });
  
  // Prevent form submission on Enter key in textarea
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  });
  
  // Submit form on Enter in username field
  usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      messageInput.focus();
    }
  });
}

// Update character count
function updateCharCount() {
  const count = messageInput.value.length;
  charCount.textContent = `${count}/500`;
  
  // Change color if near limit
  if (count > 450) {
    charCount.style.color = '#f87171';
  } else if (count > 400) {
    charCount.style.color = '#fbbf24';
  } else {
    charCount.style.color = '#94a3b8';
  }
}

// Handle drag over
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.remove('dragover');
}

// Handle drop
function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.remove('dragover');
  
  const droppedFiles = e.dataTransfer.files;
  handleFiles(droppedFiles);
}

// Handle file select
function handleFileSelect(e) {
  const selectedFiles = e.target.files;
  handleFiles(selectedFiles);
}

// Handle files (from both drag & drop and file input)
function handleFiles(fileList) {
  // Reset files array
  files = [];
  
  // Convert FileList to array and filter images
  const newFiles = Array.from(fileList).filter(file => {
    return file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024; // Max 2MB
  });
  
  // Limit to 5 files
  if (newFiles.length > 5) {
    showToast('Maksimal 5 file gambar yang dapat diunggah', 'warning');
    newFiles.length = 5;
  }
  
  // Add to files array
  files.push(...newFiles);
  
  // Update file input
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  photoInput.files = dataTransfer.files;
  
  // Update preview
  updatePreview();
  
  // Show preview container if there are files
  if (files.length > 0) {
    previewContainer.classList.add('show');
  } else {
    previewContainer.classList.remove('show');
  }
  
  // Show warning if any file was rejected
  if (newFiles.length < fileList.length) {
    showToast('Beberapa file tidak sesuai (hanya gambar maksimal 2MB)', 'warning');
  }
}

// Update preview
function updatePreview() {
  // Clear preview box
  previewBox.innerHTML = '';
  
  // Add each file as preview item
  files.forEach((file, index) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const previewItem = document.createElement('div');
      previewItem.className = 'preview-item';
      
      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = `Preview ${index + 1}`;
      
      const removeBtn = document.createElement('div');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.addEventListener('click', () => removeFile(index));
      
      previewItem.appendChild(img);
      previewItem.appendChild(removeBtn);
      previewBox.appendChild(previewItem);
    };
    
    reader.readAsDataURL(file);
  });
}

// Remove a file
function removeFile(index) {
  files.splice(index, 1);
  
  // Update file input
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  photoInput.files = dataTransfer.files;
  
  // Update preview
  updatePreview();
  
  // Hide preview container if no files left
  if (files.length === 0) {
    previewContainer.classList.remove('show');
  }
}

// Clear all files
function clearAllFiles() {
  files = [];
  photoInput.value = '';
  previewContainer.classList.remove('show');
  updatePreview();
}

// Show toast notification
function showToast(message, type = 'success') {
  // Set toast content
  toastMessage.textContent = message;
  
  // Set toast type
  toast.className = 'toast';
  toast.classList.add(type);
  
  // Set icon based on type
  let iconClass = 'fas fa-check-circle';
  if (type === 'error') iconClass = 'fas fa-exclamation-circle';
  if (type === 'warning') iconClass = 'fas fa-exclamation-triangle';
  
  toastIcon.className = 'toast-icon';
  toastIcon.innerHTML = `<i class="${iconClass}"></i>`;
  
  // Show toast
  toast.classList.add('show');
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Update loading progress
function updateProgress(step) {
  let progress = 0;
  
  switch (step) {
    case 1: // Validating
      progress = 10;
      steps[0].classList.add('active');
      break;
    case 2: // Uploading
      progress = 40;
      steps[1].classList.add('active');
      break;
    case 3: // Sending
      progress = 70;
      steps[2].classList.add('active');
      break;
    case 4: // Done
      progress = 100;
      steps[3].classList.add('active');
      break;
  }
  
  // Animate progress
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `${progress}%`;
}

// Show loading
function showLoading() {
  isSending = true;
  sendBtn.disabled = true;
  sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
  
  // Reset steps
  steps.forEach(step => step.classList.remove('active'));
  
  // Reset progress
  updateProgress(0);
  
  // Show loading overlay
  loadingOverlay.classList.remove('hidden');
}

// Hide loading
function hideLoading() {
  isSending = false;
  sendBtn.disabled = false;
  sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Pesan';
  
  // Hide loading overlay after a short delay
  setTimeout(() => {
    loadingOverlay.classList.add('hidden');
  }, 500);
}

// Convert file to Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Validate form
function validateForm() {
  const username = usernameInput.value.trim();
  const message = messageInput.value.trim();
  
  if (!username) {
    showToast('Nama wajib diisi!', 'error');
    usernameInput.focus();
    return false;
  }
  
  if (!message) {
    showToast('Pesan wajib diisi!', 'error');
    messageInput.focus();
    return false;
  }
  
  if (message.length > 500) {
    showToast('Pesan maksimal 500 karakter!', 'error');
    messageInput.focus();
    return false;
  }
  
  return true;
}

// Reset form
function resetForm() {
  usernameInput.value = '';
  messageInput.value = '';
  clearAllFiles();
  updateCharCount();
  
  // Hide modal
  successModal.classList.remove('show');
  successModal.classList.add('hidden');
  
  // Focus on username input
  usernameInput.focus();
}

// Send message
async function sendMessage() {
  // Play click sound
  clickSound.currentTime = 0;
  clickSound.play().catch(e => console.log("Audio error:", e));
  
  // Validate form
  if (!validateForm()) return;
  
  // Show loading
  showLoading();
  updateProgress(1);
  
  const username = usernameInput.value.trim();
  const message = messageInput.value.trim();
  
  try {
    // Convert files to Base64
    const photos = [];
    if (files.length > 0) {
      updateProgress(2);
      
      // Simulate upload progress
      for (let i = 0; i < files.length; i++) {
        const base64 = await toBase64(files[i]);
        photos.push(base64);
        
        // Update progress based on file upload
        const progress = 40 + (i / files.length) * 30;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
      }
    }
    
    // Send to server
    updateProgress(3);
    
    // Simulate network delay for demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Replace with your actual API endpoint
    const response = await fetch("https://github.com/Kizhoo/ToKizhoo/blob/main/api/send.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, message, photos }),
    });
    
    const data = await response.json();
    
    // Update progress
    updateProgress(4);
    
    if (data.success) {
      // Update statistics
      updateStatistics(photos.length > 0);
      
      // Show success modal after a short delay
      setTimeout(() => {
        hideLoading();
        successModal.classList.remove('hidden');
        successModal.classList.add('show');
      }, 500);
    } else {
      hideLoading();
      showToast('Gagal mengirim pesan. Silakan coba lagi.', 'error');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    hideLoading();
    showToast('Terjadi kesalahan. Periksa koneksi internet Anda.', 'error');
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
