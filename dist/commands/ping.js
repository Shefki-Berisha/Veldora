"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pingCommand = void 0;
exports.pingCommand = {
    name: 'ping',
    description: 'Ping the bot',
    execute: async (message) => {
        await message.reply(`Pong! ${Date.now() - message.createdTimestamp}ms`);
    },
};
