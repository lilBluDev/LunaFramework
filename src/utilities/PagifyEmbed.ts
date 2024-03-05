import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, InteractionResponse, Message } from "discord.js";

export default class CustomizeEmbed {

    public books = Object.create({})

    constructor() {}

    async pagify(ctx: CommandInteraction, Embeds: EmbedBuilder[], middleButtons: ButtonBuilder[]) {
        if (Embeds.length > 1) {
            const buttons = new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId("pg_left")
                                .setEmoji("◀")
                                .setStyle(ButtonStyle.Secondary),
    
                                ...middleButtons,
    
                                new ButtonBuilder()
                                .setCustomId("pg_right")
                                .setEmoji("▶")
                                .setStyle(ButtonStyle.Secondary)
                            )
            
                            
                            
            let msg = await ctx.reply({
                embeds: [Embeds[0]],
                components: [buttons]
            })

            let id = (await msg.fetch()).id
            this.addBook(id, Embeds, buttons)
            return msg
        } else {
            return ctx.reply({
                embeds: [Embeds[0]]
            })
        }
    }

    async editPagifyReply(m: Message, Embeds: EmbedBuilder[], middleButtons: ButtonBuilder[] = []){
        if (Embeds.length > 1) {
            const buttons = new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId("pg_left")
                                .setEmoji("◀")
                                .setStyle(ButtonStyle.Secondary),
    
                                ...middleButtons,
    
                                new ButtonBuilder()
                                .setCustomId("pg_right")
                                .setEmoji("▶")
                                .setStyle(ButtonStyle.Secondary)
                            )
            
                            
                            
            let msg = await m.edit({
                embeds: [Embeds[0]],
                components: [buttons]
            })

            let id = (await msg.fetch()).id
            this.addBook(id, Embeds, buttons)
            return msg
        } else {
            return m.edit({
                embeds: [Embeds[0]],
                components: [new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(middleButtons)]
            })
        }
    }

    private addBook(id: string, embeds: EmbedBuilder[], buttons: ActionRowBuilder<ButtonBuilder>) {
        let data: Book = new Book(id, embeds, buttons)
        this.books[id] = data

        setTimeout(() => {
            this.books[id] = undefined
        }, 1000 * 60)
    }
}

export class Book {
    public tag: string = ""
    public pages: EmbedBuilder[] = []
    public buttons: ActionRowBuilder<ButtonBuilder>
    public current_page = 0

    constructor(tag: string, pages: EmbedBuilder[], buttons: ActionRowBuilder<ButtonBuilder>) {
        this.tag = tag
        this.pages = pages
        this.buttons = buttons
    }

    next() {
        this.current_page += 1
        if (this.current_page > (this.pages.length - 1)) { this.current_page = 0 }
        return this.pages[this.current_page]
    }

    before() {
        this.current_page -= 1
        if (this.current_page < 0) { this.current_page = (this.pages.length - 1) }
        return this.pages[this.current_page]
    }
} 
