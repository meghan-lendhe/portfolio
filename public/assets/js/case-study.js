
/**
 * Case Study Interactive Utilities
 * - Full-screen responsive lightbox modal with gallery navigation & keyboard controls
 */

(function () {
  'use strict';

  // Ensure legacy progress bar is removed if present in DOM
  const oldBar = document.getElementById('reading-progress');
  if (oldBar) oldBar.remove();

  /* -------------------------------------------------------------
   * 1. Image Lightbox Modal with Gallery Cycling
   * ----------------------------------------------------------- */
  function initLightbox() {
    const triggers = Array.from(document.querySelectorAll('.lightbox-trigger'));
    if (!triggers.length) return;

    const galleryItems = triggers.map((trigger) => {
      const img = trigger.querySelector('img');
      const figure = trigger.closest('figure');
      const figcaption = figure ? figure.querySelector('figcaption') : null;
      let captionText = '';
      if (figcaption) {
        const captionSpan = figcaption.querySelector('.caption-text');
        captionText = captionSpan ? captionSpan.textContent.trim() : figcaption.textContent.trim();
      } else if (img) {
        captionText = img.getAttribute('alt') || '';
      }

      return {
        src: img ? img.currentSrc || img.src : '',
        alt: img ? img.getAttribute('alt') || '' : '',
        caption: captionText,
        triggerElement: trigger,
      };
    });

    let currentIndex = 0;
    let lastFocusedElement = null;

    const modal = document.createElement('div');
    modal.id = 'lightbox-modal';
    modal.className =
      'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 opacity-0 pointer-events-none transition-opacity duration-200';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Image gallery viewer');

    modal.innerHTML = `
      <div class="lightbox-backdrop absolute inset-0 bg-black/85 backdrop-blur-sm cursor-zoom-out"></div>
      <div class="relative z-10 w-full max-w-6xl max-h-[96vh] flex flex-col items-center select-none">
        <div class="w-full flex items-center justify-between pb-3 px-2 text-white">
          <div class="font-display text-xs tracking-widest uppercase text-neutral-300">
            <span id="lightbox-counter" class="text-white font-semibold">01</span> / <span id="lightbox-total">00</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-neutral-400 hidden sm:inline mr-2">Use ← → arrows to navigate · Esc to close</span>
            <button id="lightbox-close" type="button" aria-label="Close image viewer"
              class="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="relative w-full flex items-center justify-center min-h-50">
          <button id="lightbox-prev" type="button" aria-label="Previous image"
            class="absolute left-2 sm:-left-4 z-20 p-2 sm:p-3 rounded-full bg-black/60 text-white hover:bg-black/90 hover:text-accent transition-all transform hover:scale-105 backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-accent shadow-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="relative flex items-center justify-center max-w-full max-h-[75vh] overflow-hidden rounded bg-neutral-900/40 p-1">
            <img id="lightbox-image" src="" alt=""
              class="max-w-full max-h-[74vh] w-auto h-auto object-contain transition-transform duration-200 ease-out" />
          </div>
          <button id="lightbox-next" type="button" aria-label="Next image"
            class="absolute right-2 sm:-right-4 z-20 p-2 sm:p-3 rounded-full bg-black/60 text-white hover:bg-black/90 hover:text-accent transition-all transform hover:scale-105 backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-accent shadow-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div class="w-full text-center pt-3 px-4 max-w-3xl">
          <p id="lightbox-caption" class="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed"></p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const backdrop = modal.querySelector('.lightbox-backdrop');
    const imageEl = modal.querySelector('#lightbox-image');
    const captionEl = modal.querySelector('#lightbox-caption');
    const counterEl = modal.querySelector('#lightbox-counter');
    const totalEl = modal.querySelector('#lightbox-total');
    const closeBtn = modal.querySelector('#lightbox-close');
    const prevBtn = modal.querySelector('#lightbox-prev');
    const nextBtn = modal.querySelector('#lightbox-next');

    totalEl.textContent = String(galleryItems.length).padStart(2, '0');

    function updateModalContent() {
      const item = galleryItems[currentIndex];
      if (!item) return;

      imageEl.style.opacity = '0.3';
      imageEl.src = item.src;
      imageEl.alt = item.alt;

      imageEl.onload = function () {
        imageEl.style.opacity = '1';
      };

      counterEl.textContent = String(currentIndex + 1).padStart(2, '0');
      captionEl.textContent = item.caption || item.alt || '';

      if (galleryItems.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      } else {
        prevBtn.style.display = '';
        nextBtn.style.display = '';
      }
    }

    function openLightbox(index) {
      currentIndex = index;
      lastFocusedElement = document.activeElement;
      updateModalContent();

      modal.classList.remove('opacity-0', 'pointer-events-none');
      modal.classList.add('opacity-100');
      document.body.style.overflow = 'hidden';

      closeBtn.focus();
      document.addEventListener('keydown', handleKeyDown);
    }

    function closeLightbox() {
      modal.classList.remove('opacity-100');
      modal.classList.add('opacity-0', 'pointer-events-none');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % galleryItems.length;
      updateModalContent();
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      updateModalContent();
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPrev();
      } else if (e.key === 'Tab') {
        const focusable = modal.querySelectorAll('button:not([style*="display: none"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(index);
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initLightbox();
    });
  } else {
    initLightbox();
  }
})();
