document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("chat-container");
  if (!container) return;

  const requestId = container.dataset.requestId;
  const messagesContainer = document.getElementById("chat-messages");
  const messageInput = document.getElementById("message-input");
  const chatForm = document.getElementById("chat-form");
  const sendButton = document.getElementById("send-button");
  const statusDisplay = document.getElementById("request-status");
  const notice = document.getElementById("chat-notice");

  if (!requestId || !messagesContainer || !messageInput || !chatForm || !sendButton) return;
  if (typeof io !== "function") {
    showNotice("Chat library did not load. Check your internet connection and refresh.", true);
    return;
  }

  let connected = false;
  const socket = io();

  function showNotice(message, isError = false) {
    if (!notice) return;
    notice.textContent = message;
    notice.classList.remove("d-none", "notice-error", "notice-success");
    notice.classList.add(isError ? "notice-error" : "notice-success");
  }

  function clearNotice() {
    if (!notice) return;
    notice.textContent = "";
    notice.classList.add("d-none");
    notice.classList.remove("notice-error", "notice-success");
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function addMessage(data) {
    if (!data || typeof data.msg !== "string") return;
    const emptyState = document.getElementById("chat-empty");
    if (emptyState) emptyState.remove();

    const message = document.createElement("div");
    message.className = "chat-message";
    const meta = document.createElement("div");
    meta.className = "chat-message-meta";

    const sender = document.createElement("strong");
    sender.className = "chat-message-sender";
    sender.textContent = data.username || "User";

    const time = document.createElement("span");
    time.className = "chat-message-time";
    time.textContent = data.timestamp || "";

    const text = document.createElement("div");
    text.className = "chat-message-text";
    text.textContent = data.msg;

    meta.append(sender, time);
    message.append(meta, text);
    messagesContainer.appendChild(message);
    scrollToBottom();
  }

  socket.on("connect", () => {
    connected = true;
    clearNotice();
    socket.emit("join", { room: requestId });
  });

  socket.on("disconnect", () => {
    connected = false;
    showNotice("Connection lost. Trying to reconnect…", true);
  });

  socket.on("connect_error", () => {
    connected = false;
    showNotice("Could not connect to live chat. Refresh the page to try again.", true);
  });

  socket.on("receive_message", (data) => {
    addMessage(data);
    clearNotice();
  });

  socket.on("status_updated", (data) => {
    if (statusDisplay && data && typeof data.status === "string") {
      statusDisplay.textContent = data.status;
      statusDisplay.className = `status-badge status-${data.status.toLowerCase().replaceAll(" ", "-")}`;
    }
    clearNotice();
  });

  socket.on("error_message", (data) => {
    showNotice(data && data.message ? data.message : "Something went wrong.", true);
  });

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = messageInput.value.trim();

    if (!message) {
      showNotice("Type a message before sending.", true);
      return;
    }
    if (message.length > 2000) {
      showNotice("Messages must be 2000 characters or fewer.", true);
      return;
    }
    if (!connected) {
      showNotice("Chat is reconnecting. Please try again in a moment.", true);
      return;
    }

    socket.emit("send_message", { request_id: requestId, msg: message });
    messageInput.value = "";
    messageInput.focus();
  });

  document.querySelectorAll(".status-change-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (!connected) {
        showNotice("Chat is reconnecting. Please try again.", true);
        return;
      }
      const status = button.dataset.status;
      if (!["Available", "Unavailable"].includes(status)) return;
      socket.emit("change_status", { request_id: requestId, status });
    });
  });

  scrollToBottom();
});
