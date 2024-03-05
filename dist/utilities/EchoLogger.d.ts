export default class EchoLogger {
    logFile: string;
    constructor(logFile?: string);
    info(fileName: string, ...msg: string[]): void;
    err(fileName: string, ...msg: string[]): void;
    warn(fileName: string, ...msg: string[]): void;
    notif(fileName: string, ...msg: string[]): void;
    private checkFile;
}
