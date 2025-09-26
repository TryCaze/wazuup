import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, Client, CommandInteraction, ComponentType, EmbedBuilder } from "discord.js";
import { command } from "../../../types";

export const hug: command = {
    name: "hug",
    description: "Hug someone!",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "Select a user to hug!",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
    run: async(client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) {
            await interaction.editReply({
               content: "Invalid command type",
            });
            return;
        }
        
        const target = interaction.options.getUser("user") || interaction.user

        const hugs = [
            "https://media.tenor.com/HBTbcCNvLRIAAAAM/syno-i-love-you-syno.gif",
            "https://media.tenor.com/W9Z5NRFZq_UAAAAM/excited-hug.gif",
            "https://media.tenor.com/HYkaTQBybO4AAAAM/hug-anime.gif",
            "https://media.tenor.com/tqWa_FVzyloAAAAM/anime-anime-girl.gif",
            "https://media.tenor.com/7wZsxjO2_0YAAAAM/haze-lena.gif",
            "https://media.tenor.com/WyJPPUOML4sAAAAM/anime-anime-hug.gif",
            "https://media.tenor.com/NmbmeB1b6ZoAAAAM/anime-hug.gif",
        ]

        const random = hugs[Math.floor(Math.random() * hugs.length)];

        const embed = new EmbedBuilder()
            .setTitle("Hug!")
            .setDescription(`${interaction.user} hugged ${target}`)
            .setImage(random)
            .setColor("Blue")

        const button = new ButtonBuilder()
            .setCustomId("interact_back")
            .setLabel("Hug them back!")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🔄")

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

         await interaction.reply({
            embeds: [embed],
            components: [row],
        });

        const replyMessage = await interaction.fetchReply();
        
        const collector = replyMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15000,
            filter: i => i.user.id === target.id && i.customId === "interact_back",
        });
        
        collector.on("collect", async i => {
            await i.deferUpdate();
        
            const backEmbed = new EmbedBuilder()
                .setTitle("Headpat back :3")
                .setDescription(`${target} hugs ${interaction.user} back!`)
                .setImage(random)
                .setColor("Blue");
        
            await interaction.followUp({ embeds: [backEmbed] });
                collector.stop("done");
            });
        
            collector.on("end", async () => {
                const disabledButton = ButtonBuilder.from(button).setDisabled(true);
                const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(disabledButton);
        
            await interaction.editReply({
                components: [disabledRow],
            }).catch(() => {});
        });
    },
};