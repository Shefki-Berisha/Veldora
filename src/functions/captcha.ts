import {
    Client,
    Events,
    AttachmentBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    InteractionCollector,
    ModalSubmitInteraction,
    Message,
    User,
    GuildMember,
    TextChannel,
    DMChannel
} from "discord.js";
import { CaptchaGenerator } from "captcha-canvas";
import { mongoClient } from "../index";

const MAX_ATTEMPTS = 3;
let userAttempts = 0;
let alrVerifying = false;

export async function captcha(text: string, toReply: Message, author: User | GuildMember): Promise<boolean> {
    if (!text || !toReply || !author) throw new Error("Invalid arguments");
    if (alrVerifying === true) {
        await toReply.reply({ content: "You've automatically failed the verification for trying to abuse the `!verify` command. You can try later." });
        return false;
    }

    if (toReply.channel === null) return false;

    const db = mongoClient.db('discordBot');
    const rolesCollection = db.collection('Verification');

    let output = false;
    let capText = "";

    if (text.toLowerCase() === "random") {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%*()";
        capText = Array.from({ length: 9 }, () => alphabet.charAt(Math.floor(Math.random() * alphabet.length))).join('');
    } else {
        capText = text;
    }

    const captcha = new CaptchaGenerator()
        .setDimension(150, 450)
        .setCaptcha({
            text: capText,
            size: 53,
            color: "gray"
        })
        .setDecoy({
            opacity: 0.4,
            size: 25,
            color: "gray"
        })
        .setTrace({
            color: "rgba(0, 0, 0, 0.1)",
            opacity: 0.8,
            size: 10
        });

    const captchaBuffer = Buffer.from(captcha.generateSync());
    const attachment = new AttachmentBuilder(captchaBuffer, { name: "captcha.png" });

    const timestamp = Date.now() + 60000;
    const hammertime = Math.floor(timestamp / 1000);

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setImage('attachment://captcha.png')
        .setDescription(`❗ This server uses Veldora for security against bots. \n${author} Please solve the captcha to ensure you're not a bot. It is case sensitive.\n\n\nYour time will expire <t:${hammertime}:R>`);

    const button = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(
            new ButtonBuilder()
                .setCustomId('captchabutton')
                .setLabel(`📫 Click Here To Verify Yourself`)
                .setStyle(ButtonStyle.Danger),
        );

    let msg: Message | undefined;
    let repliedMsg: Message | undefined;
    if (toReply.channel instanceof TextChannel || toReply.channel instanceof DMChannel) {
        msg = await author.send({ embeds: [embed], files: [attachment], components: [button] });
        repliedMsg = await toReply.reply({ content: "Please check your DMs.\n`If you don't see it, please enable your DMs.`" });
        alrVerifying = true;
    } else {
        return false;
    }

    // Clean up existing collectors
    const collector = new InteractionCollector(toReply.client, { message: msg, time: 60000 });
    const modalCollector = new InteractionCollector(toReply.client);

    collector.once("collect", async (i: ButtonInteraction) => {
        if (i.customId === "captchabutton") {
            if (author !== i.user) return await i.reply({ content: "⚠️ This is not your verification.", ephemeral: true });

            const capModal = new ModalBuilder()
                .setTitle("Submit Captcha Answer Here")
                .setCustomId("captchaModal");

            const answer = new TextInputBuilder()
                .setCustomId("captchaAnswer")
                .setLabel("Your Captcha Answer")
                .setPlaceholder("Enter your answer here")
                .setStyle(TextInputStyle.Short);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(answer);
            capModal.addComponents(row);
            await i.showModal(capModal);

            // Ensure only one collector is active
            modalCollector.once("collect", async (mI: ModalSubmitInteraction) => {
                if (mI.customId === "captchaModal") {
                    if (mI.user !== i.user) return (await mI.reply({ content: "⚠️ This is not your verification.", ephemeral: true }));
                    const respondAns = mI.fields.getTextInputValue("captchaAnswer").trim();

                    if (respondAns !== capText) {
                        userAttempts += 1;

                        if (userAttempts >= MAX_ATTEMPTS) {
                            await mI.reply({ content: "❌ You have failed the verification. You may try again later.", ephemeral: true });
                            await msg.delete().catch(() => {});
                            await toReply.reactions.removeAll().catch(() => {});
                            await toReply.react("❌");
                            alrVerifying = false;
                            output = false;
                            return;
                        } else {
                            await mI.reply({ content: `❌ Incorrect answer. You have ${MAX_ATTEMPTS - userAttempts} tries left.`, ephemeral: true });
                        }
                    } else {
                        output = true;
                        await mI.reply({ content: `✅ The answer you provided is correct.` });
                        await toReply.react("✅").catch(() => {});
                        await repliedMsg.delete().catch(() => {});
                        await msg.delete().catch(() => {});
                        alrVerifying = false;
                    }
                }
            });
        }
    });

    const timeoutPromise = new Promise<void>((_, reject) => setTimeout(async () => {
        await msg.delete().catch(() => {});
        output = false;
        console.log("Captcha timeout");
        reject("Captcha timeout");
        alrVerifying = false;
    }, 60000));

    await Promise.race([timeoutPromise, new Promise<void>(resolve => {
        const interval = setInterval(() => {
            if (output) {
                clearInterval(interval);
                resolve();
            }
        }, 1000);
    })]);

    collector.stop();
    modalCollector.stop();

    return output;
}