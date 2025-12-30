<script>
  import { onMount, afterUpdate } from "svelte";
  import { tick } from "svelte";

  let open = false;
  let messages = [];
  let text = "";
  let loading = false;
  let sessionId = null;
  let chatBox = null;

  const api = import.meta.env.VITE_API_URL || "http://localhost:3001";

  onMount(async () => {
    // First, try to get the session ID from localStorage
    sessionId = localStorage.getItem("sessionId") || null;

    // Try to fetch the conversation history from the backend
    if (sessionId) {
      try {
        const res = await fetch(`${api}/chat/history/${sessionId}`);
        const data = await res.json();
        if (data.messages) {
          messages = data.messages.map(m => ({
            sender: m.sender,
            text: m.text
          }));
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        // If API call fails, try to load from localStorage as fallback
        const localMessages = localStorage.getItem("chatMessages");
        if (localMessages) {
          messages = JSON.parse(localMessages);
        }
      }
    } else {
      // If no session ID exists, try loading from localStorage as fallback
      const localMessages = localStorage.getItem("chatMessages");
      if (localMessages) {
        messages = JSON.parse(localMessages);
      }
    }

    // Wait for the DOM to update and then scroll to bottom
    await tick();
    // Use setTimeout to ensure DOM is fully rendered before scrolling
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  });

  // Update localStorage whenever messages change
  $: {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }

  // Scroll to bottom whenever messages change (after component updates)
  afterUpdate(() => {
    scrollToBottom();
  });

  function scrollToBottom() {
    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    });
  }

  async function sendMessage() {
    if (!text.trim()) return;
    if (loading) return; // Prevent multiple sends while loading

    loading = true;

    const userText = text;
    text = "";

    messages = [...messages, { sender: "user", text: userText }];

    try {
      // Add length validation for very long messages
      if (userText.length > 1000) {
        messages = [...messages, { sender:"ai", text:"Message is too long. Please keep it under 1000 characters." }];
        loading = false;
        scrollToBottom();
        return;
      }

      const res = await fetch(`${api}/chat/message`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ message:userText, sessionId })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.sessionId) {
        sessionId = data.sessionId;
        localStorage.setItem("sessionId", sessionId);
      }

      messages = [...messages, { sender:"ai", text:data.reply }];
    } catch (error) {
      console.error("Failed to send message:", error);
      messages = [...messages, { sender:"ai", text:"Sorry, I'm having trouble connecting. Please try again." }];
    }

    loading = false;
    scrollToBottom();
  }
</script>

<style>
  .floating-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg,#e5d4ff,#ffd6e8);
    border-radius: 50%;
    width: 60px;height:60px;
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;font-weight:600;
    z-index:9999;
  }
  .panel {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 320px;
    height: 420px;
    background:white;
    border-radius: 16px;
    box-shadow:0 6px 24px rgba(0,0,0,0.2);
    display:flex;flex-direction:column;overflow:hidden;
  }
  .header {
    background:linear-gradient(135deg,#e5d4ff,#ffd6e8);
    padding:12px;font-weight:600;text-align:center;
  }
  .messages {
    flex:1;padding:12px;overflow-y:auto;scroll-behavior:smooth;
  }
  .bubble {
    max-width:80%;padding:10px 14px;border-radius:14px;
    margin-bottom:8px;line-height:1.3;
  }
  .user { background:#e5d4ff;margin-left:auto; }
  .ai { background:#fafafa;border:1px solid #eee; }
  .input-area { display:flex;border-top:1px solid #eee; }
  input { flex:1;border:none;padding:10px;outline:none; }
  .send { background:#e5d4ff;border:none;padding:0 16px;cursor:pointer; }
</style>

<button class="floating-btn" on:click={() => open = !open}>
  Chat
</button>

{#if open}
<div class="panel">
  <div class="header">Support</div>

  <div class="messages" bind:this={chatBox}>
    {#each messages as m}
      <div class="bubble {m.sender}">{m.text}</div>
    {/each}
    {#if loading}
      <div class="bubble ai">...</div>
    {/if}
  </div>

  <div class="input-area">
    <input bind:value={text}
      on:keydown={e=>e.key==="Enter" && !loading && sendMessage()}
      placeholder="Ask something..." />
    <button class="send" on:click={sendMessage} disabled={loading}>
      Send
    </button>
  </div>
</div>
{/if}
