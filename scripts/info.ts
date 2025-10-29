import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import Utils from "./utils";

export default class Info {
  show(player: Player) {
    const form = new ModalFormData();
    form.title("Demo Info");
    form.label(
      `§a§lThank you for playing this demo!§r\n\n` +
        `Created by §bMihajlo Randjelovic§r.\n\n` +
        `§6§lFeatures included:§r\n\n` +
        `§2Chunk System§r - The world is divided into chunks that dynamically load grass particles, trees, and bushes.\n` +
        `Each chunk generates its elements §aconsistently§r - random placement that always stays the same for that specific area.\n\n` +
        `§cGrappling Hook§r - Shoot your hook at a block and §bget pulled§r towards it! A fun and fast way to move around the world.\n\n` +
        `§7This project demonstrates procedural world generation and physics-based movement created entirely through scripting.\n\n§r§dEnjoy exploring!§r`
    );
    form.label("Settings:");
    form.toggle("Fog", { defaultValue: player.getDynamicProperty("demo_fog") as boolean });
    form.slider("Hook Speed", 1, 10, { defaultValue: player.getDynamicProperty("demo_hook_speed") as number });
    form.submitButton("Okay");

    player.playSound("demo.ui.open_info");
    form.show(player).then((formData) => {
      if (!formData.formValues) return;

      // Toggle fog
      const fogValue = formData.formValues[2] as boolean;
      if (fogValue) {
        player.runCommand("/fog @s push demo:forest_fog demo:forest_fog");
      } else {
        player.runCommand("/fog @s pop demo:forest_fog");
      }
      player.setDynamicProperty("demo_fog", fogValue);

      // Save hook speed
      player.setDynamicProperty("demo_hook_speed", formData.formValues[3] as number);

      // Play sound
      player.playSound("demo.ui.okay");
    });
  }
}
