import { Collection, SlashCommandBuilder } from "discord.js";
import LunaClient from "..";
import { CommandBase } from "../base/CommandBase";
export declare class CommandHandler {
    private client;
    private token;
    commands: Collection<string, CommandBase>;
    constructor(client: LunaClient, token: string);
    registerCommand(): void;
    buildCommand(cmd: CommandBase, arr?: SlashCommandBuilder[] | undefined): SlashCommandBuilder | undefined;
    private parseCommandOptions;
    private parseSubCommand;
    ReadCommandsFolder(src?: string, group?: string, exclude?: string[]): Promise<void>;
    private VerifyCommandFile;
}
