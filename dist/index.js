"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoClient = exports.client = exports.app = void 0;
const discord_js_1 = require("discord.js");
const dotenv = require("dotenv");
const mongodb_1 = require("mongodb");
const setup_1 = require("./commands/setup");
const verify_1 = require("./commands/verify");
const ping_1 = require("./commands/ping");
const captchatest_1 = require("./commands/captchatest");
const express = require("express");
const fs = require("fs");
dotenv.config();
exports.app = express();
exports.app.enable("trust proxy");
exports.app.set("etag", false);
exports.app.use(express.static(__dirname + "/website"));
exports.client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
const prefix = '!'; // Command prefix
const commands = [setup_1.setupCommand, verify_1.verifyCommand, captchatest_1.testCommand, ping_1.pingCommand];
exports.client.once('ready', () => {
    console.log(`Logged in as ${exports.client.user?.tag}!`);
    exports.client.user?.setPresence({
        activities: [{ name: '!help', type: 0 }],
        status: 'online'
    });
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
exports.client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix))
        return;
    if (message.channel.isDMBased())
        return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    const command = commands.find(cmd => cmd.name === commandName);
    if (command) {
        try {
            await command.execute(message, args);
        }
        catch (error) {
            console.error('Error executing command:', error);
            return;
        }
    }
});
const uri = process.env.MONGO_URI;
if (!uri) {
    throw new Error('MongoDB URI not found');
}
exports.mongoClient = new mongodb_1.MongoClient(uri);
async function connectToDatabase() {
    try {
        await exports.mongoClient.connect();
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        setTimeout(connectToDatabase, 5000); // Retry connection after 5 seconds
    }
}
connectToDatabase().catch(console.error);
exports.client.on("guildMemberAdd", async (member) => {
    const db = exports.mongoClient.db('Veldora');
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
    }
    catch (error) {
        console.error('Error adding role:', error);
    }
});
exports.client.on("guildCreate", async (guild) => {
    const owner = await guild.fetchOwner();
    if (!owner) {
        return;
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle("Veldora's Verification")
        .setDescription("Thanks for inviting Veldora!\nVeldora uses Captcha verification to protect against bots and spam.\nTo get started, use `!setup` to set up your server's verification.\n\nThank you for using Veldora!")
        .setThumbnail("https://i.ibb.co/vvsYRgQ/Untitled-design-5.png")
        .setFooter({ text: "Veldora 2024", iconURL: "https://i.ibb.co/vvsYRgQ/Untitled-design-5.png" })
        .addFields({ name: "Why use Veldora?", value: "Veldora uses advanced Captcha verification that can protect against bots, even a normal human might have a little trouble passing Veldora's harsh verification." })
        .addFields({ name: "Need Help?", value: "Join our support server by clicking the button below." })
        .setColor([114, 137, 218]);
    const button = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(discord_js_1.ButtonStyle.Link)
        .setURL("https://discord.gg/ABUaV7gkju"));
    await owner.send({ embeds: [embed], components: [button] });
});
exports.client.on("guildDelete", async (guild) => {
    const db = exports.mongoClient.db('Veldora');
    const rolesCollection = db.collection('Verification');
    const collection = await rolesCollection.findOne({ guildID: guild.id });
    if (!collection) {
        return;
    }
    let query = ({ guildID: guild.id });
    await rolesCollection.deleteOne({ query });
    console.log('Guild deleted:', guild.name);
});
let files = fs.readdirSync("./src/website/public").filter(f => f.endsWith(".js"));
files.forEach(f => {
    const file = require(`./src/website/public/${f}`);
    if (file && file.name) {
        exports.app.get(file.name, file.run);
        console.log("[DASHBOARD] - Loaded ", +file.name);
    }
});
/*
app.use((req, res, next) => {
    console.log(`- ${req.method}: ${req.url} ${req.statusCode} ( by: ${req.ip} )`);
    next();
});
*/
exports.app.get('/', async (req, res) => {
    res.sendFile('./website/html/home.html', { root: __dirname });
});
exports.client.login(process.env.TOKEN);
exports.app.listen(80, () => console.log("Listening on port 80"));
