"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpCommand = void 0;
const discord_js_1 = require("discord.js");
exports.helpCommand = {
    name: 'help',
    description: 'Get help with Veldora',
    execute: async (message) => {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle("Veldora's Verification")
            .setDescription("Veldora uses Captcha verification to protect against bots and spam.\nTo get started, use `!setup` to set up your server's verification.\n\nThank you for using Veldora!")
            .addFields({ name: "Commands", value: "`!setup, !verify, !ping, !help`" })
            .setThumbnail("https://i.ibb.co/vvsYRgQ/Untitled-design-5.png")
            .setFooter({ text: "Veldora 2024", iconURL: "https://i.ibb.co/vvsYRgQ/Untitled-design-5.png" })
            .setColor([114, 137, 218]);
        await message.author.send({ embeds: [embed] }).catch(async () => { await message.reply("Please enable your DMs."); });
        await message.react("✅").catch(() => { });
    }
};
