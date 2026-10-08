/**
 * Contact utilities for the navbar popover and email copy actions.
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

  const contactToggle = document.querySelector('[data-contact-toggle]');
  const contactLabel = document.querySelector('[data-contact-label]');
  const contactCloseIcon = document.querySelector('[data-contact-close-icon]');
  const contactPanel = document.querySelector('[data-contact-panel]');

  if (contactToggle && contactLabel && contactCloseIcon && contactPanel) {
    function setContactPanelOpen(open) {
      contactPanel.hidden = !open;
      contactToggle.setAttribute('aria-expanded', String(open));
      contactLabel.hidden = open;
      contactCloseIcon.toggleAttribute('hidden', !open);
      if (open) {
        contactToggle.setAttribute('aria-label', 'Close contact options');
      } else {
        contactToggle.removeAttribute('aria-label');
      }
    }

    contactToggle.addEventListener('click', function () {
      setContactPanelOpen(contactPanel.hidden);
    });

    document.addEventListener('click', function (event) {
      if (
        !contactPanel.hidden &&
        event.target instanceof Node &&
        !contactToggle.parentElement.contains(event.target)
      ) {
        setContactPanelOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (!contactPanel.hidden && event.key === 'Escape') {
        setContactPanelOpen(false);
        contactToggle.focus();
      }
    });

    contactToggle.parentElement.addEventListener('focusout', function () {
      window.setTimeout(function () {
        if (!contactToggle.parentElement.contains(document.activeElement)) {
          setContactPanelOpen(false);
        }
      });
    });
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
