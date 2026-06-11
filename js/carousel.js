import { initGallery } from './carousel-slider.js';

const BUBBLE_SHOW_DELAY_MS = 4500;

let galleryApi = null;

function positionBubble(container, anchor, bubble) {
  const containerRect = container.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const isMobile = window.innerWidth <= 600;

  bubble.classList.toggle('click-me-bubble--mobile-above', isMobile);

  if (isMobile) {
    const gap = 10;
    bubble.style.left = `${anchorRect.left - containerRect.left + anchorRect.width / 2}px`;
    bubble.style.top = `${anchorRect.top - containerRect.top - gap}px`;
    return;
  }

  bubble.style.left = `${anchorRect.right - containerRect.left + 14}px`;
  bubble.style.top = `${anchorRect.top - containerRect.top + anchorRect.height * 0.38}px`;
}

function showBubble(container, anchor, bubble) {
  positionBubble(container, anchor, bubble);
  anchor.classList.add('intro-ready');
  bubble.hidden = false;
  requestAnimationFrame(() => {
    bubble.classList.add('click-me-bubble--visible');
  });
}

function activateGallery(container, anchor, bubble) {
  bubble.classList.remove('click-me-bubble--visible');
  bubble.hidden = true;
  anchor.classList.remove('intro-ready');
  container.classList.add('carousel-active');
  galleryApi?.activate();
}

export function initCarouselIntro() {
  const container = document.querySelector('.container');
  const anchor = document.getElementById('main-img');
  const bubble = document.getElementById('click-me-bubble');

  if (!container || !anchor || !bubble) return;

  galleryApi = initGallery(container);

  const revealBubble = () => showBubble(container, anchor, bubble);
  let bubbleTimer = setTimeout(revealBubble, BUBBLE_SHOW_DELAY_MS);

  const onResize = () => {
    if (!bubble.hidden) {
      positionBubble(container, anchor, bubble);
    }
    if (container.classList.contains('carousel-active')) {
      galleryApi?.positionNavButtons();
    }
  };

  window.addEventListener('resize', onResize);

  const onActivate = () => {
    clearTimeout(bubbleTimer);
    activateGallery(container, anchor, bubble);
    anchor.removeEventListener('click', onActivate);
    bubble.removeEventListener('click', onActivate);
  };

  anchor.addEventListener('click', onActivate);
  bubble.addEventListener('click', onActivate);

  anchor.setAttribute('role', 'button');
  anchor.setAttribute('tabindex', '0');
  anchor.setAttribute('aria-label', 'Open gallery');

  anchor.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate();
    }
  });
}
