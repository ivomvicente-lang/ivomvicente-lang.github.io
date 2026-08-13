const messagesEl = document.getElementById("chatMessages");
const form = document.getElementById("chatForm");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("chatSend");
const apiKeyInput = document.getElementById("apiKey");
const modelSelect = document.getElementById("modelSelect");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const clearChatBtn = document.getElementById("clearChatBtn");

const STORAGE_KEY = "openrouter_key";
const STORAGE_MODEL = "openrouter_model";

let history = [];

function appendMessage(role, content, extra) {
  const el = document.createElement("div");
  el.className = "msg " + role;
  el.textContent = content;
  if (extra) {
    el.dataset.extra = extra;
  }
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

function appendTyping() {
  const el = document.createElement("div");
  el.className = "msg assistant typing";
  el.textContent = "…";
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

function apiKey() {
  return apiKeyInput.value.trim();
}

function updateSendState() {
  sendBtn.disabled = false;
}

function saveKey() {
  const key = apiKey();
  if (!key) {
    appendMessage("system", "No key entered — add your OpenRouter key first.");
    return;
  }
  localStorage.setItem(STORAGE_KEY, key);
  localStorage.setItem(STORAGE_MODEL, modelSelect.value);
  appendMessage("system", "API key saved in this browser only.");
}

function clearChat() {
  history = [];
  messagesEl.innerHTML = "";
  appendMessage("assistant", "Hi, I'm Ivo's AI assistant. Ask me anything!");
}

async function send() {
  const text = input.value.trim();
  if (!text) return;
  const key = apiKey();
  if (!key) {
    appendMessage("error", "Please add your OpenRouter API key above and press \"Save key\".");
    return;
  }

  input.value = "";
  input.style.height = "auto";
  appendMessage("user", text);
  history.push({ role: "user", content: text });

  const typing = appendTyping();

  const systemPrompt =
    "You are a helpful, friendly assistant living on Ivo Vicente's personal website. " +
    "Answer concisely and naturally. You talk through the OpenRouter API.";

  const body = {
    model: modelSelect.value,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...history.slice(-12),
    ],
  };

  let finalContent = "";
  let usedStream = false;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let detail = "";
      try {
        const err = await res.json();
        detail = err.error?.message || JSON.stringify(err).slice(0, 200);
      } catch {
        detail = res.statusText;
      }
      throw new Error(detail);
    }

    if (body.stream) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      typing.textContent = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        usedStream = true;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content || "";
            if (delta) {
              finalContent += delta;
              typing.textContent = finalContent;
              messagesEl.scrollTop = messagesEl.scrollHeight;
            }
          } catch {
            /* partial chunk */
          }
        }
      }
    }
  } catch (err) {
    typing.textContent = "";
    appendMessage("error", "Request failed: " + err.message);
    history.pop();
    return;
  }

  typing.remove();

  if (!finalContent) {
    appendMessage("error", "The model returned an empty response. Try another model.");
    history.pop();
    return;
  }

  appendMessage("assistant", finalContent);
  history.push({ role: "assistant", content: finalContent });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  send();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
  requestAnimationFrame(() => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  });
});

saveKeyBtn.addEventListener("click", saveKey);
clearChatBtn.addEventListener("click", clearChat);

(function init() {
  const savedKey = localStorage.getItem(STORAGE_KEY);
  if (savedKey) {
    apiKeyInput.value = savedKey;
  }
  const savedModel = localStorage.getItem(STORAGE_MODEL);
  if (savedModel) {
    modelSelect.value = savedModel;
  }
  appendMessage("assistant", "Hi, I'm Ivo's AI assistant. Ask me anything!");
  updateSendState();
})();
