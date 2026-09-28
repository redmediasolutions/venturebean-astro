// Site entry: Swiper v8 (the version Elementor's CSS targets) + the runtime.
import Swiper, { Navigation, Pagination, Autoplay, EffectFade } from 'swiper';
import { boot } from './runtime/index.js';

Swiper.use([Navigation, Pagination, Autoplay, EffectFade]);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => boot(Swiper));
else boot(Swiper);
