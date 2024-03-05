"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
const discord_js_1 = require("discord.js");
class CustomizeEmbed {
    books = Object.create({});
    constructor() { }
    async pagify(ctx, Embeds, middleButtons) {
        if (Embeds.length > 1) {
            const buttons = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("pg_left")
                .setEmoji("◀")
                .setStyle(discord_js_1.ButtonStyle.Secondary), ...middleButtons, new discord_js_1.ButtonBuilder()
                .setCustomId("pg_right")
                .setEmoji("▶")
                .setStyle(discord_js_1.ButtonStyle.Secondary));
            let msg = await ctx.reply({
                embeds: [Embeds[0]],
                components: [buttons]
            });
            let id = (await msg.fetch()).id;
            this.addBook(id, Embeds, buttons);
            return msg;
        }
        else {
            return ctx.reply({
                embeds: [Embeds[0]]
            });
        }
    }
    async editPagifyReply(m, Embeds, middleButtons = []) {
        if (Embeds.length > 1) {
            const buttons = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("pg_left")
                .setEmoji("◀")
                .setStyle(discord_js_1.ButtonStyle.Secondary), ...middleButtons, new discord_js_1.ButtonBuilder()
                .setCustomId("pg_right")
                .setEmoji("▶")
                .setStyle(discord_js_1.ButtonStyle.Secondary));
            let msg = await m.edit({
                embeds: [Embeds[0]],
                components: [buttons]
            });
            let id = (await msg.fetch()).id;
            this.addBook(id, Embeds, buttons);
            return msg;
        }
        else {
            return m.edit({
                embeds: [Embeds[0]],
                components: [new discord_js_1.ActionRowBuilder()
                        .addComponents(middleButtons)]
            });
        }
    }
    addBook(id, embeds, buttons) {
        let data = new Book(id, embeds, buttons);
        this.books[id] = data;
        setTimeout(() => {
            this.books[id] = undefined;
        }, 1000 * 60);
    }
}
exports.default = CustomizeEmbed;
class Book {
    tag = "";
    pages = [];
    buttons;
    current_page = 0;
    constructor(tag, pages, buttons) {
        this.tag = tag;
        this.pages = pages;
        this.buttons = buttons;
    }
    next() {
        this.current_page += 1;
        if (this.current_page > (this.pages.length - 1)) {
            this.current_page = 0;
        }
        return this.pages[this.current_page];
    }
    before() {
        this.current_page -= 1;
        if (this.current_page < 0) {
            this.current_page = (this.pages.length - 1);
        }
        return this.pages[this.current_page];
    }
}
exports.Book = Book;
