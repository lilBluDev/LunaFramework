"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const CommandBase_1 = require("../../base/CommandBase");
class Ping extends CommandBase_1.CommandBase {
    constructor() {
        super({
            description: "Pong! get the latency of the bot!",
            options: []
        });
    }
    async run(client, interaction) {
        let start = Date.now();
        const r = await interaction.reply('🏓 | Pinging...');
        r.edit({
            content: '',
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setColor("Random")
                    .setDescription(`🏓 | Pong! \nWS Ping: ${client.ws.ping}ms\nAPI ping: ${Date.now() - start}ms`)
            ]
        });
    }
}
exports.default = Ping;
