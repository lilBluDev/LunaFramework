"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const CommandBase_1 = require("../base/CommandBase");
class CommandHandler {
    client;
    token;
    commands;
    constructor(client, token) {
        this.client = client;
        this.token = token;
        this.commands = new discord_js_1.Collection();
    }
    registerCommand() {
        var rest = new discord_js_1.REST().setToken(this.token);
        var PrivateCommands = {};
        var TestingCommands = [];
        var GlobalCommands = [];
        this.commands.each((v) => {
            if (v.isTesting) {
                this.buildCommand(v, TestingCommands);
            }
            else if (v.isPrivate) {
                let privateServers = v.privateServers ? v.privateServers : [];
                let pre_built = this.buildCommand(v);
                while (privateServers.length > 0) {
                    let server = privateServers.shift();
                    if (!PrivateCommands[server])
                        PrivateCommands[server] = [];
                    PrivateCommands[server].push(pre_built);
                }
            }
            else {
                this.buildCommand(v, GlobalCommands);
            }
        });
        if (TestingCommands.length > 0) {
            try {
                for (let i = 0; i < this.client.testServers.length; i++) {
                    rest.put(discord_js_1.Routes.applicationGuildCommands(this.client.user?.id, this.client.testServers[i]), {
                        body: TestingCommands.map(c => c.toJSON())
                    });
                }
            }
            catch (e) {
                this.client.utilities?.logger.err(__filename, "failed to create AppCMD! error:", String(e));
            }
        }
        if (GlobalCommands.length > 0) {
            try {
                // console.log(this.client.user?.id)
                rest.put(discord_js_1.Routes.applicationCommands(this.client.user?.id), {
                    body: GlobalCommands.map(c => c.toJSON())
                });
            }
            catch (e) {
                this.client.utilities?.logger.err(__filename, "failed to create AppCMD! error:", String(e));
            }
        }
        if (Object.keys(PrivateCommands).length > 0) {
            try {
                for (let i = 0; i < Object.keys(PrivateCommands).length; i++) {
                    let server = Object.keys(PrivateCommands)[i];
                    let commands = PrivateCommands[server];
                    rest.put(discord_js_1.Routes.applicationGuildCommands(this.client.user?.id, server), {
                        body: commands.map(c => c.toJSON())
                    });
                }
            }
            catch (e) {
                this.client.utilities?.logger.err(__filename, "failed to create AppCMD! error:", String(e));
            }
        }
    }
    buildCommand(cmd, arr) {
        var s = new discord_js_1.SlashCommandBuilder()
            .setName(cmd.commandName)
            .setDescription(cmd.commandDescription ? cmd.commandDescription : "No Description");
        if (cmd.requiredMemberPermissions) {
            s.setDefaultMemberPermissions(cmd.requiredMemberPermissions);
        }
        else {
            s.setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ViewChannel | discord_js_1.PermissionFlagsBits.SendMessages);
        }
        s.setDMPermission(cmd.DMaccess);
        this.parseCommandOptions(cmd, s);
        if (arr) {
            arr.push(s);
        }
        else {
            return s;
        }
    }
    parseCommandOptions(cmd, s) {
        if (cmd.commandOptions && cmd.commandOptions.length > 0) {
            let hasSub = false;
            cmd.commandOptions.forEach((op) => {
                if (!op.name)
                    this.client.utilities?.logger.warn(__filename, "Name of a option was not provided for command " + cmd.commandName + "!");
                if (!op.type)
                    this.client.utilities?.logger.warn(__filename, "Type for option " + op.name + " was not provided for command " + cmd.commandName + "!");
                // //@ts-expect-error
                // if (hasSub && (op.type != ECommandOptionTypes.SUBCOMMAND || op.type != ECommandOptionTypes.SUBCOMMAND_GROUP)) {
                //     this.client.utilities?.logger.err(__filename, `${cmd.commandName}: No other optons are allowed if a sub command or sub command group is provided!`);
                //     process.exit(1);
                // }
                switch (op.type) {
                    case CommandBase_1.ECommandOptionTypes.TEXT:
                        s.addStringOption(opti => {
                            const opt = opti
                                .setName(op.name)
                                .setDescription(op.description || "No Description");
                            if (op.choices)
                                opt.addChoices(...op.choices);
                            if (op.required)
                                opt.setRequired(op.required);
                            if (op.minLength)
                                opt.setMinLength(op.minLength);
                            if (op.maxLength)
                                opt.setMaxLength(op.maxLength);
                            return opt;
                        });
                        break;
                    case CommandBase_1.ECommandOptionTypes.USER:
                        s.addUserOption(opti => {
                            const opt = opti
                                .setName(op.name.toLowerCase())
                                .setDescription(op.description || "No Description");
                            if (op.required)
                                opt.setRequired(op.required);
                            return opt;
                        });
                        break;
                    case CommandBase_1.ECommandOptionTypes.CHANNEL:
                        s.addChannelOption(opti => {
                            const opt = opti
                                .setName(op.name)
                                .setDescription(op.description || "No Description");
                            if (op.required)
                                opt.setRequired(op.required);
                            return opt;
                        });
                        break;
                    case CommandBase_1.ECommandOptionTypes.ATTACHMENT:
                        s.addAttachmentOption(opti => {
                            const opt = opti
                                .setName(op.name)
                                .setDescription(op.description || "No Description");
                            if (op.required)
                                opt.setRequired(op.required);
                            return opt;
                        });
                        break;
                    case CommandBase_1.ECommandOptionTypes.BOOLEAN:
                        s.addBooleanOption(opti => {
                            const opt = opti
                                .setName(op.name)
                                .setDescription(op.description || "No Description");
                            if (op.required)
                                opt.setRequired(op.required);
                            return opt;
                        });
                        break;
                    case CommandBase_1.ECommandOptionTypes.SUBCOMMAND:
                        hasSub = true;
                        this.parseSubCommand(s, op);
                        break;
                    case CommandBase_1.ECommandOptionTypes.SUBCOMMAND_GROUP:
                        hasSub = true;
                        s.addSubcommandGroup(opti => {
                            const opt = opti
                                .setName(op.name)
                                .setDescription(op.description || "No Description");
                            // this.parseSubCommand(opt, op.subCommandOptions);
                            let subCommandList = op.options;
                            while (subCommandList.length > 0) {
                                const subOptions = subCommandList.shift();
                                this.parseSubCommand(opt, subOptions);
                            }
                            return opt;
                        });
                }
            });
        }
    }
    parseSubCommand(s, op) {
        s.addSubcommand(opti => {
            const optSc = opti
                .setName(op.name)
                .setDescription(op.description || "No Description");
            if (op.options && op.options.length > 0) {
                op.options.forEach((v, i, a) => {
                    // console.log(a, i, v)
                    const subOptions = v;
                    switch (subOptions.type) {
                        case CommandBase_1.ECommandOptionTypes.TEXT:
                            optSc.addStringOption(opti => {
                                const opt = opti
                                    .setName(subOptions.name)
                                    .setDescription(subOptions.description || "No Description");
                                if (subOptions.choices)
                                    opt.addChoices(...subOptions.choices);
                                if (subOptions.required)
                                    opt.setRequired(subOptions.required);
                                if (subOptions.minLength)
                                    opt.setMinLength(subOptions.minLength);
                                if (subOptions.maxLength)
                                    opt.setMaxLength(subOptions.maxLength);
                                return opt;
                            });
                            break;
                        case CommandBase_1.ECommandOptionTypes.USER:
                            optSc.addUserOption(opti => {
                                const opt = opti
                                    .setName(subOptions.name.toLowerCase())
                                    .setDescription(subOptions.description || "No Description");
                                if (subOptions.required)
                                    opt.setRequired(subOptions.required);
                                return opt;
                            });
                            break;
                        case CommandBase_1.ECommandOptionTypes.CHANNEL:
                            optSc.addChannelOption(opti => {
                                const opt = opti
                                    .setName(subOptions.name)
                                    .setDescription(subOptions.description || "No Description");
                                if (subOptions.required)
                                    opt.setRequired(subOptions.required);
                                return opt;
                            });
                            break;
                        case CommandBase_1.ECommandOptionTypes.ATTACHMENT:
                            optSc.addAttachmentOption(opti => {
                                const opt = opti
                                    .setName(subOptions.name)
                                    .setDescription(subOptions.description || "No Description");
                                if (subOptions.required)
                                    opt.setRequired(subOptions.required);
                                return opt;
                            });
                            break;
                        case CommandBase_1.ECommandOptionTypes.BOOLEAN:
                            optSc.addBooleanOption(opti => {
                                const opt = opti
                                    .setName(subOptions.name)
                                    .setDescription(subOptions.description || "No Description");
                                if (subOptions.required)
                                    opt.setRequired(subOptions.required);
                                return opt;
                            });
                            break;
                    }
                });
            }
            return optSc;
        });
    }
    async ReadCommandsFolder(src, group = "/", exclude = []) {
        var fol = (0, fs_1.readdirSync)(src ? src : path_1.default.join(this.client.botFolder, "commands"));
        for (var i = 0; i < fol.length; i++) {
            var stat = (0, fs_1.statSync)(src ? path_1.default.join(src, fol[i]) : path_1.default.join(this.client.botFolder, "commands", fol[i]));
            if (stat.isFile() && (fol[i].endsWith(".ts") || fol[i].endsWith(".js")) && !(fol[i].endsWith(".d.ts"))) {
                await this.VerifyCommandFile(src ? path_1.default.join(src, fol[i]) : path_1.default.join(this.client.botFolder, "commands", fol[i]), group, exclude);
            }
            else if (stat.isDirectory()) {
                await this.ReadCommandsFolder(src ? path_1.default.join(src, fol[i]) : path_1.default.join(this.client.botFolder, "commands", fol[i]), group === '' ? group + fol[i] : group + fol[i] + "/");
                // return;
            }
            ;
        }
    }
    async VerifyCommandFile(filePath, group, exclude = []) {
        let startTime = Date.now();
        // console.log(group)
        var cmd = new (require(filePath)).default();
        let cmdName = cmd.constructor.name.toLowerCase().replaceAll("_", "-");
        if (exclude.includes(cmdName))
            return;
        if (!cmd.run) {
            this.client.utilities?.logger.warn(__filename, "Command \"", cmdName, "\" does not have a run function!");
            return;
        }
        ;
        group = group.length > 1 ? group.slice(0, group.length - 1) : group;
        cmd.commandName = cmdName;
        cmd.filePath = filePath;
        cmd.group = group;
        if (this.commands.has(cmdName)) {
            this.client.utilities?.logger.warn(__filename, "Command \"", cmdName, "\" already exist!");
            return;
        }
        ;
        this.commands.set(cmdName, cmd);
        this.client.utilities?.logger.info(__filename, "Command Loaded:", `(${group})`, String(filePath.split('\\').pop()), `${Date.now() - startTime}ms`);
    }
}
exports.CommandHandler = CommandHandler;
