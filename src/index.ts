import { Client, ClientOptions, GuildMember, Interaction, PermissionFlagsBits } from "discord.js";
import psyche from "psyche-logger";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import { CommandHandler } from "./handlers/CommandHandler";
import CustomizeEmbed from "./utilities/PagifyEmbed";

export interface Options extends ClientOptions {
    disabledDefaultCommands?: []
    botFolder: string
    testServers?: string[]

    readyMessage?: (c: LunaClient) => string
}

export default class LunaClient extends Client {
    private TOKEN: string

    private subOps: Options

    public commandHandler: CommandHandler | undefined
    public disabledDefaultCommands: [] | undefined
    public utilities: { logger: psyche, pagify: CustomizeEmbed } | undefined
    public botFolder: string
    public testServers: string[]
    public readyMessage: (c: LunaClient) => {}

    
    constructor(token: string, options: Options) {
        super(options)

        this.subOps = options

        this.TOKEN = token
        this.botFolder = options.botFolder
        this.disabledDefaultCommands = options.disabledDefaultCommands ? options.disabledDefaultCommands : undefined
        this.testServers = options.testServers ? options.testServers : []
        this.readyMessage = options.readyMessage ? options.readyMessage : (c) => `Client is ready!`

    }
    
    init() {
        this.login(this.TOKEN).then(async () => {
            await this.InitializeEnviroment(this.subOps)
            this.commandHandler?.registerCommand();
        }).finally(() => {
            this.utilities?.logger.notif("UVClient", this.readyMessage(this) as string)
        })
    }

    
    
    // -------------- INTIGRATED -------------- \\
    
    private async InitializeEnviroment(options: Options) {
        this.utilities = {
            logger: new psyche("botLogs.lg"),
            pagify: new CustomizeEmbed()
        }
        

        if (!existsSync(path.join(this.botFolder, "commands"))) {
            this.utilities.logger.warn("UVClient", "Essential folder \"commands\" not found! Making Folder...");
            mkdirSync(path.join(this.botFolder, "commands"));
        }
        if (!existsSync(path.join(this.botFolder, "events"))) {
            this.utilities.logger.warn("UVClient", "Essential folder \"events\" not found! Making Folder...");
            mkdirSync(path.join(this.botFolder, "events"));
        }                                                               

        this.commandHandler = new CommandHandler(this, this.TOKEN as string)

        this.InitEvents()
        this.ReadEventsFolder()

        await this.commandHandler.ReadCommandsFolder();
        if (!this.disabledDefaultCommands) {
            await this.commandHandler.ReadCommandsFolder(path.join(__dirname, "defaultCommands"), undefined)
        } else {
            if (this.disabledDefaultCommands.length !== 0) {
                this.utilities.logger.info("UVClient", "Disabled Default Commands:", this.disabledDefaultCommands.join(", "))
                await this.commandHandler.ReadCommandsFolder(path.join(__dirname, "defaultCommands"), undefined, this.disabledDefaultCommands)
            } else {
                this.utilities.logger.info("UVClient", "Disabled All Default Commands")
            }

        }

    }

    private InitEvents() {
        this.on("interactionCreate", async (ctx: Interaction) => {
            if (!ctx.isCommand()) return;

            if (this.commandHandler?.commands.has(ctx.commandName)) {
                const cmd = this.commandHandler.commands.get(ctx.commandName)
                if (!cmd) return;
                try {
                    let botGuild = ctx.guild?.members.cache.get(ctx.user.id) as GuildMember
                    if (cmd.requiredBotPermissions && botGuild.permissions.has(cmd.requiredBotPermissions)) {
                        ctx.reply({
                            ephemeral: true,
                            content: "❗ | I don't have the required permissions to run this command!"
                        })
                        return
                    }

                    cmd.run(this, ctx)
                } catch (e) {
                    console.log(e)
                    ctx.reply({
                        ephemeral: true,
                        content: "❗ | Unable to run the command, please try again (if this issue keeps happening please contact the bot creator)\n\nError Message:\n```" + String(e) + "```"
                    })
                }
            }
        })

        this.on("error", (e) => {
            this.utilities?.logger.err("UVClient", String(e))
        })

        process.on('unhandledRejection', async  (reason, p) => {
            if (String(reason).includes("Unknown interaction")) return
            this.utilities?.logger.err("UVClient", "Unhandled Rejection at: Promise ", String(await p), "reason:", String(reason));
        });

        process.on('uncaughtException', (err) => {
            this.utilities?.logger.err("UVClient", "Uncaught Exception: ", String(err));
        });
        
        // process.on('rejectionHandled', (p) => {
        //     console.log(p)
        // });
    }

    private ReadEventsFolder(src?:string) {
        var fol = readdirSync(src ? (src as string) : path.join(this.botFolder, "events"));
        for (var i = 0; i < fol.length; i++) {
            var stat = statSync(src ? path.join(src, fol[i]) : path.join(this.botFolder, "events", fol[i]));
            if (stat.isFile() && (fol[i].endsWith(".ts") || fol[i].endsWith(".js"))) {
                const event = require(src ? path.join(src, fol[i]) : path.join(this.botFolder, "events", fol[i]));
				if (event) {
					let eventName = fol[i].split(".")[0];
					this.on(eventName, event.default.bind(null, this));
				}
            } else {
                this.ReadEventsFolder(src ? path.join(src, fol[i]) : path.join(this.botFolder, "events", fol[i]));
            };
        }
        return 0;
    }

    // ---------------------------------------- \\
}