const DEFAULT_COLORS = [
  '#ffacad',
  '#ffdea2',
  '#755f78',
  '#b6783f',
  '#e8a0a8',
  '#c9a87c',
];

const DEFAULT_DISTANCES = { 1: 50, 2: 100, 3: 160 };
const PARTICLES_PER_LAYER = 12;
const LAYER_COUNT = 3;
const DEFAULT_DURATION = 2000;

function getViewportScale() {
  return window.innerWidth <= 600 ? 0.7 : 1;
}

function getParticleStyle(index, layer, colors, distances, scale) {
  const angle = (index / PARTICLES_PER_LAYER) * 2 * Math.PI;
  const distance = (distances[layer] ?? 60) * scale;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  const layerDelay = (layer - 1) * 100;
  const particleDelay = index * 20;
  const delay = layerDelay + particleDelay;

  const colorIndex = (index + (layer - 1) * 4) % colors.length;
  const color = colors[colorIndex];

  return {
    '--x': `${x}px`,
    '--y': `${y}px`,
    '--delay': `${delay}ms`,
    '--particle-color': color,
  };
}

function applyStyleVars(element, vars) {
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}

/** @param {'center' | 'bottom-center' | 'top-center'} position */
function getAnchorPoint(container, anchor, position = 'center') {
  const containerRect = container.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const centerX = anchorRect.left + anchorRect.width / 2 - containerRect.left;
  const centerY = anchorRect.top + anchorRect.height / 2 - containerRect.top;

  switch (position) {
    case 'bottom-center':
      return { x: centerX, y: anchorRect.bottom - containerRect.top };
    case 'top-center':
      return { x: centerX, y: anchorRect.top - containerRect.top };
    default:
      return { x: centerX, y: centerY };
  }
}

/** @type {import('./celebration.js').CelebrationEffect} */
export const fireworks = {
  name: 'fireworks',
  duration: DEFAULT_DURATION,

  play(mount, options = {}) {
    const colors = options.colors ?? DEFAULT_COLORS;
    const distances = options.distances ?? DEFAULT_DISTANCES;
    const duration = options.duration ?? DEFAULT_DURATION;
    const scale = (options.scale ?? 1) * getViewportScale();

    const container = document.createElement('div');
    container.className = 'fireworks-container';

    const root = mount.closest('.container');
    if (options.anchorSelector && root) {
      const anchor = root.querySelector(options.anchorSelector);
      if (anchor) {
        const { x, y } = getAnchorPoint(
          root,
          anchor,
          options.anchorPosition ?? 'center'
        );
        container.classList.add('fireworks-container--anchored');
        container.style.setProperty('--anchor-left', `${x}px`);
        container.style.setProperty('--anchor-top', `${y}px`);
      }
    }

    for (let layer = 1; layer <= LAYER_COUNT; layer++) {
      for (let i = 1; i <= PARTICLES_PER_LAYER; i++) {
        const particle = document.createElement('div');
        particle.className = `firework-particle firework-layer-${layer}`;
        applyStyleVars(
          particle,
          getParticleStyle(i, layer, colors, distances, scale)
        );
        container.appendChild(particle);
      }
    }

    mount.appendChild(container);

    return new Promise((resolve) => {
      setTimeout(() => {
        container.remove();
        resolve();
      }, duration);
    });
  },
};
