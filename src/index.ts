import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, GatewayIntentBits, TextChannel } from 'discord.js';
import { Command } from './types';
import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { setupCommand } from './commands/setup';
import { verifyCommand } from './commands/verify';
import { pingCommand } from './commands/ping';
import { testCommand } from './commands/captchatest';
import { helpCommand } from './commands/help';
import { feedbackCommand } from './commands/feedback';
import os = require('os');
import fs = require('fs');

dotenv.config();

export const client = new Client({
	intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
	],
});

const prefix = '!'; // Command prefix
const commands: Command[] = [setupCommand, verifyCommand, testCommand, pingCommand, helpCommand, feedbackCommand];

client.once('ready', () => {
		console.log(`Logged in as ${client.user?.tag}!`);
		client.user?.setPresence({
			activities: [{ name: '!help', type: 0 }],
			status: 'online'
	});
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

client.on('messageCreate', async (message) => {
	if (message.author.bot || !message.content.startsWith(prefix)) return;
	if (!(message.channel instanceof TextChannel)) return;
	if (message.channel.isDMBased()) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift()?.toLowerCase();

	const command = commands.find(cmd => cmd.name === commandName);
	if (command) {
		try {
			await command.execute(message, args);
		} catch (error) {
			console.error('Error executing command:', error);
			return;
		}
	}
});

const uri = process.env.MONGO_URI;
if (!uri) {
	throw new Error('MongoDB URI not found');
}

export const mongoClient = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await mongoClient.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        setTimeout(connectToDatabase, 5000); // Retry connection after 5 seconds
    }
}

connectToDatabase().catch(console.error);

client.on("guildMemberAdd", async (member) => {
	const db = mongoClient.db('Veldora');
	const rolesCollection = db.collection('Verification');
	const collection = await rolesCollection.findOne({ guildID: member.guild.id });
	if (!collection) {
		return;
	}
	const role = member.guild.roles.cache.get(collection.role);
	if (!role) {
		return;
	}
	try {
		await member.roles.add(role);
	} catch (error) {
		console.error('Error adding role:', error);
	}
});

client.on("guildCreate", async (guild) => {
	const owner = await guild.fetchOwner();
	if (!owner) {
		return;
	}
	const embed = new EmbedBuilder()
	.setTitle("Veldora's Verification")
	.setDescription("Thanks for inviting Veldora!\nVeldora uses Captcha verification to protect against bots and spam.\nTo get started, use `!setup` to set up your server's verification.\n\nThank you for using Veldora!")
	.setThumbnail("https://i.ibb.co/vvsYRgQ/Untitled-design-5.png")
	.setFooter({ text: "Veldora 2024", iconURL: "https://i.ibb.co/vvsYRgQ/Untitled-design-5.png" })
	.addFields({ name: "Why use Veldora?", value: "Veldora uses advanced Captcha verification that can protect against bots, even a normal human might have a little trouble passing Veldora's harsh verification." })
	.addFields({ name: "Need Help?", value: "Try `!help` or Join our support server by clicking the button below." })
	.setColor([114,137,218]);

	const button = new ActionRowBuilder<ButtonBuilder>()
	.addComponents(
		new ButtonBuilder()
		.setLabel("Support Server")
		.setStyle(ButtonStyle.Link)
		.setURL("https://discord.gg/ABUaV7gkju"),
	)

	await owner.send({ embeds: [embed], components: [button] });
});

client.on("guildDelete", async (guild) => {
	const db = mongoClient.db('Veldora');
	const rolesCollection = db.collection('Verification');
	const collection = await rolesCollection.findOne({ guildID: guild.id });
	if (!collection) {
		return;
	}
	let query = ({ guildID: guild.id });
	await rolesCollection.deleteOne({ query });
	console.log('Guild deleted:', guild.name);
});


client.login(process.env.TOKEN);