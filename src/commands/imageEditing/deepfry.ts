import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    AttachmentBuilder,
    Client,
    CommandInteraction
} from "discord.js";
import { command } from "../../types";
import { createCanvas, loadImage } from "canvas";

export const deepfry: command = {
    name: 'deepfry',
    description: 'Deepfry that image!',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "url",
            description: "Direct image URL (png/jpg/jpeg/webp)",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "image",
            description: "Upload an image",
            type: ApplicationCommandOptionType.Attachment,
            required: false,
        },
        {
            name: "intensity",
            description: "How fried you want it? (1 = lightly, 5 = ruined)",
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
            max_value: 5,
            required: false,
        },
    ],
    run: async (_client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        await interaction.deferReply();

        const urlOption = interaction.options.get("url")?.value as string | undefined;
        const fileOption = interaction.options.get("image")?.attachment?.url;
        const intensityRaw = interaction.options.get("intensity")?.value as number | undefined;
        const intensity = Math.max(1, Math.min(intensityRaw || 3, 5));

        const imageUrl = fileOption || urlOption;
        if (!imageUrl) {
            await interaction.editReply({
                content: "Provide a valid image URL or attachment (.png, .jpg, .jpeg, .webp)."
            });
            return;
        }

        try {
            const response = await fetch(imageUrl);
            const contentType = response.headers.get("content-type") || "";
            if (!response.ok || !contentType.startsWith("image")) {
                throw new Error("Failed to fetch image or unsupported format.");
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const baseImage = await loadImage(buffer);

            const width = baseImage.width;
            const height = baseImage.height;
            const fryCanvas = createCanvas(width, height);
            const fryCtx = fryCanvas.getContext("2d");
            fryCtx.drawImage(baseImage, 0, 0, width, height);

            const fryPasses = intensity * 2;

            for (let i = 0; i < fryPasses; i++) {
                const scale = 1 / (1.5 + intensity * 0.4);
                const tempW = Math.max(1, Math.floor(width * scale));
                const tempH = Math.max(1, Math.floor(height * scale));
                const tempCanvas = createCanvas(tempW, tempH);
                const tempCtx = tempCanvas.getContext("2d");

                tempCtx.imageSmoothingEnabled = false;
                tempCtx.drawImage(fryCanvas, 0, 0, tempW, tempH);

                fryCtx.imageSmoothingEnabled = false;
                fryCtx.clearRect(0, 0, width, height);
                fryCtx.drawImage(tempCanvas, 0, 0, width, height);
            }

            const imgData = fryCtx.getImageData(0, 0, width, height);
            const data = imgData.data;

            for (let i = 0; i < data.length; i += 4) {
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];

                r = Math.min(255, r + intensity * 30);
                g = Math.min(255, g + intensity * 20);
                b = Math.max(0, b - intensity * 20);

                const noise = (Math.random() - 0.5) * intensity * 25;
                data[i] = Math.min(255, r + noise);
                data[i + 1] = Math.min(255, g + noise);
                data[i + 2] = Math.min(255, b + noise);
            }

            fryCtx.putImageData(imgData, 0, 0);
            const output = fryCanvas.toBuffer("image/png");
            const attachment = new AttachmentBuilder(output, { name: `deepfried.png` });

            await interaction.editReply({
                content: 'DEEPFRIED!!!!!',
                files: [attachment],
            });

        } catch (error) {
            console.error("Deepfry error:", error);
            await interaction.editReply({
                content: "Could not process the image. Make sure it's a valid image under 10MB."
            });
        }
    }
};