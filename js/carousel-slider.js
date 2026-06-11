import { CAROUSEL_SLIDES } from './carousel-data.js';
import { playEffectAt } from './effects/celebration.js';

const TRANSITION_MS = 680;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initGallery(container, slides = CAROUSEL_SLIDES) {
  if (container.dataset.galleryInit === 'true') return null;

  const viewport = document.getElementById('main-img');
  const activeImg = document.getElementById('gallery-active-img');
  const ui = document.getElementById('gallery-ui');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const basket = document.getElementById('gallery-basket');
  const basketStrips = basket?.querySelector('.gallery-basket__strips');

  if (!viewport || !activeImg || !ui || !prevBtn || !nextBtn || !basket || !basketStrips) {
    return null;
  }

  let index = 0;
  let animating = false;

  const state = { index, slides, animating };

  function positionNavButtons() {
    const containerRect = container.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const isMobile = window.innerWidth <= 600;
    const centerY = viewportRect.top - containerRect.top + viewportRect.height / 2;

    prevBtn.style.top = `${centerY}px`;
    nextBtn.style.top = `${centerY}px`;

    if (isMobile) {
      const gap = 8;
      const minEdge = 4;
      const prevLeft = viewportRect.left - containerRect.left - prevBtn.offsetWidth - gap;
      const nextLeft = viewportRect.right - containerRect.left + gap;

      prevBtn.style.left = `${Math.max(minEdge, prevLeft)}px`;
      nextBtn.style.left = `${Math.min(
        containerRect.width - nextBtn.offsetWidth - minEdge,
        nextLeft
      )}px`;
      return;
    }

    const gap = 18;
    prevBtn.style.left = `${viewportRect.left - containerRect.left - prevBtn.offsetWidth - gap}px`;
    nextBtn.style.left = `${viewportRect.right - containerRect.left + gap}px`;
  }

  function celebratePrizeCatch() {
    void playEffectAt(container, 'confetti', {
      anchorElement: basket,
      anchorPosition: 'prize-chute',
      confetti: { compact: true },
    });
  }

  function addBasketStrip(slide) {
    const strip = document.createElement('div');
    strip.className = 'gallery-basket__strip';
    strip.style.backgroundImage = `url("${slide.src}")`;
    strip.setAttribute('role', 'img');
    strip.setAttribute('aria-label', slide.alt);
    basketStrips.appendChild(strip);
    requestAnimationFrame(() => strip.classList.add('gallery-basket__strip--visible'));
    celebratePrizeCatch();
  }

  async function tuckToBasket(slide) {
    if (prefersReducedMotion()) {
      addBasketStrip(slide);
      return;
    }

    const rect = activeImg.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();

    const flyer = activeImg.cloneNode(true);
    flyer.removeAttribute('id');
    flyer.className = 'gallery-flyer';
    flyer.style.width = `${rect.width}px`;
    flyer.style.height = `${rect.height}px`;
    flyer.style.left = `${rect.left}px`;
    flyer.style.top = `${rect.top}px`;
    document.body.appendChild(flyer);

    const targetX = basketRect.left + basketRect.width * 0.5;
    const targetY = basketRect.top + basketRect.height * 0.9;
    const dx = targetX - (rect.left + rect.width / 2);
    const dy = targetY - (rect.top + rect.height / 2);

    await flyer.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy}px) rotate(-22deg) scale(0.14)`,
          opacity: 0.9,
        },
      ],
      { duration: TRANSITION_MS, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' }
    ).finished;

    flyer.remove();
    addBasketStrip(slide);
  }

  async function enterSlide(slide, direction) {
    activeImg.src = slide.src;
    activeImg.alt = slide.alt;

    if (prefersReducedMotion()) {
      activeImg.style.transform = '';
      activeImg.style.opacity = '1';
      return;
    }

    const enterOffset =
      direction === 'next'
        ? 'translate(38%, -32%) rotate(14deg) scale(0.72)'
        : 'translate(-38%, -32%) rotate(-14deg) scale(0.72)';

    activeImg.style.opacity = '0';
    activeImg.style.transform = enterOffset;

    await activeImg.animate(
      [
        { transform: enterOffset, opacity: 0 },
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
      ],
      { duration: TRANSITION_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
    ).finished;

    activeImg.style.transform = '';
    activeImg.style.opacity = '';
  }

  async function navigate(direction) {
    if (animating || slides.length < 2) return;

    animating = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;

    const departing = slides[index];
    const nextIndex =
      direction === 'next'
        ? (index + 1) % slides.length
        : (index - 1 + slides.length) % slides.length;
    const incoming = slides[nextIndex];

    await tuckToBasket(departing);
    index = nextIndex;
    state.index = index;
    await enterSlide(incoming, direction);

    animating = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }

  prevBtn.addEventListener('click', () => navigate('prev'));
  nextBtn.addEventListener('click', () => navigate('next'));

  window.addEventListener('resize', () => {
    if (!ui.hidden) positionNavButtons();
  });

  container.dataset.galleryInit = 'true';

  return {
    activate() {
      ui.hidden = false;
      basket.hidden = false;
      container.classList.add('gallery-active');
      positionNavButtons();
      requestAnimationFrame(() => {
        ui.classList.add('gallery-ui--visible');
        basket.classList.add('gallery-basket--visible');
      });
    },
    positionNavButtons,
    state,
  };
}
