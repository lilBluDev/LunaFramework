"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmMessage = void 0;
const discord_js_1 = require("discord.js");
const events_1 = __importDefault(require("events"));
class ConfirmMessage extends events_1.default {
    collector;
    constructor(ctx, Secondary) {
        super();
        if (ctx.isRepliable()) {
            // if (!Secondary ) {
            ctx.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor('Random')
                        .setTitle('Confirmation!')
                        .setDescription(typeof Secondary === 'string' ? Secondary : Secondary?.message)
                ],
                components: [
                    new discord_js_1.ActionRowBuilder()
                        .addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId('confirmed')
                        .setLabel('Yes')
                        .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
                        .setCustomId('canceled')
                        .setLabel('No')
                        .setStyle(discord_js_1.ButtonStyle.Danger))
                ],
                //@ts-expect-error
                ephemeral: (Secondary && Secondary?.ephemeral) ? Secondary.ephemeral : false
            }).then((v) => {
                //@ts-expect-error
                this.collector.on('collect', async (i) => {
                    let r = await i.deferUpdate({ fetchReply: true });
                    if (i.customId === "confirmed") {
                        r.edit({
                            content: 'Processing...',
                            components: [
                                new discord_js_1.ActionRowBuilder()
                                    .addComponents(new discord_js_1.ButtonBuilder()
                                    .setCustomId('confirmed')
                                    .setLabel('Yes')
                                    .setStyle(discord_js_1.ButtonStyle.Primary)
                                    .setDisabled(true), new discord_js_1.ButtonBuilder()
                                    .setCustomId('canceled')
                                    .setLabel('No')
                                    .setStyle(discord_js_1.ButtonStyle.Danger)
                                    .setDisabled(true))
                            ]
                        });
                        this.emit('confirmed', i, r);
                    }
                    else {
                        r.edit({
                            content: 'Canceled',
                            embeds: [
                                new discord_js_1.EmbedBuilder()
                                    .setColor('Random')
                                    .setTitle('Canceled!')
                            ],
                            components: []
                        });
                        this.emit('canceled', i, r);
                    }
                });
            });
        }
        else if (typeof ctx === 'object') { }
    }
}
exports.ConfirmMessage = ConfirmMessage;
