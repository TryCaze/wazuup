import { ApplicationCommandOptionType, ApplicationCommandType, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { command } from "../../types";

export const avatar: command = {
  name: "avatar",
  description: "Get a users avatar",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "Select a user",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  run: async (_client: Client, interaction: CommandInteraction) => {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply();

    try {
      const user = interaction.options.getUser("user") || interaction.user;

      if (user.bot) {
        await interaction.editReply({
          content: "I dont fetch avatars for bots.",
        });
        return;
      }

      const isAnimated = user.avatar?.startsWith("a_");
      const extension = isAnimated ? "gif" : "png";
      const avatarUrl = user.displayAvatarURL({ 
        extension, 
        size: 1024,
        forceStatic: false,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Avatar`)
        .setImage(avatarUrl)
        .setColor(0x2756cc)
        .setFooter({ text: `Requested by ${interaction.user.username}` })
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed]
      });
    } catch (error) {
      console.error("Avatar command error:", error);
      await interaction.editReply({
        content: "Failed to fetch the avatar lol. Please try again later.",
      });
    }
  },
};