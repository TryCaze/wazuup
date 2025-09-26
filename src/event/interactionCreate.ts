import {
  Client,
  Events,
  Interaction,
  CommandInteraction,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import { commands } from "../commands";

export default (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isMessageContextMenuCommand()) {
      const cmd = commands.find((c) => c.name === interaction.commandName);
      if (!cmd) {
        await interaction.reply({ content: "Command not found!" });
        return;
      }

      try {
        if (cmd.type === 1 && interaction.isCommand()) {
          await cmd.run(client, interaction as CommandInteraction);
        } else if (cmd.type === 3 && interaction.isMessageContextMenuCommand()) {
          await cmd.run(client, interaction as MessageContextMenuCommandInteraction);
        }
      } catch (err) {
        console.error("Command error:", err);
        if (!interaction.replied) {
          await interaction.reply({ content: "There was an error running the command." });
        }
      }
    }
  });
};
