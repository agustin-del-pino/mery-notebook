import * as vscode from 'vscode';

export const toKebakCase = (text: string): string => text.trim().toLowerCase().replace(/\s{2,}/g, " ").replace(/\s/g, "-");
export type Template = {
    text: string,
    substitute(subs: { [key: string]: string; }): string
};
export const template = (text: string): Template => ({
    text,
    substitute(subs: { [key: string]: string; }) {
        return Object.keys(subs).reduce((t, k) => t.replaceAll("$(" + k + ")", subs[k] === undefined || subs[k] === null ? "" : subs[k]), this.text);
    }
});
export const input = async (title: string, defvalue: string) => await vscode.window.showInputBox({ title }) || defvalue;