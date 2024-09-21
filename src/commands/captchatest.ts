import { Message, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import { mongoClient } from '../index';
import { captcha } from '../functions/captcha';

export const testCommand: Command = {
    name: 'captchatest',
    description: 'Test captcha',
    execute: async (message: Message): Promise<void> => {

        if (message.author.id !== '856196104385986560') {
            return;
        }

        await captcha('random', message, message.author);
        if (!captcha) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        await message.reply({ content: '✅ Verification complete.' });

        try {
            const completedEmbed = new EmbedBuilder()
            .setTitle(`✅ Successfully Completed Verification In ${message.guild?.name}`)
            .setColor("Red")
            await message.author.send({ embeds: [completedEmbed] }).catch(() => {});
        } catch (err) {
            console.log(err);
            await message.reply({ content: "❌ There was an error." });
        }

    }
}