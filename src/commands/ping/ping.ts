import { ApplicationCommandType, Client, CommandInteraction } from "discord.js";
import { command } from "../../types";

export const ping: command = {
    name: 'ping',
    description: 'Replies with Pong!',
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        const sent = Date.now();
        await interaction.reply({
            content: "Pong!",
            fetchReply: true,
        }).then((msg) => {
            const latency = Date.now() - sent;
            interaction.editReply(`Pong! In ${latency}ms`)
        })
    }
}