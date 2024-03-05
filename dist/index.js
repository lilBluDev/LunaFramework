"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const psyche_logger_1 = __importDefault(require("psyche-logger"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const CommandHandler_1 = require("./handlers/CommandHandler");
const PagifyEmbed_1 = __importDefault(require("./utilities/PagifyEmbed"));
class LunaClient extends discord_js_1.Client {
    TOKEN;
    subOps;
    commandHandler;
    disabledDefaultCommands;
    utilities;
    botFolder;
    testServers;
    readyMessage;
    constructor(token, options) {
        super(options);
        this.subOps = options;
        this.TOKEN = token;
        this.botFolder = options.botFolder;
        this.disabledDefaultCommands = options.disabledDefaultCommands ? options.disabledDefaultCommands : undefined;
        this.testServers = options.testServers ? options.testServers : [];
        this.readyMessage = options.readyMessage ? options.readyMessage : (c) => `Client is ready!`;
    }
    init() {
        this.login(this.TOKEN).then(async () => {
            await this.InitializeEnviroment(this.subOps);
            this.commandHandler?.registerCommand();
        }).finally(() => {
            this.utilities?.logger.notif("UVClient", this.readyMessage(this));
        });
    }
    // -------------- INTIGRATED -------------- \\
    async InitializeEnviroment(options) {
        this.utilities = {
            logger: new psyche_logger_1.default("botLogs.lg"),
            pagify: new PagifyEmbed_1.default()
        };
        if (!(0, fs_1.existsSync)(path_1.default.join(this.botFolder, "commands"))) {
            this.utilities.logger.warn("UVClient", "Essential folder \"commands\" not found! Making Folder...");
            (0, fs_1.mkdirSync)(path_1.default.join(this.botFolder, "commands"));
        }
        if (!(0, fs_1.existsSync)(path_1.default.join(this.botFolder, "events"))) {
            this.utilities.logger.warn("UVClient", "Essential folder \"events\" not found! Making Folder...");
            (0, fs_1.mkdirSync)(path_1.default.join(this.botFolder, "events"));
        }
        this.commandHandler = new CommandHandler_1.CommandHandler(this, this.TOKEN);
        this.InitEvents();
        this.ReadEventsFolder();
        await this.commandHandler.ReadCommandsFolder();
        if (!this.disabledDefaultCommands) {
            await this.commandHandler.ReadCommandsFolder(path_1.default.join(__dirname, "defaultCommands"), undefined);
        }
        else {
            if (this.disabledDefaultCommands.length !== 0) {
                this.utilities.logger.info("UVClient", "Disabled Default Commands:", this.disabledDefaultCommands.join(", "));
                await this.commandHandler.ReadCommandsFolder(path_1.default.join(__dirname, "defaultCommands"), undefined, this.disabledDefaultCommands);
            }
            else {
                this.utilities.logger.info("UVClient", "Disabled All Default Commands");
            }
        }
    }
    InitEvents() {
        this.on("interactionCreate", async (ctx) => {
            if (!ctx.isCommand())
                return;
            if (this.commandHandler?.commands.has(ctx.commandName)) {
                const cmd = this.commandHandler.commands.get(ctx.commandName);
                if (!cmd)
                    return;
                try {
                    let botGuild = ctx.guild?.members.cache.get(ctx.user.id);
                    if (cmd.requiredBotPermissions && botGuild.permissions.has(cmd.requiredBotPermissions)) {
                        ctx.reply({
                            ephemeral: true,
                            content: "❗ | I don't have the required permissions to run this command!"
                        });
                        return;
                    }
                    cmd.run(this, ctx);
                }
                catch (e) {
                    console.log(e);
                    ctx.reply({
                        ephemeral: true,
                        content: "❗ | Unable to run the command, please try again (if this issue keeps happening please contact the bot creator)\n\nError Message:\n```" + String(e) + "```"
                    });
                }
            }
        });
        this.on("error", (e) => {
            this.utilities?.logger.err("UVClient", String(e));
        });
        process.on('unhandledRejection', async (reason, p) => {
            if (String(reason).includes("Unknown interaction"))
                return;
            this.utilities?.logger.err("UVClient", "Unhandled Rejection at: Promise ", String(await p), "reason:", String(reason));
        });
        process.on('uncaughtException', (err) => {
            this.utilities?.logger.err("UVClient", "Uncaught Exception: ", String(err));
        });
        // process.on('rejectionHandled', (p) => {
        //     console.log(p)
        // });
    }
    ReadEventsFolder(src) {
        var fol = (0, fs_1.readdirSync)(src ? src : path_1.default.join(this.botFolder, "events"));
        for (var i = 0; i < fol.length; i++) {
            var stat = (0, fs_1.statSync)(src ? path_1.default.join(src, fol[i]) : path_1.default.join(this.botFolder, "events", fol[i]));
            if (stat.isFile() && (fol[i].endsWith(".ts") || fol[i].endsWith(".js"))) {
                const event = require(src ? path_1.default.join(src, fol[i]) : path_1.default.join(this.botFolder, "events", fol[i]));
                if (event) {
                    let eventName = fol[i].split(".")[0];
                    this.on(eventName, event.default.bind(null, this));
                }
            }
            else {
                this.ReadEventsFolder(src ? path_1.default.join(src, fol[i]) : path_1.default.join(this.botFolder, "events", fol[i]));
            }
            ;
        }
        return 0;
    }
}
exports.default = LunaClient;
