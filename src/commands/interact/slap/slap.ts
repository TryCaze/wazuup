import { 
    ApplicationCommandOptionType, 
    ApplicationCommandType, 
    Client, 
    CommandInteraction, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} from "discord.js";
import { command } from "../../../types";

export const slap: command = {
    name: "slap",
    description: "Slap a user in the face!",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "Choose which user you want to slap",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) {
            await interaction.editReply({
                content: "Invalid command type",
            });
            return;
        } 

        const target = interaction.options.getUser("user") || interaction.user;

        const slaps = [
            "https://media.tenor.com/wOCOTBGZJyEAAAAM/chikku-neesan-girl-hit-wall.gif",
            "https://media.tenor.com/Ws6Dm1ZW_vMAAAAM/girl-slap.gif",
            "https://media.tenor.com/QhOI8j0ck8cAAAAM/rei-rei-ayanami.gif",
            "https://media.tenor.com/loVtwiBM_MUAAAAM/terminal-montage-mario.gif",
            "https://media.tenor.com/Sv8LQZAoQmgAAAAM/chainsaw-man-csm.gif",
            "https://media.tenor.com/8bSm0lI4_FUAAAAM/yuuri.gif",
            "https://media.tenor.com/l0NG7CcFnccAAAAi/anime.gif"
        ];

        const random = slaps[Math.floor(Math.random() * slaps.length)];

        const embed = new EmbedBuilder()
            .setTitle("Slap!")
            .setDescription(`${interaction.user} slapped ${target}!`)
            .setImage(random)
            .setColor("Blue");

        // Add "Interact back" button
        const button = new ButtonBuilder()
            .setCustomId("slap_back")
            .setLabel("Slap back")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🔄");

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        await interaction.reply({
            embeds: [embed],
            components: [row],
        });

        const replyMessage = await interaction.fetchReply();

        // Collector: only target can slap back
        const collector = replyMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15000,
            filter: i => i.user.id === target.id && i.customId === "slap_back",
        });

        collector.on("collect", async i => {
            await i.deferUpdate();

            const backEmbed = new EmbedBuilder()
                .setTitle("Revenge Slap!")
                .setDescription(`${target} slapped ${interaction.user} back!`)
                .setImage(random) // reuse same gif or pick a new random if you prefer
                .setColor("Red");

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