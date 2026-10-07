/**
 * Contact utilities
 * - Copies the portfolio email address from any element using data-copy-email
 */

(function () {
  'use strict';

  const email = 'meghanlendhe@gmail.com';

  function copyWithFallback(value) {
    const textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);
    return copied;
  }

  async function copyEmail() {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(email);
      return true;
    }

    return copyWithFallback(email);
  }

  function updateButton(button, copied) {
    const label = button.querySelector('[data-copy-label]');
    const status = button.querySelector('[data-copy-status]');
    if (!label || !status) return;

    label.textContent = copied ? 'Email copied' : 'Couldn’t copy email';
    status.textContent = copied ? 'Email address copied to clipboard.' : 'Copy failed. Please try again.';

    window.setTimeout(function () {
      label.textContent = button.dataset.defaultLabel || 'Copy email';
      status.textContent = '';
    }, 2200);
  }

  document.querySelectorAll('[data-copy-email]').forEach(function (button) {
    button.addEventListener('click', async function () {
      try {
        updateButton(button, await copyEmail());
      } catch (error) {
        updateButton(button, false);
      }
    });
  });
})();
