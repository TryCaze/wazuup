import { ApplicationCommandOptionType, ApplicationCommandType, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { command } from "../../types";

let currentCount = 0;
let lastUserId = "";
let streak = 0;
const cooldowns = new Set<string>();

const userStats = new Map<string, { correctCounts: number, totalCounts: number }>();

const failResponses = [
    "You will be executed for not knowing how to count like a 2nd grade elementary school pupil.",
    "HOW DID YOU GET THAT WRONG. NOW WE HAVE TO START OVER!",
    "Really?",
    "Bruh.",
    "HOW?",
    "Woomp woomp",
    "Lets try that again.",
    "I never thought you people couldnt count.",
];

const successMessages = [
    "Correct!",
    "Nice!",
    "Lucky guess...",
    "Meow :3",
    "Yey",
    "Congrats!",
    "Another one!",
    "EYYYY GOOD GUESS",
];

export const count: command = {
    name: 'count',
    description: 'Continue the counting game',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "number",
            description: "The next number in sequence",
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],
    run: async (_client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        if (cooldowns.has(interaction.user.id)) {
            await interaction.reply({
                content: "Please wait for 5 seconds before you can count again!",
                ephemeral: true
            });
            return;
        }

        cooldowns.add(interaction.user.id);
        setTimeout(() => cooldowns.delete(interaction.user.id), 5000);

        const userNumber = interaction.options.getInteger("number", true);
        const userId = interaction.user.id;

        if (!userStats.has(userId)) {
            userStats.set(userId, { correctCounts: 0, totalCounts: 0 });
        }

        userStats.get(userId)!.totalCounts++;

        if (userId === lastUserId) {
            await interaction.reply({
                content: "No cheating! Wait for someone else to count first!",
                ephemeral: true
            });
            return;
        }

        if (userNumber === currentCount + 1) {
            currentCount++;
            streak++;
            lastUserId = userId;

            userStats.get(userId)!.correctCounts++;

            const sucess = successMessages[Math.floor(Math.random() * successMessages.length)];
            
            await interaction.reply({
                content: `${sucess}: **${currentCount}**`,
                embeds: [await createLeaderboardEmbed()]
            });
        } else {
            const randomResponse = failResponses[Math.floor(Math.random() * failResponses.length)];
            
            await interaction.reply({
                content: `${randomResponse}\nExpected **${currentCount + 1}** but got **${userNumber}**\nStreak ended at **${streak}**. LOL idiots.`,
                embeds: [await createLeaderboardEmbed(), new EmbedBuilder()
                    .setTitle("Game Statistics")
                ]
            });
            
            currentCount = 0;
            streak = 0;
            lastUserId = "";
        }
    },
};

async function createLeaderboardEmbed(): Promise<EmbedBuilder> {
    const sortedUsers = [...userStats.entries()]
        .sort((a, b) => b[1].correctCounts - a[1].correctCounts)
        .slice(0, 10);

    const embed = new EmbedBuilder()
        .setTitle("🏆 Counting Leaderboard")
        .setColor("#FFD700")
        .setTimestamp();

    if (sortedUsers.length > 0) {
        embed.setDescription(sortedUsers
            .map(([userId, stats], index) => 
                `**${index + 1}.** <@${userId}> - ${stats.correctCounts} correct (${Math.round((stats.correctCounts / stats.totalCounts) * 100)}% accuracy)`
            )
            .join("\n"));
    } else {
        embed.setDescription("No counts yet");
    }

    return embed;
}