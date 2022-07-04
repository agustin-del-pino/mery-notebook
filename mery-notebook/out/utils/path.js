"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectFS = exports.absPath = exports.getCwd = exports.FSSelection = void 0;
const vscode = require("vscode");
var FSSelection;
(function (FSSelection) {
    FSSelection[FSSelection["files"] = 1] = "files";
    FSSelection[FSSelection["dirs"] = 2] = "dirs";
})(FSSelection = exports.FSSelection || (exports.FSSelection = {}));
const getCwd = () => vscode.workspace.workspaceFolders?.[0].uri.path || ".";
exports.getCwd = getCwd;
const absPath = (path) => path.replace(".", (0, exports.getCwd)());
exports.absPath = absPath;
const selectFS = async (title, label, selectionType, selectMany = false) => {
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
exports.selectFS = selectFS;
//# sourceMappingURL=path.js.map