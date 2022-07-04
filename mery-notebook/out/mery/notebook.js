"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submit = exports.getSubChaptersTitle = exports.getChaptersTitle = exports.getCurrentChapter = exports.getChapterHtml = exports.loadNotebook = void 0;
const fsAsync = require("fs/promises");
const submits_1 = require("./submits");
let notebook;
const loadNotebook = async (path) => {
    const file = (await fsAsync.readFile(path, { encoding: "base64" })).toString();
    const strNotebook = Buffer.from(Buffer.from(file, 'hex').toString("utf-8"), 'hex').toString("utf-8");
    notebook = JSON.parse(strNotebook);
};
exports.loadNotebook = loadNotebook;
const getChapterHtml = (chapter) => {
    if (notebook === null) {
        throw new Error('No notebook loaded.');
    }
    if (chapter < 0) {
        return;
    }
    if (chapter >= notebook.chapters.length) {
        return;
    }
    notebook.currentChapter = chapter;
    return notebook.chapters[chapter].chapter;
};
exports.getChapterHtml = getChapterHtml;
const getCurrentChapter = () => {
    if (notebook === null) {
        throw new Error('No notebook loaded.');
    }
    return notebook.currentChapter;
};
exports.getCurrentChapter = getCurrentChapter;
const getChaptersTitle = () => {
    if (notebook === null) {
        throw new Error('No notebook loaded.');
    }
    return notebook.index.reduce((t, c) => [...t, { title: c.title, index: c.index }], new Array());
};
exports.getChaptersTitle = getChaptersTitle;
const getSubChaptersTitle = (chapter) => {
    if (notebook === null) {
        throw new Error('No notebook loaded.');
    }
    return notebook.index[chapter]?.subChapters?.reduce((t, c) => [...t, { title: c.title, index: c.index }], new Array());
};
exports.getSubChaptersTitle = getSubChaptersTitle;
const submit = (text) => {
    if (notebook === null) {
        throw new Error('No notebook loaded.');
    }
    return notebook.chapters[notebook.currentChapter].submit?.map(({ method, args }) => {
        let result = null;
        args = { ...args, text };
        if (submits_1.default.hasOwnProperty(method)) {
            result = submits_1.default[method](args);
        }
        ;
        return result || { ok: false, message: "An error ocurred when the submit were processed." };
    });
};
exports.submit = submit;
//# sourceMappingURL=notebook.js.map