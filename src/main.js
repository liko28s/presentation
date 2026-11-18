import Reveal from 'reveal.js';
import Notes from 'reveal.js/plugin/notes';
import 'reveal.js/reveal.css';
import 'reveal.js/theme/black.css';
import './style.css';

// ?lang=es|en picks language, default en
const lang = new URLSearchParams(location.search).get('lang') === 'es' ? 'es' : 'en';
document.documentElement.lang = lang;

new Reveal({ width: 1920, height: 1080, hash: true, plugins: [Notes] }).initialize();

// figs follow the deck language
document.querySelectorAll('iframe.fig').forEach((f) => { f.src += `?lang=${lang}`; });
