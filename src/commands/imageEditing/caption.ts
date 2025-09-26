import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    AttachmentBuilder,
    Client,
    CommandInteraction,
} from "discord.js";
import { command } from "../../types";
import { createCanvas, loadImage } from "canvas";
import fetch from "node-fetch";

export const caption: command = {
    name: "caption",
    description: "Add a caption to an image",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "text",
            description: "Add text on top",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "url",
            description: "Direct image URL (png/jpg/jpeg/webp/gif) - Max 10MB",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "image",
            description: "Upload an image",
            type: ApplicationCommandOptionType.Attachment,
            required: false,
        },
    ],
    run: async (_client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) {
            await interaction.reply({ content: "Invalid command type.", ephemeral: true });
            return;
        }

        await interaction.deferReply();

        const urlOption = interaction.options.get("url")?.value as string | undefined;
        const fileOption = interaction.options.get("image")?.attachment?.url;
        const text = interaction.options.get("text")?.value as string;

        // choose file > url
        const imageUrl = fileOption || urlOption;
        if (!imageUrl) {
            await interaction.editReply({
                content: "Please provide an image URL or upload a file (.png, .jpg, .jpeg, .webp, .gif).",
            });
            return;
        }

        const maxSizeMB = 10;
        const maxDimension = 4000;
        const loadTimeout = 5000;
        const minBannerHeight = 60;
        const maxBannerHeight = 200;
        const baseFontSize = 28;
        const maxFontSize = 72;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), loadTimeout);

            const headResponse = await fetch(imageUrl, { method: "HEAD" });
            const contentLength = headResponse.headers.get("content-length");

            if (contentLength && parseInt(contentLength) > maxSizeMB * 1024 * 1024) {
                clearTimeout(timeout);
                await interaction.editReply({
                    content: `❌ Image is too large (max ${maxSizeMB}MB)`,
                });
                return;
            }

            const response = await fetch(imageUrl, { signal: controller.signal });
            const arrayBuffer = await response.arrayBuffer();
            clearTimeout(timeout);

            const buffer = Buffer.from(arrayBuffer);
            const image = await loadImage(buffer);

            if (image.width > maxDimension || image.height > maxDimension) {
                await interaction.editReply({
                    content: `❌ Image dimensions too large (max ${maxDimension}x${maxDimension}px)`,
                });
                return;
            }

            const bannerHeight = Math.min(maxBannerHeight, Math.max(minBannerHeight, image.width * 0.1));
            const fontSize = Math.min(maxFontSize, Math.max(baseFontSize, bannerHeight * 0.5));

            const canvas = createCanvas(image.width, image.height + bannerHeight);
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, bannerHeight);
            ctx.drawImage(image, 0, bannerHeight);

            ctx.fillStyle = "black";
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const textY = bannerHeight / 2;
            const maxTextWidth = canvas.width * 0.9;
            let measuredWidth = ctx.measureText(text).width;
            let adjustedFontSize = fontSize;

            while (measuredWidth > maxTextWidth && adjustedFontSize > 12) {
                adjustedFontSize -= 2;
                ctx.font = `bold ${adjustedFontSize}px Arial`;
                measuredWidth = ctx.measureText(text).width;
            }

            ctx.fillText(text, canvas.width / 2, textY);

            const bufferOut = canvas.toBuffer("image/png");
            const attachment = new AttachmentBuilder(bufferOut, { name: `captioned.png` });

            await interaction.editReply({
                content: "Here is your image vro",
                files: [attachment],
            });
        } catch (error) {
            console.error("Image processing failed:", error);
            let errorMessage = "Failed to process the image. Please try again with a different image.";

            if (error instanceof Error) {
                if (error.name === "AbortError") {
                    errorMessage = "Image loading timed out (5s limit)";
                } else if (error.message.includes("Unsupported image type")) {
                    errorMessage = "Unsupported image type. Please provide a PNG, JPG, JPEG, WebP, or GIF image.";
                } else if (error.message.includes("fetch failed") || error.message.includes("ENOTFOUND")) {
                    errorMessage = "Failed to fetch the image. Please check the URL is correct and accessible.";
                } else if (error.message.includes("Content-Length")) {
                    errorMessage = `Couldn't verify image size (max ${maxSizeMB}MB allowed)`;
                }
            }

            try {
                await interaction.editReply({ content: errorMessage });
            } catch {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            }
        }
    },
};