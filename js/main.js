import { initCarouselIntro } from './carousel.js';
import { registerEffect, playEffects } from './effects/celebration.js';
import { fireworks } from './effects/fireworks.js';
import { confetti } from './effects/confetti.js';

registerEffect(fireworks);
registerEffect(confetti);

document.addEventListener('DOMContentLoaded', () => {
  initCarouselIntro();

  playEffects('.container', ['fireworks'], {
    delay: 1700,
    parallel: true,
    fireworks: {
      anchorSelector: '#main-img',
      anchorPosition: 'bottom-center',
    },
  });
});
