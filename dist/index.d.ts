import { Client, ClientOptions } from "discord.js";
import psyche from "psyche-logger";
import { CommandHandler } from "./handlers/CommandHandler";
import CustomizeEmbed from "./utilities/PagifyEmbed";
export interface Options extends ClientOptions {
    disabledDefaultCommands?: [];
    botFolder: string;
    testServers?: string[];
    readyMessage?: (c: LunaClient) => string;
}
export default class LunaClient extends Client {
    private TOKEN;
    private subOps;
    commandHandler: CommandHandler | undefined;
    disabledDefaultCommands: [] | undefined;
    utilities: {
        logger: psyche;
        pagify: CustomizeEmbed;
    } | undefined;
    botFolder: string;
    testServers: string[];
    readyMessage: (c: LunaClient) => {};
    constructor(token: string, options: Options);
    init(): void;
    private InitializeEnviroment;
    private InitEvents;
    private ReadEventsFolder;
}
