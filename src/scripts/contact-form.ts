// Envia o formulário de contacto sem sair da página e mostra o resultado.
const form = document.querySelector<HTMLFormElement>('[data-contact-form]');

if (form) {
  const status = form.querySelector<HTMLElement>('[data-contact-status]');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  const setStatus = (text: string, state: 'idle' | 'sending' | 'sent' | 'error') => {
    if (!status) return;
    status.textContent = text;
    status.dataset.state = state;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form));
    // Campo escondido: se vier preenchido, foi um bot
    if (data._honey) return;

    button?.setAttribute('disabled', '');
    setStatus('Sending…', 'sending');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === 'false' || result.success === false) throw new Error();

      form.reset();
      setStatus('Thanks! Your message is on its way. I’ll get back to you soon.', 'sent');
    } catch {
      setStatus('Something went wrong. Please try again, or message me on Instagram.', 'error');
    } finally {
      button?.removeAttribute('disabled');
    }
  });
}
