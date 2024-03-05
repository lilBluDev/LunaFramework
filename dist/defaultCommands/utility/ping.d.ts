import { CommandInteraction } from "discord.js";
import LunaClient from "../..";
import { CommandBase } from "../../base/CommandBase";
export default class Ping extends CommandBase {
    constructor();
    run(client: LunaClient, interaction: CommandInteraction): Promise<void>;
}
