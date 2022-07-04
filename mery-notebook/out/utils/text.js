"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.input = exports.template = exports.toKebakCase = void 0;
const vscode = require("vscode");
const toKebakCase = (text) => text.trim().toLowerCase().replace(/\s{2,}/g, " ").replace(/\s/g, "-");
exports.toKebakCase = toKebakCase;
const template = (text) => ({
    text,
    substitute(subs) {
        return Object.keys(subs).reduce((t, k) => t.replaceAll("$(" + k + ")", subs[k] === undefined || subs[k] === null ? "" : subs[k]), this.text);
    }
});
exports.template = template;
const input = async (title, defvalue) => await vscode.window.showInputBox({ title }) || defvalue;
exports.input = input;
//# sourceMappingURL=text.js.map