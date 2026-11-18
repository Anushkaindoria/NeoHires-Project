(() => {
  const $ = (id) => document.getElementById(id);
  const setupBox = $("mock-setup"), chatBox = $("mock-chat"), feedbackBox = $("mock-feedback");
  const messagesEl = $("mock-messages"), timerEl = $("mock-timer");
  const answerEl = $("mock-answer"), sendBtn = $("mock-send-btn");

  let sessionId = null, endAt = 0, timerId = null, busy = false;

  function addBubble(text, who) {
    const div = document.createElement("div");
    div.className = "mock-bubble " + who;
    div.textContent = text; // textContent: AI ka text HTML ki tarah nahi chalega
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function startTimer(ms) {
    endAt = Date.now() + ms;
    clearInterval(timerId);
    timerId = setInterval(() => {
      const left = Math.max(0, endAt - Date.now());
      const m = Math.floor(left / 60000);
      const s = Math.floor((left % 60000) / 1000);
      timerEl.textContent = `${m}:${String(s).padStart(2, "0")}`;
      if (left === 0) {
        clearInterval(timerId);
        sendBtn.disabled = true;
        $("mock-chat-msg").textContent = "Time is up. Getting your feedback...";
        endInterview();
      }
    }, 500);
  }

  async function startInterview() {
    const role = $("mock-role").value.trim();
    const msg = $("mock-msg");
    msg.textContent = "";
    if (!state.token) { msg.textContent = "Please log in first."; return; }
    if (!role) { msg.textContent = "Please enter a role."; return; }
    if (busy) return;
    busy = true;
    $("mock-start-btn").disabled = true;
    msg.style.color = "#374151";
    msg.textContent = "Starting... the AI may take a few seconds.";
    try {
      const data = await apiRequest("/api/mock-interview/start", {
        method: "POST",
        body: JSON.stringify({ role })
      });
      sessionId = data.sessionId;
      messagesEl.innerHTML = "";
      addBubble(data.question, "ai");
      setupBox.classList.add("hidden");
      feedbackBox.classList.add("hidden");
      chatBox.classList.remove("hidden");
      sendBtn.disabled = false;
      startTimer(data.durationMs);
    } catch (err) {
      msg.style.color = "#b91c1c";
      msg.textContent = err.message;
    } finally {
      busy = false;
      $("mock-start-btn").disabled = false;
    }
  }

  async function sendAnswer() {
    const answer = answerEl.value.trim();
    const msg = $("mock-chat-msg");
    if (!answer || busy) return;
    busy = true;
    sendBtn.disabled = true;
    msg.textContent = "";
    addBubble(answer, "user");
    answerEl.value = "";
    try {
      const data = await apiRequest(`/api/mock-interview/${sessionId}/answer`, {
        method: "POST",
        body: JSON.stringify({ answer })
      });
      addBubble(data.question, "ai");
    } catch (err) {
      msg.textContent = err.message + " (Your answer was not saved, please send it again.)";
      answerEl.value = answer; // backend ne answer hata diya, user dobara bhej sake
    } finally {
      busy = false;
      sendBtn.disabled = false;
    }
  }

  async function endInterview() {
    if (!sessionId) return;
    clearInterval(timerId);
    sendBtn.disabled = true;
    $("mock-chat-msg").textContent = "Preparing your feedback...";
    try {
      const data = await apiRequest(`/api/mock-interview/${sessionId}/end`, { method: "POST" });
      sessionId = null;
      showFeedback(data.report);
    } catch (err) {
      $("mock-chat-msg").textContent = err.message + " Click End again to retry.";
    }
  }

  function listBlock(title, items) {
    const wrap = document.createElement("div");
    const h = document.createElement("h4");
    h.textContent = title;
    const ul = document.createElement("ul");
    (items || []).forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
    wrap.append(h, ul);
    return wrap;
  }

  function showFeedback(r) {
    feedbackBox.innerHTML = "";
    const h = document.createElement("h3");
    h.textContent = "Your Feedback Report";

    const scores = document.createElement("div");
    scores.className = "mock-scores";
    [["Overall", r.overallScore], ["Communication", r.communication],
     ["Confidence", r.confidence], ["Relevance", r.relevance]].forEach(([label, val]) => {
      const card = document.createElement("div");
      card.className = "mock-score";
      const num = document.createElement("strong");
      num.textContent = `${val}/10`;
      const lab = document.createElement("span");
      lab.textContent = label;
      card.append(num, lab);
      scores.appendChild(card);
    });

    const summary = document.createElement("p");
    summary.textContent = r.summary;

    const again = document.createElement("button");
    again.className = "primary-btn";
    again.textContent = "Practice again";
    again.onclick = () => {
      feedbackBox.classList.add("hidden");
      setupBox.classList.remove("hidden");
    };

    feedbackBox.append(h, scores, summary,
      listBlock("Strengths", r.strengths),
      listBlock("Weaknesses", r.weaknesses),
      listBlock("Tips", r.tips), again);

    chatBox.classList.add("hidden");
    feedbackBox.classList.remove("hidden");
  }

  $("mock-start-btn").addEventListener("click", startInterview);
  sendBtn.addEventListener("click", sendAnswer);
  $("mock-end-btn").addEventListener("click", endInterview);
})();