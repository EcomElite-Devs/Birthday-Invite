// Update these details after confirming the event information.
const EVENT_DETAILS = {
  monthYear: "October 2026",
  date: "Monday, 12 October 2026",
  time: "7:00 PM",
  venue: "Mayur Banquet"
};

// Paste your deployed Google Apps Script web-app URL here after setup.
// Leave blank during design/testing; the form will show a preview-only message.
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1Uk3UhDSI8qB269QZvF81jGJdAzsdEnKBLP_tFKuZ8Qd4HSBJ8ZTsB1SLttOhLbGW3A/exec";

const musicToggle = document.getElementById("musicToggle");
musicToggle.addEventListener("click", () => {
  const on = musicToggle.getAttribute("aria-pressed") !== "true";
  musicToggle.setAttribute("aria-pressed", String(on));
  musicToggle.querySelector("span").textContent = on ? "Music on" : "Music off";
  // Browser audio needs a user-selected audio file. We'll add it when provided.
});

// First option in each list is the correct one; options are shuffled on screen.
const questions = [
  { q: "Which festival is called the Festival of Lights?", options: ["Diwali 🪔", "Holi 🎨", "Baisakhi 🌾"], fact: "Homes glow with diyas and rangoli to welcome good fortune." },
  { q: "Which sweet is made of fried dough balls soaked in sugar syrup?", options: ["Gulab jamun 🍯", "Dhokla", "Samosa"], fact: "Gulab jamun is on almost every Indian celebration table." },
  { q: "Which city is famous as the Pink City?", options: ["Jaipur 🏰", "Agra", "Jodhpur"], fact: "Jaipur's old city was painted pink to welcome a royal guest in 1876." },
  { q: "Bharatanatyam is a classical dance from which state?", options: ["Tamil Nadu 💃", "Punjab", "Assam"], fact: "It is one of India's oldest classical dance forms, rooted in temple traditions." },
  { q: "What is India's national animal?", options: ["Bengal tiger 🐅", "Asian lion", "Indian elephant"], fact: "India is home to more than half of the world's wild tigers." },
  { q: "Which instrument did Pandit Ravi Shankar make famous worldwide?", options: ["Sitar 🎶", "Tabla", "Flute"], fact: "His sitar music introduced Indian classical music to the world stage." }
];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
let order = [], questionIndex = 0, score = 0, answered = false;
const questionEl = document.getElementById("quizQuestion");
const optionsEl = document.getElementById("quizOptions");
const feedbackEl = document.getElementById("quizFeedback");
const nextEl = document.getElementById("nextQuestion");
const restartEl = document.getElementById("restartQuiz");
const celebrate = (n) => window.__burst && window.__burst(innerWidth / 2, innerHeight / 2, n);
function startQuiz() { order = shuffle(questions); questionIndex = 0; score = 0; renderQuestion(); }
function renderQuestion() {
  const q = order[questionIndex];
  answered = false;
  document.getElementById("quizProgress").textContent = `Question ${questionIndex + 1} of ${order.length}`;
  document.getElementById("quizScore").textContent = `${score} correct`;
  document.getElementById("progressBar").style.width = `${(questionIndex / order.length) * 100}%`;
  questionEl.textContent = q.q;
  optionsEl.innerHTML = "";
  shuffle(q.options.map((t, i) => ({ t, ok: i === 0 }))).forEach(o => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.dataset.ok = o.ok;
    button.textContent = o.t;
    button.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      if (o.ok) score++;
      [...optionsEl.children].forEach(b => { b.disabled = true; if (b.dataset.ok === "true") b.classList.add("right"); });
      if (!o.ok) button.classList.add("wrong");
      feedbackEl.textContent = (o.ok ? "Correct! " : "Not quite. ") + q.fact;
      document.getElementById("quizScore").textContent = `${score} correct`;
      nextEl.textContent = questionIndex === order.length - 1 ? "See my result" : "Next question →";
      nextEl.classList.remove("hidden");
    });
    optionsEl.appendChild(button);
  });
  feedbackEl.textContent = "Choose an answer to play.";
  nextEl.classList.add("hidden");
  restartEl.classList.add("hidden");
}
nextEl.addEventListener("click", () => {
  questionIndex++;
  if (questionIndex >= order.length) {
    const t = score === order.length ? "Desi champion! 🏆" : score >= 4 ? "Shabash! 👏" : score >= 2 ? "Good try, well played! 😊" : "Time for more mithai and stories! 🍬";
    questionEl.textContent = `${t} ${score} out of ${order.length}`;
    optionsEl.innerHTML = "";
    feedbackEl.textContent = "Thanks for playing. Now let's celebrate! 🎉";
    nextEl.classList.add("hidden");
    restartEl.classList.remove("hidden");
    document.getElementById("quizProgress").textContent = "Quiz complete";
    document.getElementById("progressBar").style.width = "100%";
    if (score >= 4) celebrate(120);
  } else renderQuestion();
});
restartEl.addEventListener("click", startQuiz);
startQuiz();

// --- Memory match game ---
const pairs = [["🪔", "Diya, the lamp of Diwali"], ["🐘", "Elephant, star of festival processions"], ["🪁", "Kite, the Makar Sankranti sky"], ["🥭", "Mango, the king of fruits"], ["🪘", "Dhol, the heartbeat of Bhangra"], ["🛕", "Mandir, a place of peace"]];
const board = document.getElementById("memBoard");
const msgEl = document.getElementById("gameMessage");
let firstCard = null, busy = false, moves = 0, matched = 0, t0 = 0, clock = null;
const fmt = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
const bestKey = "memBest";
function best(v) { try { if (v !== undefined) localStorage.setItem(bestKey, v); return Number(localStorage.getItem(bestKey)) || 0; } catch (e) { return 0; } }
function showBest() { const b = best(); document.getElementById("memBest").textContent = b ? `Best: ${b}` : ""; }
function buildGame() {
  clearInterval(clock); clock = null; firstCard = null; busy = false; moves = 0; matched = 0;
  document.getElementById("memMoves").textContent = "Moves: 0";
  document.getElementById("memTime").textContent = "0:00";
  msgEl.textContent = "Tap a card to begin!";
  board.innerHTML = "";
  shuffle([...pairs, ...pairs].map((p, i) => ({ e: p[0], l: p[1], k: p[0] }))).forEach(c => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "mem-card"; b.dataset.k = c.k; b.dataset.l = c.l;
    b.setAttribute("aria-label", "Hidden card");
    b.innerHTML = `<span class="inner"><span class="face front">✦</span><span class="face back">${c.e}</span></span>`;
    b.addEventListener("click", () => flip(b));
    board.appendChild(b);
  });
  showBest();
}
function flip(card) {
  if (busy || card.classList.contains("flipped") || card.classList.contains("done")) return;
  if (!clock) { t0 = Date.now(); clock = setInterval(() => document.getElementById("memTime").textContent = fmt(Math.floor((Date.now() - t0) / 1000)), 500); }
  card.classList.add("flipped");
  if (!firstCard) { firstCard = card; return; }
  moves++;
  document.getElementById("memMoves").textContent = `Moves: ${moves}`;
  const a = firstCard, b = card; firstCard = null;
  if (a.dataset.k === b.dataset.k) {
    [a, b].forEach(c => { c.classList.add("done"); c.setAttribute("aria-label", c.dataset.l); });
    matched++;
    const r = b.getBoundingClientRect();
    window.__burst && window.__burst(r.left + r.width / 2, r.top + r.height / 2, 35);
    if (matched === pairs.length) {
      clearInterval(clock);
      const prev = best(), newBest = !prev || moves < prev;
      if (newBest) best(moves);
      showBest();
      msgEl.textContent = `You did it in ${moves} moves and ${fmt(Math.floor((Date.now() - t0) / 1000))}! ${newBest ? "New best! 🏆" : "🎉"}`;
      celebrate(140);
    } else msgEl.textContent = `Match! ${b.dataset.l}`;
  } else {
    busy = true;
    setTimeout(() => { a.classList.remove("flipped"); b.classList.remove("flipped"); busy = false; }, 800);
  }
}
document.getElementById("resetGame").addEventListener("click", buildGame);
buildGame();

const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("formStatus");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.guests = Number(data.guests);
  data.submittedAt = new Date().toISOString();
  if (!GOOGLE_SCRIPT_URL) {
    statusEl.textContent = "Preview only: add GOOGLE_SCRIPT_URL in script.js to start saving RSVPs.";
    return;
  }
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  statusEl.textContent = "Sending your RSVP…";
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams(data)
    });
    statusEl.textContent = "Thank you! Your RSVP is in. See you there! 💛";
    form.reset(); form.elements.guests.value = 1;
  } catch (error) {
    statusEl.textContent = "Sorry, we couldn't send that right now. Please try again.";
  } finally {
    submit.disabled = false;
  }
});


