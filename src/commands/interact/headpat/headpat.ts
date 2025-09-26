import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, Client, CommandInteraction, ComponentType, EmbedBuilder } from "discord.js";
import { command } from "../../../types";

export const headpat: command = {
    name: "headpat",
    description: "Headpats :3",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "select a user",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) {
            await interaction.editReply({
                content: "Invalid command type"
            });
            return;
        }

        const target = interaction.options.getUser("user") || interaction.user;

        const headpats = [
            "https://media.tenor.com/xE9m5-LkBeEAAAAi/anime-kanna.gif",
            "https://media.tenor.com/N41zKEDABuUAAAAM/anime-head-pat-anime-pat.gif",
            "https://media.tenor.com/r3LCBlmezPcAAAAM/can-a-boy-girl-friendship-survive-danjo-no-yuujou-wa-seiritsu-suru.gif",
            "https://media.tenor.com/MDc4TSck5PQAAAAM/frieren-anime.gif",
            "https://media.tenor.com/mecnd_qE8p8AAAAM/anime-pat.gif",
            "https://media.tenor.com/UJFuLnwkwKAAAAAM/kessoku-band-kessoku.gif",
            "https://media.tenor.com/jBuHEbqxarcAAAAM/k-on-anime.gif",
        ]

        const random = headpats[Math.floor(Math.random() * headpats.length)];

        const embed = new EmbedBuilder()
            .setTitle("Headpat :3")
            .setDescription(`${interaction.user} headpats ${target} :3`)
            .setImage(random)
            .setColor("Blue")

        const button = new ButtonBuilder()
            .setCustomId("interact_back")
            .setLabel("Headpat them back!")
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
            .setDescription(`${target} headpats ${interaction.user} back!`)
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