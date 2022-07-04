"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = void 0;
const cp = require("child_process");
const exec = (cmd, ...args) => new Promise((res, rej) => cp.exec(`${cmd} ${args.join(" ")}`, (e, o) => e ? rej(e) : res(o)));
exports.exec = exec;
//# sourceMappingURL=os.js.map