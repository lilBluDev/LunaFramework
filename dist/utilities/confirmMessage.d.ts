/// <reference types="node" />
import { ButtonInteraction, CacheType, Interaction, InteractionCollector } from "discord.js";
import EventEmitter from "events";
interface ConfirmMessageMainOptions {
    ctx: Interaction;
    message: string;
    ephemeral?: boolean;
}
interface ConfirmMessageSecondaryOptions {
    message: string;
}
export declare class ConfirmMessage extends EventEmitter {
    collector?: InteractionCollector<ButtonInteraction<CacheType>>;
    constructor(ctx: Interaction | ConfirmMessageMainOptions, Secondary?: ConfirmMessageSecondaryOptions | string);
}
export {};
