# UPFOREX — Animated Static Homepage

A standalone HTML/CSS/Vanilla JS implementation of the approved black-and-neon-green UPFOREX homepage mockup. No Angular, React, Bootstrap, GSAP, jQuery, build steps, or npm dependencies are required.

## Run

Open `index.html` in Chrome, Edge, Firefox, or Safari.

For the most reliable autoplay and asset loading, use any local web server. In VS Code choose **Live Server -> Open with Live Server**, or from this folder use:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## File structure

- `index.html` – full homepage, header, market ticker, footer, reviews, and legal/risk sections.
- `css/style.css` – 100% custom responsive CSS and animations.
- `js/script.js` – scrolling reveals, staggered motion, header dropdowns, video playback controls, animated hero particles, MT5 carousel, back-to-top and ticker initialization.
- `assets/` – copied locally from the original UPFOREX project, including the original blue globe background and ECN video. Local Montserrat font preserved.

## Branding and content

- Original UPFOREX colors retained: `#0d0d0d` black, `#3cff19` neon green, white, with blue limited to the original hero and trading video.
- All original homepage sections, all 6 original asset descriptions, all 4 original feature cards, original MT5 bullet copy and download URLs, welcome copy, market-condition benefits, reviews, regulations and risk text kept.
- No fictitious market prices: ticker displays actual TradingView content **only with internet access**. Offline, symbols appear without numbers.
- Outside links go to the UPFOREX website/client portal. Verify production website routes before deployment. This is a **static standalone homepage**, not a replacement for the Angular application, translation system, trading backend, or client account portal.
- Compliance wording, license status, ratings and reviews were copied from the uploaded code. Have the client verify accuracy before publishing.

## Animation features

1. Headline reveal sequence and hero button entrance.
2. Subtle blue atmospheric hero particles and parallax.
3. Scroll-triggered section fade/slide reveals with stagger timing.
4. Hover-lift and glow on cards (without changing the theme color).
5. Gentle image frame breathing and cinematic borders.
6. Auto-play, play/pause and audio toggle for the original ECN video.
7. Original MT5 slides: autoplay, previous/next, dots, and touch swipe.
8. Sticky responsive header, functional dropdowns, scroll-progress indicator, back-to-top button.
9. Reduced-motion accessibility support and pause-when-offscreen behavior.

## Maintain

Colors are in `css/style.css` at the top in `:root`. Content is directly editable in `index.html`. Video file is `assets/smart_trading.mp4` and can be replaced with another MP4 at the same location without changing colors or layout. The video poster is `assets/ecn-poster.jpg`.
