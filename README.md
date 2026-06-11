# Veer Crochet

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/css-%23663399.svg?style=for-the-badge&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

A handmade crochet landing page for [Veer Crochet](https://www.facebook.com/VeerCrochet), built with plain HTML ☓ CSS ☓ JavaScript — no build step required.

## Features

- Animated intro with SVG waves, hero image, and brand typography
- Fireworks burst when the title appears
- **Click Me** speech-bubble CTA that opens an interactive photo gallery
- Diagonal slide transitions with **Prev** / **Next** controls
- UFO catcher prize tray — photos tuck into the chute as you browse
- Confetti celebration on each catch
- Facebook and Instagram links
- Mobile-responsive layout
- `prefers-reduced-motion` support

## Project structure

```
veer-crochet/
├── index.html
├── css/
│   ├── styles.css      # Layout, waves, typography, intro animations
│   ├── carousel.css    # Gallery UI, UFO catcher, Click Me bubble
│   └── effects.css     # Fireworks and confetti
├── js/
│   ├── main.js         # Entry point
│   ├── carousel.js     # Intro CTA and gallery activation
│   ├── carousel-slider.js
│   ├── carousel-data.js  # Slide images — edit here to add photos
│   └── effects/
│       ├── celebration.js  # Pluggable effects registry
│       ├── fireworks.js
│       └── confetti.js
├── img/                # Gallery photos and ufo-catcher.png
└── assets/             # Custom font (BrtSign.ttf)
```

## Local development

Serve the folder with any static file server:

```bash
python3 -m http.server 8765
```

Then open [http://localhost:8765](http://localhost:8765).

## Adding gallery photos

Edit `js/carousel-data.js`:

```javascript
export const CAROUSEL_SLIDES = [
  { src: '/img/your-photo.jpg', alt: 'Description' },
];
```

Drop new images into `img/` and reference them with a leading `/`.

## Social links

- [Facebook](https://www.facebook.com/VeerCrochet)
- [Instagram](https://instagram.com/veercrochet)
