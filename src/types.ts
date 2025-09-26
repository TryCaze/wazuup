import { ChatInputApplicationCommandData, MessageApplicationCommandData, CommandInteraction, MessageContextMenuCommandInteraction, Client } from "discord.js";

// ChatInput (slash command)
export interface ChatInputCommand extends ChatInputApplicationCommandData {
  type: 1; // ApplicationCommandType.ChatInput
  run: (client: Client, interaction: CommandInteraction) => void | Promise<void>;
}

// Message context menu
export interface MessageContextCommand extends MessageApplicationCommandData {
  type: 3; // ApplicationCommandType.Message
  run: (client: Client, interaction: MessageContextMenuCommandInteraction) => void | Promise<void>;
}

// Unified command type
export type command = ChatInputCommand | MessageContextCommand;