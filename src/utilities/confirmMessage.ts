import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, CommandInteraction, ComponentType, EmbedBuilder, Interaction, InteractionCollector, InteractionResponse, RepliableInteraction } from "discord.js";
import EventEmitter from "events";

interface ConfirmMessageMainOptions {
    ctx: Interaction
    message: string
    ephemeral?: boolean
}

interface ConfirmMessageSecondaryOptions {
    message: string,
}


export class ConfirmMessage extends EventEmitter {
    collector?: InteractionCollector<ButtonInteraction<CacheType>>

    constructor(ctx: Interaction | ConfirmMessageMainOptions, Secondary?: ConfirmMessageSecondaryOptions | string) {
        super()
        if ((ctx as Interaction).isRepliable()) {
            // if (!Secondary ) {
            (ctx as RepliableInteraction).reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Random')
                        .setTitle('Confirmation!')
                        .setDescription(typeof Secondary === 'string' ? Secondary : Secondary?.message as string)
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('confirmed')
                                .setLabel('Yes')
                                .setStyle(ButtonStyle.Primary),

                            new ButtonBuilder()
                                .setCustomId('canceled')
                                .setLabel('No')
                                .setStyle(ButtonStyle.Danger)
                        )
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
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('confirmed')
                                            .setLabel('Yes')
                                            .setStyle(ButtonStyle.Primary)
                                            .setDisabled(true),

                                        new ButtonBuilder()
                                            .setCustomId('canceled')
                                            .setLabel('No')
                                            .setStyle(ButtonStyle.Danger)
                                            .setDisabled(true)
                                    )
                            ]
                        })

                        this.emit('confirmed', i, r)
                    } else {
                        r.edit({
                            content: 'Canceled',
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Random')
                                    .setTitle('Canceled!')
                            ],
                            components: []
                        })
                        this.emit('canceled', i, r)
                    }
                })
            })
        } else if (typeof ctx === 'object') {}
    }
}