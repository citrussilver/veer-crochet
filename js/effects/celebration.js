/**
 * Celebration effects registry — register effects and play them individually or together.
 *
 * Usage:
 *   registerEffect(fireworks);
 *   registerEffect(confetti); // when ready
 *   playEffects('.container', ['fireworks'], { delay: 1700 });
 *   playEffects('.container', ['fireworks', 'confetti'], { delay: 1700, parallel: true });
 */

const registry = new Map();

/**
 * @typedef {object} CelebrationEffect
 * @property {string} name
 * @property {number} [duration] - default duration in ms
 * @property {(mount: HTMLElement, options?: object) => Promise<void>} play
 */

/** @param {CelebrationEffect} effect */
export function registerEffect(effect) {
  if (!effect?.name || typeof effect.play !== 'function') {
    throw new Error('Effect must have a name and play(mount, options) method');
  }
  registry.set(effect.name, effect);
}

/** @param {string} name */
export function getEffect(name) {
  return registry.get(name);
}

/** @returns {string[]} */
export function listEffects() {
  return [...registry.keys()];
}

function resolveTarget(target) {
  if (typeof target === 'string') {
    return document.querySelector(target);
  }
  return target;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getAnchorPoint(container, anchor, position = 'center') {
  const containerRect = container.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const centerX = anchorRect.left - containerRect.left + anchorRect.width / 2;
  const centerY = anchorRect.top - containerRect.top + anchorRect.height / 2;

  switch (position) {
    case 'bottom-center':
      return { x: centerX, y: anchorRect.bottom - containerRect.top };
    case 'prize-chute':
      return { x: centerX, y: anchorRect.top - containerRect.top + anchorRect.height * 0.9 };
    default:
      return { x: centerX, y: centerY };
  }
}

function createLocalMount(container, anchor, position = 'center') {
  const mount = document.createElement('div');
  mount.className = 'celebration-mount celebration-mount--local';
  mount.setAttribute('aria-hidden', 'true');

  const { x, y } = getAnchorPoint(container, anchor, position);
  mount.style.left = `${x}px`;
  mount.style.top = `${y}px`;
  container.appendChild(mount);
  return mount;
}

/**
 * @param {HTMLElement|string} target
 * @param {string[]} effectNames
 * @param {object} [options]
 * @param {number} [options.delay=0]
 * @param {boolean} [options.parallel=false] - run effects at the same time
 * @param {object} [options.<effectName>] - per-effect options passed to play()
 */
export async function playEffects(target, effectNames, options = {}) {
  const el = resolveTarget(target);
  if (!el) return;

  if (prefersReducedMotion()) return;

  const { delay = 0, parallel = false, ...effectOptions } = options;

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const effects = effectNames
    .map((name) => registry.get(name))
    .filter(Boolean);

  if (effects.length === 0) return;

  const mount = document.createElement('div');
  mount.className = 'celebration-mount';
  mount.setAttribute('aria-hidden', 'true');
  el.appendChild(mount);

  const playOne = (effect) =>
    effect.play(mount, effectOptions[effect.name] ?? {});

  try {
    if (parallel) {
      await Promise.all(effects.map(playOne));
    } else {
      for (const effect of effects) {
        await playOne(effect);
      }
    }
  } finally {
    mount.remove();
  }
}

/**
 * Play a single effect anchored to an element (e.g. confetti at prize chute).
 * @param {HTMLElement|string} target
 * @param {string} effectName
 * @param {object} [options]
 * @param {HTMLElement} [options.anchorElement]
 * @param {'center'|'bottom-center'|'prize-chute'} [options.anchorPosition='center']
 * @param {object} [options.<effectName>]
 */
export async function playEffectAt(target, effectName, options = {}) {
  const el = resolveTarget(target);
  if (!el || prefersReducedMotion()) return;

  const effect = registry.get(effectName);
  if (!effect) return;

  const { anchorElement, anchorPosition = 'center', ...effectOptions } = options;
  if (!anchorElement) return;

  const mount = createLocalMount(el, anchorElement, anchorPosition);

  try {
    await effect.play(mount, effectOptions[effectName] ?? {});
  } finally {
    mount.remove();
  }
}
