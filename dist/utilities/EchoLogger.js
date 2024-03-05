"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const colors_1 = __importDefault(require("colors"));
class EchoLogger {
    logFile;
    constructor(logFile) {
        colors_1.default.enable();
        this.logFile = logFile ? logFile : `./public_logs.log`;
        this.checkFile();
        let currentLogs = (0, fs_1.readFileSync)(this.logFile, "utf-8").split("\r\n");
        currentLogs.push("--------------------------------------------------- # NEW SESSION # ---------------------------------------------------");
        (0, fs_1.writeFileSync)(this.logFile, currentLogs.join("\r\n"));
    }
    info(fileName, ...msg) {
        console.log(`[${fileName.split("\\").pop()?.split(".")[0]}]`.green + ` [INFO] `.blue + msg.join(` `));
        let currentLogs = (0, fs_1.readFileSync)(this.logFile, "utf-8").split("\r\n");
        currentLogs.push(`[${fileName.split("\\").pop()?.split(".")[0]}]` + ` [INFO] ` + msg.join(` `));
        (0, fs_1.writeFileSync)(this.logFile, currentLogs.join("\r\n"));
    }
    err(fileName, ...msg) {
        console.log(`[${fileName.split("\\").pop()?.split(".")[0]}]`.green + ` [ERROR] `.red + msg.join(` `));
        let currentLogs = (0, fs_1.readFileSync)(this.logFile, "utf-8").split("\r\n");
        currentLogs.push(`[${fileName.split("\\").pop()?.split(".")[0]}]` + ` [ERROR] ` + msg.join(` `));
        (0, fs_1.writeFileSync)(this.logFile, currentLogs.join("\r\n"));
    }
    warn(fileName, ...msg) {
        console.log(`[${fileName.split("\\").pop()?.split(".")[0]}]`.green + ` [WARN] `.yellow + msg.join(` `));
        let currentLogs = (0, fs_1.readFileSync)(this.logFile, "utf-8").split("\r\n");
        currentLogs.push(`[${fileName.split("\\").pop()?.split(".")[0]}]` + ` [WARN] ` + msg.join(` `));
        (0, fs_1.writeFileSync)(this.logFile, currentLogs.join("\r\n"));
    }
    notif(fileName, ...msg) {
        console.log(`[${fileName.split("\\").pop()?.split(".")[0]}]`.green + ` [NOTICE] `.cyan + msg.join(` `));
        let currentLogs = (0, fs_1.readFileSync)(this.logFile, "utf-8").split("\r\n");
        currentLogs.push(`[${fileName.split("\\").pop()?.split(".")[0]}]` + ` [NOTICE] ` + msg.join(` `));
        (0, fs_1.writeFileSync)(this.logFile, currentLogs.join("\r\n"));
    }
    checkFile() {
        if (!(0, fs_1.existsSync)(this.logFile)) {
            (0, fs_1.writeFileSync)(this.logFile, `################## LOG FILE CREATED ##################\r\n\r\n`);
            this.warn(__filename, `log file does not exist!`);
        }
    }
}
exports.default = EchoLogger;
