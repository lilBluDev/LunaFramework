import { Collection, CommandInteraction } from "discord.js";
import LunaClient from "../..";
import { CommandBase } from "../../base/CommandBase";
export default class Help extends CommandBase {
    constructor();
    run(c: LunaClient, ctx: CommandInteraction): void;
    generateCommandUsage(command: CommandBase): string;
    generateList(commands: Collection<string, CommandBase>): Map<string, any>;
}
