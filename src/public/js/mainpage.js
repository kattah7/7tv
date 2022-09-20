document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('join').addEventListener('click', join);
  });

  async function join() {
  const r = await fetch('/api/bot/join', {
      method: 'POST',
  });
  const b = await r.json();
  if (b.success) {
      window.location.href='/'
    } else {
    // show error notification with `b.message`
    }
  } 