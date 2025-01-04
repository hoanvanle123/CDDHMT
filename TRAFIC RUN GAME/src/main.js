import { Game } from './game/Game.js';
window.focus(); // Capture keys right away (by default focus is on editor)

// Initialize and start the game
const game = new Game();
game.init();