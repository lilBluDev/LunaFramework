import { Collection, PermissionFlagsBits, REST, Routes, SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import LunaClient from "..";
import { PathLike, readdirSync, statSync, watch } from "fs";
import path from "path";
import { CommandBase, CommandOption, ECommandOptionTypes } from "../base/CommandBase";

export class CommandHandler {
    private client: LunaClient
    private token: string
    public commands: Collection<string, CommandBase>
    
    constructor(client: LunaClient, token: string) {
        this.client = client
        this.token = token
        this.commands = new Collection<string, CommandBase>();
    }

    registerCommand() {
        var rest = new REST().setToken(this.token);

        var PrivateCommands: {[key: string]: SlashCommandBuilder[]} = {}
        var TestingCommands: SlashCommandBuilder[] = []
        var GlobalCommands: SlashCommandBuilder[] = []

        this.commands.each((v: CommandBase) => {
            if (v.isTesting) {
                this.buildCommand(v, TestingCommands);
            } else if (v.isPrivate) {
                let privateServers = v.privateServers ? v.privateServers : []
                let pre_built = this.buildCommand(v) as SlashCommandBuilder;
                while (privateServers.length > 0) {
                    let server = privateServers.shift() as string
                    if (!PrivateCommands[server]) PrivateCommands[server] = []
                    PrivateCommands[server].push(pre_built)
                }
            } else {
                this.buildCommand(v, GlobalCommands);
            }
        })



        if (TestingCommands.length > 0) {
            try {
                for (let i = 0; i < this.client.testServers.length; i++) {
                    rest.put(Routes.applicationGuildCommands(this.client.user?.id as string, this.client.testServers[i]), {
                        body: TestingCommands.map(c => c.toJSON())
                    })
                }
            } catch (e) {
                this.client.utilities?.logger.err(__filename, "failed to create AppCMD! error:", String(e));
            }   
        }

        if (GlobalCommands.length > 0) {
            try {
                // console.log(this.client.user?.id)
                rest.put(Routes.applicationCommands(this.client.user?.id as string), {
                    body: GlobalCommands.map(c => c.toJSON())
                })
            } catch (e) {
                this.client.utilities?.logger.err(__filename,"failed to create AppCMD! error:", String(e));
            }
        }

        if (Object.keys(PrivateCommands).length > 0) {
            try {
                for (let i = 0; i < Object.keys(PrivateCommands).length; i++) {
                    let server = Object.keys(PrivateCommands)[i]
                    let commands = PrivateCommands[server]
                    rest.put(Routes.applicationGuildCommands(this.client.user?.id as string, server), {
                        body: commands.map(c => c.toJSON())
                    })
                }
            } catch (e) {
                this.client.utilities?.logger.err(__filename, "failed to create AppCMD! error:", String(e));
            }
        }
    }

    buildCommand(cmd: CommandBase, arr?: SlashCommandBuilder[] | undefined) {
        var s = new SlashCommandBuilder()
        .setName(cmd.commandName as string)
        .setDescription(cmd.commandDescription ? cmd.commandDescription : "No Description")
        
        if (cmd.requiredMemberPermissions) {
            s.setDefaultMemberPermissions(cmd.requiredMemberPermissions);
        } else {
            s.setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages);
        }

        s.setDMPermission(cmd.DMaccess);

        this.parseCommandOptions(cmd, s);

        if (arr) {
            arr.push(s)
        } else {
            return s;
        }
    }
        
    private parseCommandOptions(cmd: CommandBase, s: SlashCommandBuilder) {
        if (cmd.commandOptions && cmd.commandOptions.length > 0) {
            let hasSub = false;
            cmd.commandOptions.forEach((op: CommandOption) => {
                if (!op.name) this.client.utilities?.logger.warn(__filename, "Name of a option was not provided for command " + cmd.commandName + "!");
                if (!op.type) this.client.utilities?.logger.warn(__filename, "Type for option " + op.name + " was not provided for command " + cmd.commandName + "!");

                // //@ts-expect-error
                // if (hasSub && (op.type != ECommandOptionTypes.SUBCOMMAND || op.type != ECommandOptionTypes.SUBCOMMAND_GROUP)) {
                //     this.client.utilities?.logger.err(__filename, `${cmd.commandName}: No other optons are allowed if a sub command or sub command group is provided!`);
                //     process.exit(1);
                // }

                switch (op.type) {
                    case ECommandOptionTypes.TEXT:
                        s.addStringOption(opti => {
                            const opt = opti
                                .setName(op.name)
                                .setDescription(op.description || "No Description");

                            if (op.choices) opt.addChoices(...op.choices);
                            if (op.required) opt.setRequired(op.required);

                            if (op.minLength) opt.setMinLength(op.minLength);
                            if (op.maxLength) opt.setMaxLength(op.maxLength);
                            return opt;
                        });
                        break;
                    case ECommandOptionTypes.USER:
                        s.addUserOption(opti => {
                            const opt = opti
                                .setName(op.name.toLowerCase())
                                .setDescription(op.description || "No Description");

                            if (op.required) opt.setRequired(op.required);
                            return opt;
                        });
                        break;

                    case ECommandOptionTypes.CHANNEL:
                        s.addChannelOption(opti => {
                            const opt = opti
                                .setName(op.name)
                                .setDescription(op.description || "No Description");

                            if (op.required) opt.setRequired(op.required);
                            return opt;
                        });
                        break;

                    case ECommandOptionTypes.ATTACHMENT:
                        s.addAttachmentOption(opti => {
                            const opt = opti
                                .setName(op.name)
                                .setDescription(op.description || "No Description");

                            if (op.required) opt.setRequired(op.required);
                            return opt;
                        });
                        break;

                    case ECommandOptionTypes.BOOLEAN:
                        s.addBooleanOption(opti => {
                            const opt = opti
                                .setName(op.name)
                                .setDescription(op.description || "No Description");

                            if (op.required) opt.setRequired(op.required);
                            return opt;
                        });
                        break;

                    case ECommandOptionTypes.SUBCOMMAND:
                        hasSub = true;
                        this.parseSubCommand(s, op);
                        break;
                    
                    case ECommandOptionTypes.SUBCOMMAND_GROUP:
                        hasSub = true;
                        s.addSubcommandGroup(opti => {
                            const opt = opti
                                .setName(op.name)
                                .setDescription(op.description || "No Description");
                            
                            // this.parseSubCommand(opt, op.subCommandOptions);

                            let subCommandList: CommandOption[] = op.options as CommandOption[];

                            while (subCommandList.length > 0) {
                                const subOptions = subCommandList.shift() as CommandOption;

                                this.parseSubCommand(opt, subOptions);
                            }

                            return opt;
                        })
                }
            });
        }
        
    }

    private parseSubCommand(s: SlashCommandBuilder | SlashCommandSubcommandGroupBuilder, op: CommandOption) {
        s.addSubcommand(opti => {
            const optSc = opti
                .setName(op.name)
                .setDescription(op.description || "No Description");

            if (op.options && op.options.length > 0) {
                op.options.forEach((v, i, a) => {
                    // console.log(a, i, v)
                    const subOptions = v;

                    switch (subOptions.type) {
                        case ECommandOptionTypes.TEXT:
                            optSc.addStringOption(opti => {
                                const opt = opti
                                    .setName(subOptions.name)
                                    .setDescription(subOptions.description || "No Description");

                                if (subOptions.choices) opt.addChoices(...subOptions.choices);
                                if (subOptions.required) opt.setRequired(subOptions.required);

                                if (subOptions.minLength) opt.setMinLength(subOptions.minLength);
                                if (subOptions.maxLength) opt.setMaxLength(subOptions.maxLength);
                                return opt;
                            });
                            break;
                        case ECommandOptionTypes.USER:
                            optSc.addUserOption(opti => {
                                const opt = opti
                                    .setName(subOptions.name.toLowerCase())
                                    .setDescription(subOptions.description || "No Description");

                                if (subOptions.required) opt.setRequired(subOptions.required);
                                return opt;
                            });
                            break;

                        case ECommandOptionTypes.CHANNEL:
                            optSc.addChannelOption(opti => {
                                const opt = opti
                                    .setName(subOptions.name)
                                    .setDescription(subOptions.description || "No Description");

                                if (subOptions.required) opt.setRequired(subOptions.required);
                                return opt;
                            });
                            break;

                        case ECommandOptionTypes.ATTACHMENT:
                            optSc.addAttachmentOption(opti => {
                                const opt = opti
                                    .setName(subOptions.name)
                                    .setDescription(subOptions.description || "No Description");

                                if (subOptions.required) opt.setRequired(subOptions.required);
                                return opt;
                            });
                            break;

                        case ECommandOptionTypes.BOOLEAN:
                            optSc.addBooleanOption(opti => {
                                const opt = opti
                                    .setName(subOptions.name)
                                    .setDescription(subOptions.description || "No Description");

                                if (subOptions.required) opt.setRequired(subOptions.required);
                                return opt;
                            });
                            break;
                    }
                });
            }

            return optSc;
        });
    }

    public async ReadCommandsFolder(src?: string, group: string = "/", exclude: string[] = []) {
        var fol = readdirSync(src ? (src as string) : path.join(this.client.botFolder, "commands"));

        for (var i = 0; i < fol.length; i++) {
            var stat = statSync(src ? path.join(src, fol[i]) : path.join(this.client.botFolder, "commands", fol[i]));
            if (stat.isFile() && (fol[i].endsWith(".ts") || fol[i].endsWith(".js")) && !(fol[i].endsWith(".d.ts"))) {
                await this.VerifyCommandFile(src ? path.join(src, fol[i]) : path.join(this.client.botFolder, "commands", fol[i]), group, exclude);
            } else if (stat.isDirectory()) {
                await this.ReadCommandsFolder(src ? path.join(src, fol[i]) : path.join(this.client.botFolder, "commands", fol[i]), group === '' ? group + fol[i] : group + fol[i] + "/");
                // return;
            };
        }
    }
    
    private async VerifyCommandFile(filePath: string, group: string, exclude: string[] = []) {
        let startTime = Date.now();
        
        // console.log(group)
        var cmd: CommandBase = new (require(filePath)).default();
        let cmdName: string = cmd.constructor.name.toLowerCase().replaceAll("_", "-")

        if (exclude.includes(cmdName)) return;
        if (!cmd.run) { this.client.utilities?.logger.warn(__filename, "Command \"", cmdName, "\" does not have a run function!"); return};

        group = group.length > 1 ? group.slice(0, group.length - 1) : group

        cmd.commandName = cmdName
        cmd.filePath = filePath
        cmd.group = group
        if (this.commands.has(cmdName)) {  this.client.utilities?.logger.warn(__filename, "Command \"", cmdName, "\" already exist!"); return};
        
        this.commands.set(cmdName, cmd);
        this.client.utilities?.logger.info(__filename, "Command Loaded:", `(${group})`, String(filePath.split('\\').pop()), `${Date.now() - startTime}ms`);
    }
}