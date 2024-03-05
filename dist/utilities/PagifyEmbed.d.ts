import { ActionRowBuilder, ButtonBuilder, CommandInteraction, EmbedBuilder, InteractionResponse, Message } from "discord.js";
export default class CustomizeEmbed {
    books: any;
    constructor();
    pagify(ctx: CommandInteraction, Embeds: EmbedBuilder[], middleButtons: ButtonBuilder[]): Promise<InteractionResponse<boolean>>;
    editPagifyReply(m: Message, Embeds: EmbedBuilder[], middleButtons?: ButtonBuilder[]): Promise<Message<boolean>>;
    private addBook;
}
export declare class Book {
    tag: string;
    pages: EmbedBuilder[];
    buttons: ActionRowBuilder<ButtonBuilder>;
    current_page: number;
    constructor(tag: string, pages: EmbedBuilder[], buttons: ActionRowBuilder<ButtonBuilder>);
    next(): EmbedBuilder;
    before(): EmbedBuilder;
}
