import { ApplicationCommandType, Client, Message, MessageContextMenuCommandInteraction } from "discord.js";
import { command } from "../../types";
import { createCanvas, loadImage } from "canvas";
import moment from "moment";

const cooldowns = new Map<string, number>();
const cooldownTime = 5000;

export const quote: command = {
  name: "Quote",
  type: ApplicationCommandType.Message,
  run: async (client: Client, interaction: MessageContextMenuCommandInteraction) => {
    try {
      if (!interaction.inGuild()) {
        await interaction.reply({
          content: "This command only works in servers!",
          ephemeral: true,
        });
        return;
      }

      const now = Date.now();
      const cooldown = cooldowns.get(interaction.user.id);
      if (cooldown && now - cooldown < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - (now - cooldown)) / 1000);
        await interaction.reply({
          content: `Please wait ${remaining} more seconds before quoting again.`,
          ephemeral: true,
        });
        return;
      }

      cooldowns.set(interaction.user.id, now);
      await interaction.deferReply();

      const quotedMessage = interaction.targetMessage;
      const imageBuffer = await createQuoteImage(quotedMessage);

      await interaction.editReply({
        files: [{ attachment: imageBuffer, name: "quote.png" }],
      });
    } catch (error) {
      console.error("Error in quote command:", error);
      if (!interaction.replied) {
        await interaction.editReply({
          content: "An error occurred while quoting. Try again later!",
        });
      }
    }
  },
};

async function createQuoteImage(message: Message): Promise<Buffer> {
  const width = 800;
  const height = 400;
  const padding = 40;
  const fadeWidth = 100;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  const avatar = await loadImage(
    message.author.displayAvatarURL({ extension: "jpg", size: 512 })
  );

  ctx.drawImage(avatar, 0, 0, width / 2, height);

  let imageData = ctx.getImageData(0, 0, width / 2, height);
  let data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = brightness;
    data[i + 1] = brightness;
    data[i + 2] = brightness;
  }
  ctx.putImageData(imageData, 0, 0);

  const fadeGradient = ctx.createLinearGradient(width / 2 - fadeWidth, 0, width / 2, 0);
  fadeGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  fadeGradient.addColorStop(1, "rgba(0, 0, 0, 1)");

  ctx.fillStyle = fadeGradient;
  ctx.fillRect(width / 2 - fadeWidth, 0, fadeWidth, height);

  const textX = width / 2 + padding;
  const textY = padding;
  const textWidth = width / 2 - padding * 2;
  const textHeight = height - padding * 2;

  let content = message.content;
  if (!content) content = "*No text content :(*";

  await drawText(ctx, content, textX + textWidth / 2, textY, textWidth, textHeight, "#ffffff");

  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "right";
  ctx.fillText(`— ${message.author.username}`, width - padding, height - padding);

  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#aaaaaa";
  ctx.fillText(
    moment(message.createdAt).format("MMMM D, YYYY"),
    width - padding,
    height - padding - 25
  );

  return canvas.toBuffer("image/png");
}

async function drawText(
  ctx: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  color: string
): Promise<void> {
  let fontSize = 24;
  let lineHeight = fontSize * 1.2;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  while (fontSize > 12) {
    ctx.font = `${fontSize}px sans-serif`;
    const lines = wrapText(ctx, text, maxWidth);
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight) {
      const startY = y + (maxHeight - totalHeight) / 2;
      for (let i = 0; i < lines.length; i++) {
        const lineY = startY + i * lineHeight;
        ctx.fillText(lines[i], x, lineY);
      }
      break;
    }

    fontSize -= 2;
    lineHeight = fontSize * 1.2;
  }

  const lines = wrapText(ctx, text, maxWidth);
  const totalHeight = lines.length * lineHeight;
  if (totalHeight > maxHeight) {
    const startY = y;
    for (let i = 0; i < lines.length; i++) {
      const lineY = startY + i * lineHeight;
      if (lineY + lineHeight > y + maxHeight) {
        ctx.fillText("...", x, lineY);
        break;
      }
      ctx.fillText(lines[i], x, lineY);
    }
  }
}

function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;

    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  lines.push(currentLine);
  return lines;
}