import { Message } from 'discord.js';
import { Command } from '../types';
import { client } from '../index';


export const pingCommand: Command = {
    name: 'ping',
    description: 'Ping the bot',
    execute: async (message: Message) => {
        await message.reply(`Pong! ${Date.now() - message.createdTimestamp}ms`);
    },
}