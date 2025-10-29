import { world, system } from "@minecraft/server";
import { Vector3Utils } from "@minecraft/math";
import Utils from "./utils.js";
export default class ChunkManager {
    constructor() {
        this.chunkSize = 18;
        this.radius = 4;
        this.playerChunkIndex = new Map();
        this.loadedChunks = new Map();
        this.chunkBushes = new Map();
    }
    update() {
        const player = world.getAllPlayers()[0];
        this.updatePlayerChunks(player);
    }
    updatePlayerChunks(player) {
        const chunkPos = this.getChunkCoords(player.location);
        const chunkIndex = Utils.hash2D(chunkPos.x, chunkPos.z);
        if (this.playerChunkIndex.get(player.id) === chunkIndex)
            return;
        this.playerChunkIndex.set(player.id, chunkIndex);
        this.loadTickingAreas((chunkPos.x + 0.5) * this.chunkSize, (chunkPos.z + 0.5) * this.chunkSize);
        system.waitTicks(1).then(() => {
            this.loadNearbyChunks(chunkPos.x, chunkPos.z);
            this.unloadFarChunks(chunkPos.x, chunkPos.z);
        });
    }
    loadTickingAreas(x, z) {
        const areaSize = 100;
        const dim = world.getDimension("overworld");
        dim.runCommand(`tickingarea remove_all`); // Remove old ticking areas
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const dx = x + i * areaSize - areaSize / 2;
                const dz = z + j * areaSize - areaSize / 2;
                dim.runCommand(`tickingarea add ${dx} 0 ${dz} ${dx + areaSize} 0 ${dz + areaSize} tickingarea_${dx}_${dz}`);
            }
        }
    }
    getChunkCoords(location) {
        return {
            x: Math.floor(location.x / this.chunkSize),
            z: Math.floor(location.z / this.chunkSize),
        };
    }
    loadNearbyChunks(x, z) {
        const dim = world.getDimension("overworld");
        for (let i = -this.radius; i <= this.radius; i++) {
            for (let j = -this.radius; j <= this.radius; j++) {
                const dx = x + i;
                const dz = z + j;
                const chunkIndex = Utils.hash2D(dx, dz);
                if (this.loadedChunks.has(chunkIndex))
                    continue;
                const spawnPos = {
                    x: dx * this.chunkSize + this.chunkSize / 2,
                    y: -60,
                    z: dz * this.chunkSize + this.chunkSize / 2,
                };
                // Spawn chunk entity
                const entity = dim.spawnEntity("demo:chunk", spawnPos);
                this.loadedChunks.set(chunkIndex, entity);
                // Spawn bushes and trees
                this.spawnBushes(entity);
                this.spawnTree(entity);
            }
        }
    }
    spawnBushes(chunk) {
        const dim = world.getDimension("overworld");
        const spawnChance = Utils.noise2D(chunk.location.x, chunk.location.z);
        if (spawnChance < 0.8)
            return;
        const bushesCount = (spawnChance - 0.8) * 5 * 7 + 3; // [3, 10]
        for (let i = 0; i < bushesCount; i++) {
            const spawnPos = {
                x: chunk.location.x +
                    Utils.noise2D(chunk.location.x + 35684 + i * 2365, chunk.location.z + 36678 + i * 87865) * this.chunkSize,
                y: -60,
                z: chunk.location.z +
                    Utils.noise2D(chunk.location.x + 78954 + i * 65645, chunk.location.z + 84532 + i * 78945) * this.chunkSize,
            };
            try {
                const bush = dim.spawnEntity("demo:fern_bush", spawnPos);
                const chunkPos = this.getChunkCoords(chunk.location);
                const chunkIndex = Utils.hash2D(chunkPos.x, chunkPos.z);
                if (!this.chunkBushes.has(chunkIndex)) {
                    this.chunkBushes.set(chunkIndex, []);
                }
                this.chunkBushes.get(chunkIndex).push(bush);
            }
            catch (error) {
                // Utils.error(error.message);
            }
        }
    }
    spawnTree(chunk) {
        const dim = world.getDimension("overworld");
        const spawnChance = Utils.noise2D(chunk.location.x, chunk.location.z);
        if (spawnChance < 0.5)
            return;
        const spawnPos = {
            x: chunk.location.x + Utils.noise2D(chunk.location.x * 598752, chunk.location.z * 12358) * this.chunkSize * 0.5,
            y: -60,
            z: chunk.location.z + Utils.noise2D(chunk.location.x * 76812, chunk.location.z * 76189) * this.chunkSize * 0.5,
        };
        dim.runCommand(`structure load demo:tree ${spawnPos.x} -60 ${spawnPos.z}`);
    }
    unloadFarChunks(x, z) {
        const center = { x: x, y: 0, z: z };
        // Clear chunk
        const dim = world.getDimension("overworld");
        for (const [chunkIndex, chunk] of this.loadedChunks) {
            if (!chunk.isValid)
                continue;
            const chunkPos = this.getChunkCoords(chunk.location);
            const distance = Vector3Utils.distance(center, { x: chunkPos.x, y: 0, z: chunkPos.z });
            if (distance <= this.radius + 0.5)
                continue;
            for (const bush of this.chunkBushes.get(chunkIndex) || []) {
                bush.remove();
            }
            // dim.runCommand(
            //   `structure load demo:clear ${chunk.location.x - this.chunkSize / 2} -60 ${chunk.location.z - this.chunkSize / 2}`
            // ); // Remove blocks
            this.chunkBushes.delete(chunkIndex);
            chunk.remove();
            this.loadedChunks.delete(chunkIndex);
        }
    }
}
//# sourceMappingURL=chunk_manager.js.map