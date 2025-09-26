import { ApplicationCommandOptionType, ApplicationCommandType, AttachmentBuilder, Client, CommandInteraction } from "discord.js";
import { command } from "../../types";
import path from "path";
import fs from "fs";

export const ball: command = {
    name: "bowlingball",
    description: "Ask the magic Bowling Ball and get its wisdom ouuuuh",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "question",
            description: "Ask a question",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    run: async (_client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) {
            await interaction.reply({ content: "Invalid command type", ephemeral: true});
            return;
        }

        const question = interaction.options.getString("question", true);

        const responses = [
            "Yes.",
            "Yes?",
            "No.",
            "No?",
            "Not sure.",
            "Sure why not!",
            "Maybe.",
            "Ask again later.",
            "Definitely!",
            "I would not count on it.",
            "Absolutely.",
            "Not in a million years.",
            "Better not to tell you now.",
            "Idk lol.",
            "How am I supposed to know? Do I look like a Magic Bowling Ball to you? Oh wait...",
            "Sure if you leave me alone.",
            "My honest reaction to that information:",
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        if (randomResponse === "My honest reaction to that information:") {
            const filePath = path.join(__dirname, "../../assets/honest-reaction.gif")
            console.log("Resolved file path: ", filePath);

            if (!fs.existsSync(filePath)) {
                await interaction.reply({
                    content: 'I am unable to find the image. Please report the issue.',
                    ephemeral: true,
                });
                return;
            }

            const attachment = new AttachmentBuilder(filePath);

            await interaction.reply({
            content: `**You asked:** ${question}\n**🎳 Bowling Ball of Wisdom says:** ${randomResponse}`,
            files: [attachment]
        });
        } else {
            await interaction.reply({
            content: `**You asked:** ${question}\n **🎳 Bowling Ball of Widsom says:** ${randomResponse}`,
            });
        }
    },
};