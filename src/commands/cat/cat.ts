import { ApplicationCommandType, Client, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { command } from "../../types";
import axios from 'axios';

const userCooldowns = new Map<string, number>();
let apiUsageCount = 0;
const API_LIMIT = 10000;
const COOLDOWN_MS = 5000;
const BUTTON_TIMEOUT_MS = 15000;

export const cat: command = {
    name: 'cat',
    description: 'Get a random cat picture',
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        // Always defer first to avoid "interaction failed"
        await interaction.deferReply();

        try {
            if (apiUsageCount >= API_LIMIT) {
                await interaction.editReply("I ran out of cats this month sorry :(");
                return;
            }

            // Check cooldown
            const now = Date.now();
            const cooldownEnd = userCooldowns.get(interaction.user.id) || 0;

            if (now < cooldownEnd) {
                const remainingSeconds = Math.ceil((cooldownEnd - now) / 1000);
                await interaction.editReply(`Please wait ${remainingSeconds} more seconds before getting another cat!`);
                return;
            }

            userCooldowns.set(interaction.user.id, now + COOLDOWN_MS);
            apiUsageCount++;

            // Fetch cat
            const response = await axios.get('https://api.thecatapi.com/v1/images/search', {
                headers: { 'x-api-key': process.env.CAT_API_KEY },
                timeout: 2500
            });

            const catData = response.data[0];
            const embed = new EmbedBuilder()
                .setTitle('Meow :3')
                .setImage(catData.url)
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setColor(0x2756cc);

            // Create button
            const button = new ButtonBuilder()
                .setCustomId('more_cats')
                .setLabel('Get Another Cat!')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🐱');

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

            // Send the reply and capture the message
            const message = await interaction.editReply({ 
                embeds: [embed], 
                components: [row] 
            });

            // Create collector on the message instead of the channel
            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: BUTTON_TIMEOUT_MS,
                filter: i => i.user.id === interaction.user.id && i.customId === 'more_cats'
            });

            collector.on('collect', async i => {
                try {
                    const userCooldown = userCooldowns.get(i.user.id) || 0;
                    if (Date.now() < userCooldown) {
                        const remainingSeconds = Math.ceil((userCooldown - Date.now()) / 1000);
                        await i.reply({ 
                            content: `Please wait ${remainingSeconds} more seconds before getting another cat!`, 
                            ephemeral: true 
                        });
                        return;
                    }

                    if (apiUsageCount >= API_LIMIT) {
                        await i.reply({ 
                            content: "I ran out of cats this month sorry :(", 
                            ephemeral: true 
                        });
                        return;
                    }

                    await i.deferUpdate();

                    userCooldowns.set(i.user.id, Date.now() + COOLDOWN_MS);
                    apiUsageCount++;

                    const newResponse = await axios.get('https://api.thecatapi.com/v1/images/search', {
                        headers: { 'x-api-key': process.env.CAT_API_KEY },
                        timeout: 2500
                    });

                    const newCatData = newResponse.data[0];
                    const newEmbed = new EmbedBuilder()
                        .setTitle('Meow :3')
                        .setImage(newCatData.url)
                        .setFooter({ text: `Requested by ${i.user.username}` })
                        .setColor(0x2756cc);

                    await interaction.editReply({ 
                        embeds: [newEmbed], 
                        components: [row] 
                    });

                } catch (error) {
                    console.error('Cat API error on button click:', error);
                    apiUsageCount--; // roll back

                    let errorMessage = "Failed to fetch a cat picture. Please try again later!";
                    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
                        errorMessage = "The cat API is taking too long to respond!";
                    }

                    if (!i.replied) {
                        await i.followUp({ content: errorMessage, ephemeral: true });
                    }
                }
            });

            collector.on('end', async () => {
                const disabledButton = new ButtonBuilder()
                    .setCustomId('more_cats')
                    .setLabel('Get Another Cat!')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🐱')
                    .setDisabled(true);

                const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(disabledButton);

                try {
                    await interaction.editReply({ components: [disabledRow] });
                } catch (err) {
                    console.error('Failed to disable button:', err);
                }
            });

        } catch (error) {
            console.error('Cat API error:', error);
            apiUsageCount--; // roll back

            let errorMessage = "Failed to fetch a cat picture. Please try again later!";
            if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
                errorMessage = "The cat API is taking too long to respond!";
            }

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};