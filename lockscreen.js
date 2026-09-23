const lockScreenEl = document.getElementById("lockScreen");
const lockTimeEl = document.getElementById("lockTime");
const lockDateEl = document.getElementById("lockDate");
const passcodeFormEl = document.getElementById("passcodeForm");
const passcodeInputEl = document.getElementById("passcodeInput");
const passcodeBoxEl = document.getElementById("passcodeBox");
const passcodeDotsEl = document.getElementById("passcodeDots");
const lockErrorEl = document.getElementById("lockError");

updateLockClock();
setInterval(updateLockClock, 1000);

passcodeInputEl.focus();
lockScreenEl.addEventListener("click", () => passcodeInputEl.focus());
passcodeInputEl.addEventListener("input", renderDots);

passcodeFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
  if (passcodeInputEl.value === PASSCODE) {
    unlock();
  } else {
    rejectPasscode();
  }
});

function renderDots() {
  const len = passcodeInputEl.value.length;
  passcodeDotsEl.innerHTML = "";
  for (let i = 0; i < len; i++) {
    const dot = document.createElement("span");
    dot.className = "passcode-dot";
    passcodeDotsEl.appendChild(dot);
  }
  lockErrorEl.classList.remove("show");
}

function unlock() {
  lockScreenEl.classList.add("unlocking");
  setTimeout(() => lockScreenEl.classList.add("hidden"), 400);
}

function rejectPasscode() {
  passcodeBoxEl.classList.remove("shake");
  void passcodeBoxEl.offsetWidth; // restart animation
  passcodeBoxEl.classList.add("shake");
  lockErrorEl.textContent = "Incorrect Passcode";
  lockErrorEl.classList.add("show");
  passcodeInputEl.value = "";
  renderDots();
  passcodeInputEl.focus();
}

function updateLockClock() {
  const now = new Date();
  lockTimeEl.textContent = now
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
    .replace(/\s?[AP]M$/i, "");
  lockDateEl.textContent = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
