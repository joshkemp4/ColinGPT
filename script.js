const STORAGE_KEY = "colingpt.messages";
const TIMESTAMP_GAP_MS = 60 * 60 * 1000; // show a new timestamp divider after 1hr gap

const messagesEl = document.getElementById("messages");
const composerEl = document.getElementById("composer");
const inputEl = document.getElementById("messageInput");
const sendButtonEl = document.getElementById("sendButton");
const avatarEl = document.getElementById("avatar");
const avatarPhotoEl = document.getElementById("avatarPhoto");
const resetButtonEl = document.getElementById("resetButton");

let messages = loadMessages();
let lastCatchphrase = null;
let lastPhoto = null;

renderAll();
scrollToBottom(false);
setAvatarPhoto(pickPhoto());

inputEl.addEventListener("input", () => {
  sendButtonEl.disabled = inputEl.value.trim().length === 0;
});

resetButtonEl.addEventListener("click", () => {
  if (!confirm("Clear this conversation?")) return;
  messages = [];
  lastCatchphrase = null;
  lastPhoto = null;
  saveMessages();
  renderAll();
  setAvatarPhoto(pickPhoto());
});

composerEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  addMessage({ sender: "me", content: text, time: Date.now() });
  inputEl.value = "";
  sendButtonEl.disabled = true;
  inputEl.focus();

  const delay = 600 + Math.random() * 800;
  showTyping();
  setTimeout(() => {
    hideTyping();
    addMessage({ sender: "colin", content: pickCatchphrase(), time: Date.now() });
    setAvatarPhoto(pickPhoto());
  }, delay);
});

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* localStorage unavailable — conversation just won't persist */
  }
}

function pickCatchphrase() {
  if (CATCHPHRASES.length === 1) return CATCHPHRASES[0];
  let choice;
  do {
    choice = CATCHPHRASES[Math.floor(Math.random() * CATCHPHRASES.length)];
  } while (choice === lastCatchphrase);
  lastCatchphrase = choice;
  return choice;
}

function pickPhoto() {
  if (!CONTACT_PHOTOS || CONTACT_PHOTOS.length === 0) return null;
  if (CONTACT_PHOTOS.length === 1) return CONTACT_PHOTOS[0];
  let choice;
  do {
    choice = CONTACT_PHOTOS[Math.floor(Math.random() * CONTACT_PHOTOS.length)];
  } while (choice === lastPhoto);
  lastPhoto = choice;
  return choice;
}

function setAvatarPhoto(src) {
  if (!src) {
    avatarEl.classList.remove("has-photo");
    return;
  }
  avatarPhotoEl.onload = () => avatarEl.classList.add("has-photo");
  avatarPhotoEl.onerror = () => avatarEl.classList.remove("has-photo");
  avatarPhotoEl.src = src;
}

function addMessage(msg) {
  messages.push(msg);
  saveMessages();
  renderAll();
  scrollToBottom(true);
}

function renderAll() {
  messagesEl.innerHTML = "";
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    if (!prev || msg.time - prev.time > TIMESTAMP_GAP_MS) {
      messagesEl.appendChild(makeTimestampDivider(msg.time));
    }

    const next = messages[i + 1];
    const isTail = !next || next.sender !== msg.sender;
    messagesEl.appendChild(makeRow(msg, isTail));
  });
}

function makeTimestampDivider(time) {
  const div = document.createElement("div");
  div.className = "timestamp-divider";
  div.textContent = formatTimestamp(time);
  return div;
}

function makeRow(msg, isTail) {
  const row = document.createElement("div");
  row.className = `row ${msg.sender === "me" ? "mine" : "theirs"}${isTail ? " tail" : ""}`;

  const content = msg.content !== undefined ? msg.content : msg.text; // fallback for messages saved before GIF support
  const bubble = document.createElement("div");
  const isGif = typeof content === "object" && content !== null && content.gif;

  if (isGif) {
    bubble.className = "bubble gif-bubble";
    const img = document.createElement("img");
    img.src = content.gif;
    img.alt = "GIF";
    img.loading = "lazy";
    bubble.appendChild(img);
  } else {
    bubble.className = "bubble";
    bubble.textContent = content;
  }

  row.appendChild(bubble);
  return row;
}

function showTyping() {
  const row = document.createElement("div");
  row.className = "row theirs tail";
  row.id = "typingRow";

  const bubble = document.createElement("div");
  bubble.className = "bubble typing-bubble";
  bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

  row.appendChild(bubble);
  messagesEl.appendChild(row);
  scrollToBottom(true);
}

function hideTyping() {
  const row = document.getElementById("typingRow");
  if (row) row.remove();
}

function scrollToBottom(smooth) {
  messagesEl.scrollTo({
    top: messagesEl.scrollHeight,
    behavior: smooth ? "smooth" : "auto",
  });
}

function formatTimestamp(time) {
  const date = new Date(time);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (isToday) return timeStr;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday ${timeStr}`;

  const dateStr = date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  return `${dateStr} ${timeStr}`;
}
