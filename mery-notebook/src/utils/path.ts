import * as vscode from 'vscode';

export enum FSSelection {
    files = 1,
    dirs = 2,
}
export const getCwd = ():string => vscode.workspace.workspaceFolders?.[0].uri.path || ".";
export const absPath = (path: string): string => path.replace(".", getCwd());
export const selectFS = async (title: string, label: string, selectionType: FSSelection, selectMany: boolean = false) => {
    const selection = await vscode.window.showOpenDialog({
        canSelectFiles: (selectionType & FSSelection.files) === FSSelection.files,
        canSelectFolders: (selectionType & FSSelection.dirs) === FSSelection.dirs,
        canSelectMany: selectMany,
        title,
        openLabel: label
    });

    return {
        selection: selection || [],
        hasSelection: selection && selection.length > 0
    };
};