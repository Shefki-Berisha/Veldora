import { Message, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../types';
import { client } from '../index';

export const helpCommand: Command = {
    name: 'help',
    description: 'Get help with Veldora',

    execute: async (message: Message) => {
        const embed = new EmbedBuilder()
        .setTitle("Veldora's Verification")
        .setDescription("Veldora uses Captcha verification to protect against bots and spam.\nTo get started, use `!setup` to set up your server's verification.\n\nThank you for using Veldora!")
        .addFields({ name: "Commands", value: "`!setup, !verify, !ping, !help`" })
        .setThumbnail("https://i.ibb.co/vvsYRgQ/Untitled-design-5.png")
        .setFooter({ text: "Veldora 2024", iconURL: "https://i.ibb.co/vvsYRgQ/Untitled-design-5.png" })
        .setColor([114,137,218]);

        const button = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Support Server")
            .setURL("https://discord.gg/ABUaV7gkju"),
        )

        await message.author.send({ embeds: [embed], components: [button] });
        await message.react("✅").catch(() => {});
    }
}