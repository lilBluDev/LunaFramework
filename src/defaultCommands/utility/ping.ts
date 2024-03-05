import { CommandInteraction, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import LunaClient from "../..";
import { CommandBase, ECommandOptionTypes } from "../../base/CommandBase";

export default class Ping extends CommandBase {
    constructor() {
        super({
            description: "Pong! get the latency of the bot!",
            options: []
        })
    }

    public async run(client: LunaClient, interaction: CommandInteraction): Promise<void> {
        let start = Date.now()
        const r = await interaction.reply('🏓 | Pinging...');

        r.edit({
            content: '',
            embeds: [
                new EmbedBuilder()
                .setColor("Random")
                .setDescription(`🏓 | Pong! \nWS Ping: ${client.ws.ping}ms\nAPI ping: ${Date.now() - start}ms`)
            ]
        })
    }
}