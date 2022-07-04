"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compare({ text, expected, wrongMessage, successMessage }) {
    const ok = expected.includes(text);
    return { ok, message: ok ? successMessage : wrongMessage };
}
function similarLines({ text, similar, percent, wrongMessage, successMessage }) {
    const similarLines = similar.split("\n");
    const textLines = text.split("\n");
    const ok = similarLines.length * (percent / 100) <= similarLines.reduce((a, line, i) => a + (line.replaceAll(/\s/, "") === textLines[i]?.replaceAll(/\s/, "") ? 1 : 0), 0);
    return { ok, message: ok ? successMessage : wrongMessage };
}
const submits = {
    "compare": compare,
    "similarLines": similarLines
};
exports.default = submits;
//# sourceMappingURL=submits.js.map