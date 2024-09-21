"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captcha = captcha;
const discord_js_1 = require("discord.js");
const captcha_canvas_1 = require("captcha-canvas");
const index_1 = require("../index");
const rateLimit = new Map();
const RATE_LIMIT_TIME = 60000;
const MAX_ATTEMPTS = 3;
async function captcha(text, toReply, author) {
    if (!text || !toReply || !author)
        throw new Error("Invalid arguments");
    if (toReply.channel === null)
        return;
    const db = index_1.mongoClient.db('discordBot');
    const rolesCollection = db.collection('Verification');
    let output = false;
    let capText = "";
    const now = Date.now();
    const userAttempts = rateLimit.get(author.id) || { attempts: 0, lastAttempt: now };
    if (now - userAttempts.lastAttempt < RATE_LIMIT_TIME && userAttempts.attempts >= MAX_ATTEMPTS) {
        return await toReply.reply({ content: "⏳ You are trying too frequently. Please wait a minute before trying again." });
    }
    if (now - userAttempts.lastAttempt > RATE_LIMIT_TIME) {
        userAttempts.attempts = 0;
    }
    if (text.toLowerCase() === "random") {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        capText = Array.from({ length: 9 }, () => alphabet.charAt(Math.floor(Math.random() * alphabet.length))).join('');
    }
    else {
        capText = text;
    }
    const captcha = new captcha_canvas_1.CaptchaGenerator()
        .setDimension(150, 450)
        .setCaptcha({
        text: capText,
        size: 53,
        color: "gray"
    })
        .setDecoy({
        opacity: 0.7,
        size: 30,
        color: "gray"
    })
        .setTrace({
        color: "rgba(0, 0, 0, 0.1)",
        opacity: 0.8,
        size: 10
    });
    const captchaBuffer = Buffer.from(captcha.generateSync());
    const attachment = new discord_js_1.AttachmentBuilder(captchaBuffer, { name: "captcha.png" });
    const timestamp = Date.now() + 60000;
    const hammertime = Math.floor(timestamp / 1000);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("Red")
        .setImage('attachment://captcha.png')
        .setDescription(`❗ This server uses Veldora for security against bots. \n${author} Please solve the captcha to ensure you're not a bot. It is case sensitive.\n\n\nYour time will expire <t:${hammertime}:R>`);
    const button = new discord_js_1.ActionRowBuilder()
        .setComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('captchabutton')
        .setLabel(`📫 Click Here To Verify Yourself`)
        .setStyle(discord_js_1.ButtonStyle.Danger));
    let msg;
    let repliedMsg;
    if (toReply.channel instanceof discord_js_1.TextChannel || toReply.channel instanceof discord_js_1.DMChannel) {
        msg = await author.send({ embeds: [embed], files: [attachment], components: [button] });
        repliedMsg = await toReply.reply({ content: "Please check your DMs.\n`If you don't see it, please enable your DMs.`" });
    }
    else {
        return;
    }
    const collector = new discord_js_1.InteractionCollector(toReply.client, { message: msg, time: 60000 });
    const modalCollector = new discord_js_1.InteractionCollector(toReply.client);
    collector.on("collect", async (i) => {
        if (i.customId === "captchabutton") {
            if (author !== i.user)
                return await i.reply({ content: "⚠️ This is not your verification.", ephemeral: true });
            const capModal = new discord_js_1.ModalBuilder()
                .setTitle("Submit Captcha Answer Here")
                .setCustomId("captchaModal");
            const answer = new discord_js_1.TextInputBuilder()
                .setCustomId("captchaAnswer")
                .setLabel("Your Captcha Answer")
                .setPlaceholder("Enter your answer here")
                .setStyle(discord_js_1.TextInputStyle.Short);
            const row = new discord_js_1.ActionRowBuilder().addComponents(answer);
            capModal.addComponents(row);
            await i.showModal(capModal);
            modalCollector.on("collect", async (mI) => {
                if (mI.customId === "captchaModal") {
                    if (mI.user !== i.user)
                        return await mI.reply({ content: "⚠️ This is not your verification.", ephemeral: true });
                    const respondAns = mI.fields.getTextInputValue("captchaAnswer").trim();
                    if (respondAns !== capText) {
                        userAttempts.attempts += 1;
                        userAttempts.lastAttempt = now;
                        if (userAttempts.attempts >= 3) {
                            await mI.reply({ content: "❌ You have failed the verification. You may try again in 1 minute.", ephemeral: true });
                            await msg.delete().catch(() => { });
                            await toReply.reactions.removeAll().catch(() => { });
                            await toReply.react("❌");
                            return;
                        }
                        else {
                            await mI.reply({ content: `❌ Incorrect answer. You have ${MAX_ATTEMPTS - userAttempts.attempts} tries left.`, ephemeral: true });
                        }
                    }
                    else {
                        await mI.reply({ content: `✅ The answer you provided is correct.`, ephemeral: true });
                        await repliedMsg.delete().catch(() => { });
                        await msg.delete().catch(() => { });
                        output = true;
                    }
                }
            });
        }
    });
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => {
        console.log("Captcha timeout");
        reject("Captcha timeout");
    }, 60000));
    await Promise.race([timeoutPromise, new Promise(resolve => {
            const interval = setInterval(() => {
                if (output) {
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
        })]);
    collector.stop();
    modalCollector.stop();
}
