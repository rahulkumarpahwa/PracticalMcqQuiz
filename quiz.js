const topics = [
  "Display Devices",
  "Display Description",
  "Interactive Graphics",
  "3-D Graphics",
  "Turbo-C Graphic Language",
  "OpenGL",
  "Programming Projects",
];

const files = [
  "1.json",
  "2.json",
  "3.json",
  "4.json",
  "5.json",
  "6.json",
  "7.json",
];

const state = {
  data: {},
  currentTopic: 0,
  currentIndex: 0,
};

async function loadAll() {
  const promises = files.map((f) => fetch(f).then((r) => r.json()));
  const results = await Promise.all(promises);
  results.forEach((arr, i) => {
    state.data[i] = arr;
  });
}

function $(id) {
  return document.getElementById(id);
}

function populateTopicSelect() {
  const sel = $("topicSelect");
  sel.innerHTML = "";
  topics.forEach((t, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${i + 1}. ${t}`;
    sel.appendChild(opt);
  });
  sel.value = 0;
}

function renderQuestion() {
  const topicIdx = state.currentTopic;
  const arr = state.data[topicIdx] || [];
  const qIdx = state.currentIndex;

  $("topicTitle").textContent = `${topics[topicIdx]}`;
  $("qCounter").textContent = arr.length
    ? `Question ${qIdx + 1} of ${arr.length}`
    : "No questions";
  $("status").textContent = "";

  const solutionArea = $("solutionArea");
  solutionArea.classList.add("hidden");
  solutionArea.textContent = "";

  const questionText = $("questionText");
  const optionsDiv = $("options");
  optionsDiv.innerHTML = "";

  if (!arr.length) {
    questionText.textContent = "No questions available for this topic.";
    return;
  }

  const q = arr[qIdx];
  questionText.textContent = q.question;

  const optionKeys = ["option1", "option2", "option3", "option4", "option5"];
  optionKeys.forEach((key) => {
    if (q[key]) {
      const btn = document.createElement("button");
      btn.className =
        "text-left px-4 py-3 border rounded hover:shadow-sm bg-white";
      btn.textContent = q[key];
      btn.dataset.value = q[key];
      btn.addEventListener("click", () => onOptionClick(btn, q));
      optionsDiv.appendChild(btn);
    }
  });

  // update hint
  $("hintArea").textContent = "";
}

function onOptionClick(btn, q) {
  // disable all option buttons
  const buttons = Array.from($("options").children);
  buttons.forEach((b) => (b.disabled = true));

  const chosen = btn.dataset.value;
  const correct = q.solution;

  if (chosen === correct) {
    btn.classList.add("bg-green-100", "border-green-400");
    $("status").textContent = "Correct ✓";
    $("status").classList.remove("text-gray-500");
  } else {
    btn.classList.add("bg-red-100", "border-red-400");
    // highlight the correct button
    buttons.forEach((b) => {
      if (b.dataset.value === correct)
        b.classList.add("bg-green-100", "border-green-400");
    });
    $("status").textContent = "Incorrect ✗";
  }

  // show solution text
  const solutionArea = $("solutionArea");
  solutionArea.classList.remove("hidden");
  solutionArea.textContent = `Solution: ${correct}`;
}

function attachHandlers() {
  $("topicSelect").addEventListener("change", (e) => {
    state.currentTopic = Number(e.target.value);
    state.currentIndex = 0;
    renderQuestion();
  });

  $("nextBtn").addEventListener("click", () => {
    const arr = state.data[state.currentTopic];
    if (!arr) return;
    state.currentIndex = Math.min(arr.length - 1, state.currentIndex + 1);
    renderQuestion();
  });

  $("prevBtn").addEventListener("click", () => {
    state.currentIndex = Math.max(0, state.currentIndex - 1);
    renderQuestion();
  });

  $("shuffleBtn").addEventListener("click", () => {
    const arr = state.data[state.currentTopic];
    if (!arr) return;
    // simple Fisher-Yates
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    state.currentIndex = 0;
    renderQuestion();
  });
}

async function boot() {
  try {
    await loadAll();
    populateTopicSelect();
    attachHandlers();
    renderQuestion();
  } catch (err) {
    $("questionText").textContent = "Error loading questions. See console.";
    console.error(err);
  }
}

window.addEventListener("DOMContentLoaded", boot);
