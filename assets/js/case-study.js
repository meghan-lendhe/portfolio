/**
 * Case Study Interactive Utilities
 * - Reading progress indicator
 * - Full-screen responsive lightbox modal with gallery navigation & keyboard controls
 */

(function () {
  'use strict';

  /* -------------------------------------------------------------
   * 1. Reading Progress Bar
   * ----------------------------------------------------------- */
  function initReadingProgress() {
    let progressBar = document.getElementById('reading-progress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'reading-progress';
      progressBar.className =
        'fixed top-0 left-0 h-[3px] bg-accent z-50 transition-[width] duration-75 pointer-events-none';
      progressBar.setAttribute('role', 'progressbar');
      progressBar.setAttribute('aria-label', 'Reading progress');
      progressBar.setAttribute('aria-valuenow', '0');
      progressBar.setAttribute('aria-valuemin', '0');
      progressBar.setAttribute('aria-valuemax', '100');
      document.body.appendChild(progressBar);
    }

    let ticking = false;
    function updateProgress() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrolled / docHeight) * 100)) : 0;
      progressBar.style.width = `${progress}%`;
      progressBar.setAttribute('aria-valuenow', Math.round(progress));
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateProgress);
          ticking = true;
        }
      },
      { passive: true }
    );

    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
  }

  /* -------------------------------------------------------------
   * 2. Image Lightbox Modal with Gallery Cycling
   * ----------------------------------------------------------- */
  function initLightbox() {
    // Find all lightbox trigger elements (buttons with .lightbox-trigger or images inside them)
    const triggers = Array.from(document.querySelectorAll('.lightbox-trigger'));
    if (!triggers.length) return;

    // Collect gallery items
    const galleryItems = triggers.map((trigger) => {
      const img = trigger.querySelector('img');
      const figure = trigger.closest('figure');
      const figcaption = figure ? figure.querySelector('figcaption') : null;
      // Get caption text excluding the "Click to zoom" label
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

    // Build modal markup
    const modal = document.createElement('div');
    modal.id = 'lightbox-modal';
    modal.className =
      'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 opacity-0 pointer-events-none transition-opacity duration-200';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Image gallery viewer');

    modal.innerHTML = `
      <!-- Backdrop -->
      <div class="lightbox-backdrop absolute inset-0 bg-black/85 backdrop-blur-sm cursor-zoom-out"></div>

      <!-- Modal Content Container -->
      <div class="relative z-10 w-full max-w-6xl max-h-[96vh] flex flex-col items-center select-none">
        
        <!-- Top Toolbar -->
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

        <!-- Main Image Display + Prev/Next Buttons -->
        <div class="relative w-full flex items-center justify-center min-h-[200px]">
          <!-- Prev Button -->
          <button id="lightbox-prev" type="button" aria-label="Previous image"
            class="absolute left-2 sm:-left-4 z-20 p-2 sm:p-3 rounded-full bg-black/60 text-white hover:bg-black/90 hover:text-accent transition-all transform hover:scale-105 backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-accent shadow-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Image Wrapper -->
          <div class="relative flex items-center justify-center max-w-full max-h-[75vh] overflow-hidden rounded bg-neutral-900/40 p-1">
            <img id="lightbox-image" src="" alt=""
              class="max-w-full max-h-[74vh] w-auto h-auto object-contain transition-transform duration-200 ease-out" />
          </div>

          <!-- Next Button -->
          <button id="lightbox-next" type="button" aria-label="Next image"
            class="absolute right-2 sm:-right-4 z-20 p-2 sm:p-3 rounded-full bg-black/60 text-white hover:bg-black/90 hover:text-accent transition-all transform hover:scale-105 backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-accent shadow-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Bottom Caption -->
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

      // Update button visibility if single image
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
        // Focus trap
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

    // Attach trigger listeners
    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(index);
      });
    });

    // Modal UI listeners
    closeBtn.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Touch swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    modal.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      },
      { passive: true }
    );

    modal.addEventListener(
      'touchend',
      (e) => {
        const deltaX = e.changedTouches[0].screenX - touchStartX;
        const deltaY = e.changedTouches[0].screenY - touchStartY;
        // Horizontal swipe
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) showNext();
          else showPrev();
        } else if (deltaY > 80 && Math.abs(deltaY) > Math.abs(deltaX)) {
          // Swipe down to dismiss
          closeLightbox();
        }
      },
      { passive: true }
    );
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initReadingProgress();
      initLightbox();
    });
  } else {
    initReadingProgress();
    initLightbox();
  }
})();
