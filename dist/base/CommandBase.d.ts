import { CommandInteraction, PermissionResolvable, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import LunaClient from "..";
export declare enum ECommandOptionTypes {
    NOTYPE = 0,
    TEXT = 1,
    USER = 2,
    ATTACHMENT = 3,
    BOOLEAN = 4,
    CHANNEL = 5,
    SUBCOMMAND = 6,
    SUBCOMMAND_GROUP = 7
}
type perms = bigint | number | string;
export interface CommandSettings {
    description?: string;
    requiredBotPermissions?: PermissionResolvable | PermissionResolvable[];
    requiredMemberPermissions?: perms;
    showHelp?: boolean;
    checkUserData?: boolean;
    isPrivate?: boolean;
    isTesting?: boolean;
    privateServers?: string[];
    DMaccess?: boolean;
    options?: CommandOption[];
}
export interface CommandOption {
    name: string;
    type: ECommandOptionTypes;
    required?: boolean;
    description?: string;
    options?: CommandOption[];
    choices?: any;
    minLength?: number;
    maxLength?: number;
    post?: <T>(c: LunaClient, o: SlashCommandBuilder | SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder) => Promise<T>;
}
export declare class CommandBase {
    commandName?: string;
    commandDescription: string;
    showHelp?: boolean;
    requiredBotPermissions?: PermissionResolvable | PermissionResolvable[];
    requiredMemberPermissions?: perms;
    checkUserData?: boolean;
    isPrivate?: boolean;
    isTesting?: boolean;
    DMaccess?: boolean;
    commandOptions?: CommandOption[];
    privateServers?: string[];
    filePath?: string;
    group?: string;
    constructor(settings: CommandSettings);
    run(c: LunaClient, ctx: CommandInteraction): void;
}
export {};
