const STORAGE_KEY = "colingpt.messages";
const TIMESTAMP_GAP_MS = 60 * 60 * 1000; // show a new timestamp divider after 1hr gap

const messagesEl = document.getElementById("messages");
const composerEl = document.getElementById("composer");
const inputEl = document.getElementById("messageInput");
const sendButtonEl = document.getElementById("sendButton");

let messages = loadMessages();
let lastCatchphrase = null;

renderAll();
scrollToBottom(false);

inputEl.addEventListener("input", () => {
  sendButtonEl.disabled = inputEl.value.trim().length === 0;
});

composerEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  addMessage({ sender: "me", text, time: Date.now() });
  inputEl.value = "";
  sendButtonEl.disabled = true;
  inputEl.focus();

  const delay = 600 + Math.random() * 800;
  showTyping();
  setTimeout(() => {
    hideTyping();
    addMessage({ sender: "colin", text: pickCatchphrase(), time: Date.now() });
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

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = msg.text;

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
