import { world, ItemUseAfterEvent, ItemStack } from "@minecraft/server";
import ChunkManager from "./chunk_manager.js";
import Utils from "./utils.js";
import * as grappling_hook from "./grappling_hook.js";
import Info from "./info.js";

export default class Game {
  private _chunkManager = new ChunkManager();

  initialize() {
    world
      .getDimension("overworld")
      .getEntities({ families: ["demo"] })
      .forEach((entity) => {
        entity.remove();
      });

    // Subscribe to events
    world.afterEvents.itemUse.subscribe((event) => {
      this.onItemUse(event);
    });

    // Give starter kit
    for (const player of world.getAllPlayers()) {
      if (player.hasTag("demo_starter_kit")) continue;
      const inventory = player.getComponent("inventory")?.container;
      inventory?.addItem(new ItemStack("demo:info"));
      inventory?.addItem(new ItemStack("demo:grappling_hook"));
      player.runCommand("/fog @s push demo:forest_fog demo:forest_fog"); // Start fog
      Utils.title(player, "§6Welcome to the Demo!", "§aCreated by Mihajlo Randjelovic");
      player.playSound("demo.welcome");
      player.setDynamicProperty("demo_fog", true);
      player.setDynamicProperty("demo_hook_speed", 5);
      player.addTag("demo_starter_kit");
    }
  }

  update() {
    this._chunkManager.update();
  }

  onItemUse(event: ItemUseAfterEvent) {
    const itemStackTypeId = event.itemStack.typeId;

    if (itemStackTypeId === "demo:grappling_hook") {
      grappling_hook.onItemUse(event);
    }

    if (itemStackTypeId === "demo:info") {
      new Info().show(event.source);
    }
  }
}
