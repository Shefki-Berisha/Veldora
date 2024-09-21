"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCommand = void 0;
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
exports.setupCommand = {
    name: "setup",
    description: "Setup verification",
    execute: async (message) => {
        const args = message.content.split(" ");
        const firstArg = args[1];
        const member = message.guild?.members.cache.get(message.author.id);
        if (!member?.permissions.has("Administrator")) {
            await message.reply("Only Administrators can use this command.");
            return;
        }
        const db = index_1.mongoClient.db('Veldora');
        const rolesCollection = db.collection('Verification');
        if (firstArg === "--disable") {
            try {
                let query = ({ guildID: message.guildId });
                await rolesCollection.deleteOne({ query });
                await message.reply("Verification has been disabled.");
                return;
            }
            catch (err) {
                console.log(err);
                await message.reply("There was an error. You can report it in our support server.");
                return;
            }
        }
        let query = ({ guildID: message.guildId });
        if (await rolesCollection.findOne({ guildID: message.guildId })) {
            await message.reply("Verification is already setup. Did you mean `!setup --disable`?");
            return;
        }
        const setupModal = new discord_js_1.ModalBuilder()
            .setCustomId('setupModal')
            .setTitle('Setup Verification');
        const setupInput = new discord_js_1.TextInputBuilder()
            .setCustomId('setupInput')
            .setLabel('Code, Use `random` for a random string')
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true);
        const setupRole = new discord_js_1.TextInputBuilder()
            .setCustomId("setupRole")
            .setLabel("Enter verification role ID")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true);
        const setupUnverified = new discord_js_1.TextInputBuilder()
            .setCustomId("setupUnverified")
            .setLabel("Enter unverified role ID")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true);
        const setupChannel = new discord_js_1.TextInputBuilder()
            .setCustomId("setupChannel")
            .setLabel("Enter verification channel ID")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true);
        const setupActionRow1 = new discord_js_1.ActionRowBuilder().addComponents(setupInput);
        const setupActionRow2 = new discord_js_1.ActionRowBuilder().addComponents(setupRole);
        const setupActionRow3 = new discord_js_1.ActionRowBuilder().addComponents(setupUnverified);
        const setupActionRow4 = new discord_js_1.ActionRowBuilder().addComponents(setupChannel);
        setupModal.addComponents(setupActionRow1, setupActionRow2, setupActionRow3, setupActionRow4);
        const button = new discord_js_1.ActionRowBuilder()
            .setComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('setupButton')
            .setLabel('Setup')
            .setStyle(discord_js_1.ButtonStyle.Success));
        const msg = await message.reply({ content: 'Click the button below to setup verification', components: [button] });
        const collector = msg.createMessageComponentCollector({ time: 30000 });
        collector.on("collect", async (i) => {
            if (i.customId === "setupButton") {
                if (i.user.id !== message.author.id) {
                    return await i.reply({ content: "⚠️ You are not the author.", ephemeral: true });
                }
                await i.showModal(setupModal);
                const filter = (interaction) => interaction.isModalSubmit() && interaction.customId === 'setupModal' && interaction.user.id === message.author.id;
                i.client.on('interactionCreate', async (interaction) => {
                    if (filter(interaction)) {
                        const mI = interaction;
                        const respondCode = mI.fields.getTextInputValue("setupInput");
                        const respondRole = mI.fields.getTextInputValue("setupRole");
                        const verifRole = message.guild?.roles.cache.get(respondRole);
                        const respondUnverified = mI.fields.getTextInputValue("setupUnverified");
                        const unverifRole = message.guild?.roles.cache.get(respondUnverified);
                        const respondChannel = mI.fields.getTextInputValue("setupChannel");
                        const verifChannel = message.guild?.channels.cache.get(respondChannel);
                        if (!verifRole) {
                            return await mI.reply({ content: "⚠️ Invalid verified role ID.", ephemeral: true });
                        }
                        if (!unverifRole) {
                            return await mI.reply({ content: "⚠️ Invalid unverified role ID.", ephemeral: true });
                        }
                        if (!verifChannel) {
                            return await mI.reply({ content: "⚠️ Invalid channel ID.", ephemeral: true });
                        }
                        await rolesCollection.insertOne({
                            guildID: message.guildId,
                            code: respondCode,
                            role: respondRole,
                            unverified: respondUnverified,
                            channel: respondChannel
                        });
                        await mI.reply({ content: `✅ Verification setup complete.\nRun ` + "`!setup --disable` to disable the verification system.", ephemeral: true });
                        await msg.delete().catch(() => { });
                    }
                });
            }
        });
    }
};
