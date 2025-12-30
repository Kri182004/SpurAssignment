<script>
  import ChatWidget from "$lib/components/ChatWidget.svelte";
</script>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 80px;
    font-family: sans-serif;
  }
  h1 { font-size: 40px; margin-bottom: 10px; }
  p { font-size: 18px; max-width: 700px; text-align: center; }
</style>

<main>
  <h1>Y2K Dreamline</h1>
  <p>
    Explore Y2K-inspired fashion crafted for the nostalgic future.<br>
    Need help? Chat with us anytime.
  </p>
</main>

<ChatWidget />
