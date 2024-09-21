"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCommand = void 0;
const discord_js_1 = require("discord.js");
const captcha_1 = require("../functions/captcha");
exports.testCommand = {
    name: 'captchatest',
    description: 'Test captcha',
    execute: async (message) => {
        if (message.author.id !== '856196104385986560') {
            return;
        }
        await (0, captcha_1.captcha)('random', message, message.author);
        if (!captcha_1.captcha) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        await message.reply({ content: '✅ Verification complete.' });
        try {
            const completedEmbed = new discord_js_1.EmbedBuilder()
                .setTitle(`✅ Successfully Completed Verification In ${message.guild?.name}`)
                .setColor("Red");
            await message.author.send({ embeds: [completedEmbed] }).catch(() => { });
        }
        catch (err) {
            console.log(err);
            await message.reply({ content: "❌ There was an error." });
        }
    }
};
