import { Client } from "discord.js";

import ready from "./event/ready";
import interactionCreate from "./event/interactionCreate";

import dotenv from "dotenv";
dotenv.config(); // Load .env file

console.log("Bot is starting...");

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Error: DISCORD_TOKEN not set in environment variables!");
  process.exit(1);
}

const client = new Client({
  intents: []
});

ready(client);
interactionCreate(client);

client.login(token);