import { CAROUSEL_SLIDES } from './carousel-data.js';
import { playEffectAt } from './effects/celebration.js';

const TRANSITION_MS = 680;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function levelImageTransform() {
  const tilt = getComputedStyle(document.documentElement)
    .getPropertyValue('--gallery-frame-tilt')
    .trim();
  const deg = Number.parseFloat(tilt) || 0;
  return `rotate(${-deg}deg)`;
}

export function initGallery(container, slides = CAROUSEL_SLIDES) {
  if (container.dataset.galleryInit === 'true') return null;

  const stage = document.getElementById('gallery-stage');
  const viewport = document.getElementById('main-img');
  const activeImg = document.getElementById('gallery-active-img');
  const ui = document.getElementById('gallery-ui');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const basket = document.getElementById('gallery-basket');
  const basketStrips = basket?.querySelector('.gallery-basket__strips');

  if (!stage || !viewport || !activeImg || !ui || !prevBtn || !nextBtn || !basket || !basketStrips) {
    return null;
  }

  let index = 0;
  let animating = false;

  const state = { index, slides, animating };

  function positionNavButtons() {
    const containerRect = container.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const isMobile = window.innerWidth <= 600;
    const centerY = stageRect.top - containerRect.top + stageRect.height / 2;

    prevBtn.style.top = `${centerY}px`;
    nextBtn.style.top = `${centerY}px`;

    if (isMobile) {
      const gap = 8;
      const minEdge = 4;
      const prevLeft = stageRect.left - containerRect.left - prevBtn.offsetWidth - gap;
      const nextLeft = stageRect.right - containerRect.left + gap;

      prevBtn.style.left = `${Math.max(minEdge, prevLeft)}px`;
      nextBtn.style.left = `${Math.min(
        containerRect.width - nextBtn.offsetWidth - minEdge,
        nextLeft
      )}px`;
      return;
    }

    const gap = 18;
    prevBtn.style.left = `${stageRect.left - containerRect.left - prevBtn.offsetWidth - gap}px`;
    nextBtn.style.left = `${stageRect.right - containerRect.left + gap}px`;
  }

  function celebratePrizeCatch() {
    void playEffectAt(container, 'confetti', {
      anchorElement: basket,
      anchorPosition: 'prize-chute',
      confetti: { compact: true },
    });
  }

  function cancelAnimations(el) {
    el.getAnimations().forEach((animation) => animation.cancel());
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
    cancelAnimations(activeImg);

    if (prefersReducedMotion()) {
      activeImg.style.opacity = '0';
      activeImg.style.visibility = 'hidden';
      addBasketStrip(slide);
      return;
    }

    const imgRect = activeImg.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();

    const flyer = activeImg.cloneNode(true);
    flyer.removeAttribute('id');
    flyer.className = 'gallery-flyer';
    flyer.setAttribute('aria-hidden', 'true');
    flyer.style.width = `${imgRect.width}px`;
    flyer.style.height = `${imgRect.height}px`;
    flyer.style.left = `${imgRect.left}px`;
    flyer.style.top = `${imgRect.top}px`;
    document.body.appendChild(flyer);

    activeImg.style.opacity = '0';
    activeImg.style.visibility = 'hidden';

    const targetX = basketRect.left + basketRect.width * 0.5;
    const targetY = basketRect.top + basketRect.height * 0.9;
    const dx = targetX - (imgRect.left + imgRect.width / 2);
    const dy = targetY - (imgRect.top + imgRect.height / 2);

    await flyer.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy}px) rotate(-22deg) scale(0.14)`,
          opacity: 0.95,
        },
      ],
      { duration: TRANSITION_MS, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' }
    ).finished;

    flyer.remove();
    addBasketStrip(slide);
  }

  async function enterSlide(slide, direction) {
    cancelAnimations(activeImg);

    activeImg.src = slide.src;
    activeImg.alt = slide.alt;
    activeImg.style.visibility = 'visible';

    const restingTransform = levelImageTransform();

    if (prefersReducedMotion()) {
      activeImg.style.transform = restingTransform;
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
        { transform: restingTransform, opacity: 1 },
      ],
      { duration: TRANSITION_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
    ).finished;

    cancelAnimations(activeImg);
    activeImg.style.transform = restingTransform;
    activeImg.style.opacity = '1';
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
