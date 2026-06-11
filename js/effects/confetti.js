const DEFAULT_COLORS = [
  '#ffacad',
  '#ffdea2',
  '#755f78',
  '#b6783f',
  '#ef4444',
  '#f59e0b',
  '#ec4899',
  '#84cc16',
];

const COMPACT = {
  layers: 3,
  particlesPerLayer: 10,
  duration: 1400,
  layerDistances: { 1: 28, 2: 52, 3: 76 },
};

function getParticleStyle(index, layer, colors, distances, particlesPerLayer) {
  const angle = (index / particlesPerLayer) * 2 * Math.PI;
  const angleVariation = (Math.random() - 0.5) * 0.35;
  const finalAngle = angle + angleVariation;
  const distance = distances[layer] ?? 40;
  const x = Math.cos(finalAngle) * distance;
  const y = Math.sin(finalAngle) * distance;

  const layerDelay = (layer - 1) * 50;
  const particleDelay = index * 10;
  const delay = layerDelay + particleDelay;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const rotation = Math.random() * 360;
  const shape = Math.random() > 0.5 ? 'rectangle' : 'circle';
  const sizeVariation = 0.75 + Math.random() * 0.35;

  return {
    className: `confetti-particle confetti-layer-${layer} confetti-${shape}`,
    style: {
      '--x': `${x}px`,
      '--y': `${y}px`,
      '--delay': `${delay}ms`,
      '--confetti-color': color,
      '--rotation': `${rotation}deg`,
      '--size-variation': String(sizeVariation),
    },
  };
}

function applyStyleVars(element, vars) {
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}

/** @type {import('./celebration.js').CelebrationEffect} */
export const confetti = {
  name: 'confetti',
  duration: COMPACT.duration,

  play(mount, options = {}) {
    const colors = options.colors ?? DEFAULT_COLORS;
    const layers = options.layers ?? COMPACT.layers;
    const particlesPerLayer = options.particlesPerLayer ?? COMPACT.particlesPerLayer;
    const duration = options.duration ?? COMPACT.duration;
    const distances = options.distances ?? COMPACT.layerDistances;
    const compact = options.compact !== false;

    const container = document.createElement('div');
    container.className = compact
      ? 'confetti-container confetti-container--compact'
      : 'confetti-container';

    for (let layer = 1; layer <= layers; layer++) {
      for (let i = 1; i <= particlesPerLayer; i++) {
        const particle = document.createElement('div');
        const { className, style } = getParticleStyle(
          i,
          layer,
          colors,
          distances,
          particlesPerLayer
        );
        particle.className = className;
        applyStyleVars(particle, style);
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
