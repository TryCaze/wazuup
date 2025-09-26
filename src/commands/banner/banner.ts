import { ApplicationCommandOptionType, ApplicationCommandType, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { command } from "../../types";

export const banner: command = {
  name: "banner",
  description: "Get a users profile banner",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "Select a user",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply();

    try {
      const user = interaction.options.getUser("user") || interaction.user;
      const fetchedUser = await client.users.fetch(user.id);

      const bannerUrl = fetchedUser.bannerURL({ 
        size: 1024,
        extension: fetchedUser.banner?.startsWith("a_") ? "gif" : "png",
      });

      if (!bannerUrl) {
        await interaction.editReply({
          content: `${fetchedUser.username} does not have a banner set.`,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Banner`)
        .setImage(bannerUrl)
        .setColor(0x2756cc)
        .setFooter({ text: `Requested by ${interaction.user.username}` })
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed]
      });
    } catch (error) {
      console.error("Banner command error:", error);
      await interaction.editReply({
        content: "Failed to fetch the banner lol. Please try again later.",
      });
    }
  },
};