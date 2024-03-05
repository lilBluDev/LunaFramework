"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandBase = exports.ECommandOptionTypes = void 0;
// export type TCommandPermissions = "KICK"
var ECommandOptionTypes;
(function (ECommandOptionTypes) {
    ECommandOptionTypes[ECommandOptionTypes["NOTYPE"] = 0] = "NOTYPE";
    ECommandOptionTypes[ECommandOptionTypes["TEXT"] = 1] = "TEXT";
    ECommandOptionTypes[ECommandOptionTypes["USER"] = 2] = "USER";
    ECommandOptionTypes[ECommandOptionTypes["ATTACHMENT"] = 3] = "ATTACHMENT";
    ECommandOptionTypes[ECommandOptionTypes["BOOLEAN"] = 4] = "BOOLEAN";
    ECommandOptionTypes[ECommandOptionTypes["CHANNEL"] = 5] = "CHANNEL";
    ECommandOptionTypes[ECommandOptionTypes["SUBCOMMAND"] = 6] = "SUBCOMMAND";
    ECommandOptionTypes[ECommandOptionTypes["SUBCOMMAND_GROUP"] = 7] = "SUBCOMMAND_GROUP";
})(ECommandOptionTypes || (exports.ECommandOptionTypes = ECommandOptionTypes = {}));
class CommandBase {
    commandName;
    commandDescription;
    showHelp;
    requiredBotPermissions;
    requiredMemberPermissions;
    checkUserData;
    isPrivate;
    isTesting;
    DMaccess;
    commandOptions;
    privateServers;
    filePath = "";
    group = "";
    constructor(settings) {
        this.commandDescription = settings.description ? settings.description : "No Description";
        this.showHelp = settings.showHelp ? settings.showHelp : true;
        this.checkUserData = settings.checkUserData ? settings.checkUserData : false;
        this.isPrivate = settings.isPrivate ? settings.isPrivate : false;
        this.isTesting = settings.isTesting ? settings.isTesting : false;
        this.DMaccess = settings.DMaccess ? settings.DMaccess : false;
        this.requiredBotPermissions = settings.requiredBotPermissions ? settings.requiredBotPermissions : undefined;
        this.requiredMemberPermissions = settings.requiredMemberPermissions ? settings.requiredMemberPermissions : undefined;
        this.privateServers = settings.privateServers ? settings.privateServers : [];
        this.commandOptions = settings.options;
    }
    run(c, ctx) { }
}
exports.CommandBase = CommandBase;
