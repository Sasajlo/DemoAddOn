import { system, Direction, HudVisibility, HudElement, } from "@minecraft/server";
import { Vector3Utils } from "@minecraft/math";
import Utils from "./utils";
const HOOK_SPEED = 3;
const MOUNT_SPEED_MIN = 0.5;
const MOUNT_SPEED_MAX = 1.5;
const COOLDOWN = 40;
export function onItemUse(event) {
    const player = event.source;
    // Check cooldown
    if (player.getItemCooldown("demo_grappling_hook") > 0)
        return;
    // Cast ray to find target block
    const targetDirection = player.getViewDirection();
    const rayHitResult = player.dimension.getBlockFromRay(player.getHeadLocation(), targetDirection, {
        maxDistance: 100,
    });
    if (!rayHitResult) {
        Utils.actionBar(player, "§cOut of range! Max distance is 100 blocks.");
        return;
    }
    // Start cooldown
    player.startItemCooldown("demo_grappling_hook", COOLDOWN);
    const block = rayHitResult.block;
    const targetLocation = Vector3Utils.add(block.location, rayHitResult.faceLocation);
    // Adjust target location based on the face of the block
    if (rayHitResult.face === Direction.East) {
        targetLocation.x += 1;
    }
    else if (rayHitResult.face === Direction.South) {
        targetLocation.z += 1;
    }
    else if (rayHitResult.face === Direction.Up) {
        targetLocation.y += 1;
    }
    // Summon hook entity
    const hook = player.dimension.spawnEntity("demo:hook", player.getHeadLocation());
    // Apply rotation to the hook
    const hookRotation = Utils.directionToRotation(targetDirection);
    hook.setProperty("demo:pitch", hookRotation.x);
    hook.setProperty("demo:yaw", hookRotation.y);
    const leashableComponent = hook.getComponent("minecraft:leashable");
    leashableComponent === null || leashableComponent === void 0 ? void 0 : leashableComponent.leashTo(player);
    // Play sound
    player.playSound("demo.grappling_hook.shoot", { volume: 10 });
    // Spawn smoke particle
    const particleLocation = Vector3Utils.add(player.getHeadLocation(), player.getViewDirection());
    player.spawnParticle("demo:hook_smoke", particleLocation);
    const runHandle = system.runInterval(() => {
        // Stop prevous movement
        hook.clearVelocity();
        if (Vector3Utils.distance(hook.location, targetLocation) <= HOOK_SPEED) {
            // Stop moving the hook
            hook.teleport(targetLocation);
            system.clearRun(runHandle);
            spawnMount(player, hook);
            return;
        }
        // Move the hook towards in the target direction
        hook.applyImpulse(Vector3Utils.scale(targetDirection, HOOK_SPEED));
    }, 1);
}
function spawnMount(player, hook) {
    const mount = player.dimension.spawnEntity("demo:mount", player.location);
    const rideableComponent = mount.getComponent("minecraft:rideable");
    rideableComponent === null || rideableComponent === void 0 ? void 0 : rideableComponent.addRider(player);
    player.onScreenDisplay.setHudVisibility(HudVisibility.Hide, [HudElement.HorseHealth]);
    const leashableComponent = mount.getComponent("minecraft:leashable");
    leashableComponent === null || leashableComponent === void 0 ? void 0 : leashableComponent.leashTo(mount);
    const targetDirection = Vector3Utils.normalize(Vector3Utils.subtract(hook.location, player.location));
    const speedModifier = ((player.getDynamicProperty("demo_hook_speed") - 1) / 9) * (MOUNT_SPEED_MAX - MOUNT_SPEED_MIN) +
        MOUNT_SPEED_MIN;
    // Move mount to the hook
    const runHandle = system.runInterval(() => {
        mount.clearVelocity();
        if ((rideableComponent === null || rideableComponent === void 0 ? void 0 : rideableComponent.getRiders().length) === 0 ||
            Vector3Utils.distance(mount.location, hook.location) <= speedModifier) {
            system.clearRun(runHandle);
            disconnect(player, hook, mount);
            return;
        }
        mount.applyImpulse(Vector3Utils.scale(targetDirection, speedModifier));
    }, 1);
}
function disconnect(player, hook, mount) {
    hook.remove();
    mount.remove();
    player.onScreenDisplay.resetHudElementsVisibility();
}
//# sourceMappingURL=grappling_hook.js.map