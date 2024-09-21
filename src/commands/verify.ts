import { EmbedBuilder, Message, Role } from 'discord.js';
import { Command } from '../types';
import { mongoClient } from '../index';
import { captcha } from '../functions/captcha';

export const verifyCommand: Command = {
    name: 'verify',
    description: 'Verify yourself',
    execute: async (message: Message): Promise<void> => {
        const db = mongoClient.db('Veldora');
        const rolesCollection = db.collection('Verification');
        const user = message.author;
        const member = await message.guild?.members.fetch(user.id);
        const collection = await rolesCollection.findOne({ guildID: message.guildId });

        if (!collection) {
            await message.reply("No verification setup found for this server.\nUse `!setup` to setup verification.");
            return;
        }

        if (!member) {
            return console.log("No member found");
        }

        const verifiedRole = await message.guild?.roles.cache.find(role => role.id === collection.role);
        const unverifiedRole = await message.guild?.roles.cache.find(role => role.id === collection.unverified);
        const channel = await message.guild?.channels.cache.find(channel => channel.id === collection.channel);

        if (!verifiedRole || !unverifiedRole || !channel) {
            return;
        }

        if (message.channel.id !== channel.id) {
            return;
        }

        if (member.roles.cache.has(verifiedRole.id)) {
            return;
        }

        const captchaSuccessful = await captcha(collection.code, message, message.author);

        if (!captchaSuccessful) {
            await message.reply({ content: '❌ Verification failed. Please try again later.' });
            return;
        }

        try {
            const completedEmbed = new EmbedBuilder()
                .setTitle(`✅ Successfully Completed Verification In ${message.guild?.name}`)
                .setColor("Red");

            await member.roles.add(verifiedRole);
            await member.roles.remove(unverifiedRole);
            await user.send({ embeds: [completedEmbed] }).catch(() => {});
        } catch (err) {
            console.log(err);
            await message.reply({ content: "❌ There was an error, couldn't add verified role/remove unverified role" });
        }
    }
}