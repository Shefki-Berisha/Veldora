import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ModalSubmitInteraction, Interaction } from 'discord.js';
import { Command } from '../types';
import { client } from '..';

export const feedbackCommand: Command = {
    name: 'feedback',
    description: 'Send feedback on Veldora',
    execute: async (message: Message) => {
        const feedback = message.content.slice(9);

        const embed = new EmbedBuilder()
            .setTitle("Feedback from " + message.author.username)
            .addFields({ name: "Message", value: feedback })
            .addFields({ name: "Server", value: message.guild?.name || "Unknown" })
            .addFields({ name: "User ID", value: message.author.id })
            .setThumbnail(message.author.displayAvatarURL())
            .setColor([114,137,218])
            .setAuthor({ name: "Veldora", iconURL: "https://i.ibb.co/vvsYRgQ/Untitled-design-5.png" })
            .setTimestamp();

        const feedBackChannel = client.channels.cache.get('1287201564402126879') as TextChannel;

        let msg = await feedBackChannel.send({ embeds: [embed] });

        await message.reply({ content: "Your feedback has been sent successfully. Thank you!" });
    }
}