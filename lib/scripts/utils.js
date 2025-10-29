import { world } from "@minecraft/server";
export default class Utils {
    static debug(message) {
        world.sendMessage(`§f[§6Debug§f] ${JSON.stringify(message)}`);
    }
    static error(message) {
        world.sendMessage(`§f[§cError§f] ${JSON.stringify(message)}`);
    }
    static title(player, title, subtitle = "") {
        player.onScreenDisplay.setTitle(title, {
            subtitle: subtitle,
            fadeInDuration: 20,
            fadeOutDuration: 20,
            stayDuration: 60,
        });
    }
    static actionBar(player, message) {
        player.onScreenDisplay.setActionBar(message);
    }
    static smoothstep(edge0, edge1, x) {
        const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
        return t * t * (3 - 2 * t);
    }
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    static hash1D(x) {
        let state = (Math.imul(x >>> 0, 747796405) + 2891336453) >>> 0;
        let shift = ((state >>> 28) + 4) >>> 0;
        let word = Math.imul((state >>> shift) ^ state, 277803737) >>> 0;
        return ((word >>> 22) ^ word) >>> 0;
    }
    // Zigzag encoding for signed → unsigned
    static toUint(n) {
        return n >= 0 ? (n << 1) >>> 0 : ((-n << 1) - 1) >>> 0;
    }
    static hash2D(x, y, seed = 0) {
        seed = (Math.imul(Utils.toUint(x), 374761393) + Math.imul(Utils.toUint(y), 668265263) + seed) >>> 0;
        return Utils.hash1D(seed);
    }
    static random2D(x, y, seed = 0) {
        return Utils.hash2D(x, y, seed) / 0xffffffff;
    }
    static noise2D(x, z, seed = 0) {
        const i = { x: Math.floor(x), z: Math.floor(z) };
        const f = { x: x - i.x, z: z - i.z };
        const p0 = Utils.random2D(i.x, i.z, seed);
        const p1 = Utils.random2D(i.x + 1, i.z, seed);
        const p2 = Utils.random2D(i.x, i.z + 1, seed);
        const p3 = Utils.random2D(i.x + 1, i.z + 1, seed);
        const u = { x: Utils.smoothstep(0, 1, f.x), z: Utils.smoothstep(0, 1, f.z) };
        return Utils.lerp(Utils.lerp(p0, p1, u.x), Utils.lerp(p2, p3, u.x), u.z);
    }
    static degrees(rad) {
        return (rad * 180) / Math.PI;
    }
    static directionToRotation(direction) {
        // Normalize the direction to avoid scaling issues
        const length = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.y, 2) + Math.pow(direction.z, 2));
        const dx = direction.x / length;
        const dy = direction.y / length;
        const dz = direction.z / length;
        // Calculate pitch and yaw
        const pitch = Math.asin(-dy);
        const yaw = Math.atan2(dz, dx);
        return { x: Utils.degrees(pitch), y: Utils.degrees(yaw), z: 0 };
    }
}
//# sourceMappingURL=utils.js.map