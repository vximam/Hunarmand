document.addEventListener('DOMContentLoaded', () => {
  const headerBtn = document.getElementById('open-chatbot');
  if (!headerBtn) return;

  headerBtn.addEventListener('click', () => {
    const toggle = document.getElementById('chatbot-toggle-btn');
    if (toggle) {
      toggle.click();
    } else {
      // widget not injected yet — try briefly after a short delay
      setTimeout(() => {
        const t = document.getElementById('chatbot-toggle-btn');
        if (t) t.click();
      }, 250);
    }
  });
});
