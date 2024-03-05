import { CommandInteraction, PermissionResolvable, PermissionsBitField, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js"
import LunaClient from ".."

// export type TCommandPermissions = "KICK"

export enum ECommandOptionTypes {
    NOTYPE,
    TEXT,
    USER,
    ATTACHMENT,
    BOOLEAN,
    CHANNEL,
    SUBCOMMAND,
    SUBCOMMAND_GROUP
}

type perms = bigint | number | string

export interface CommandSettings {
    description?: string
    
    requiredBotPermissions?: PermissionResolvable | PermissionResolvable[]
    requiredMemberPermissions?: perms
    showHelp?: boolean
    checkUserData?: boolean
    isPrivate?: boolean
    isTesting?: boolean
    privateServers?: string[]
    DMaccess?: boolean
    options?: CommandOption[]
}

export interface CommandOption {
    name: string
    type: ECommandOptionTypes
    required?: boolean
    description?: string

    options?: CommandOption[]

    choices?: any
    minLength?: number
    maxLength?: number

    post?: <T>(c: LunaClient, o: SlashCommandBuilder | SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder) => Promise<T>
}

export class CommandBase {
    public commandName?: string
    public commandDescription: string

    public showHelp?: boolean
    public requiredBotPermissions?: PermissionResolvable | PermissionResolvable[]
    public requiredMemberPermissions?: perms
    public checkUserData?: boolean
    public isPrivate?: boolean
    public isTesting?: boolean
    public DMaccess?: boolean
    public commandOptions?: CommandOption[]

    public privateServers?: string[]
    public filePath?: string = ""
    public group?: string = ""

    constructor(settings: CommandSettings) {
        this.commandDescription = settings.description ? settings.description : "No Description"

        this.showHelp = settings.showHelp ? settings.showHelp : true
        this.checkUserData = settings.checkUserData ? settings.checkUserData : false
        this.isPrivate = settings.isPrivate ? settings.isPrivate : false
        this.isTesting = settings.isTesting ? settings.isTesting : false
        this.DMaccess = settings.DMaccess ? settings.DMaccess : false

        this.requiredBotPermissions = settings.requiredBotPermissions ? settings.requiredBotPermissions : undefined
        this.requiredMemberPermissions = settings.requiredMemberPermissions ? settings.requiredMemberPermissions : undefined
        this.privateServers = settings.privateServers ? settings.privateServers : []
        this.commandOptions = settings.options
    }

    run(c: LunaClient, ctx: CommandInteraction) {}
}