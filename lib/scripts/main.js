import { system, } from "@minecraft/server";
import Game from "./game.js";
const LOAD_TICK = 100;
let currentTick = 0;
let isLoaded = false;
const game = new Game();
function gameTick() {
    currentTick++;
    if (currentTick === LOAD_TICK) {
        game.initialize();
        isLoaded = true;
    }
    if (isLoaded) {
        game.update();
    }
    system.run(gameTick);
}
system.run(gameTick);
//# sourceMappingURL=main.js.map