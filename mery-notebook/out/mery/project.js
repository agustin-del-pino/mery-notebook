"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadProject = exports.createProject = exports.saveAndBuildNotebook = exports.saveNotebook = exports.buildNotebook = exports.newChapter = exports.newProject = void 0;
const utils = require("../utils");
const markdownit = require("markdown-it");
const fsAsync = require("fs/promises");
const md = markdownit();
const htmlTemplate = {
    "default": `${__dirname}/../templates/default.html`
};
const newProject = (title = "Unamed Notebook", author = "Annonymus") => ({
    name: utils.text.toKebakCase(title),
    title,
    author,
    version: "1.0.0",
    ui: {
        template: "@default",
        buttons: {
            back: "Back",
            next: "Next",
            submit: "Submit"
        }
    },
    chapters: []
});
exports.newProject = newProject;
const newChapter = (title = "") => ({
    title,
    concepts: "",
    practice: "",
    hints: {
        title: "",
        content: ""
    },
    submit: [],
});
exports.newChapter = newChapter;
const parseMdFile = (chapter, mdChapter) => {
    const lines = mdChapter.replace(/\n/g, "\n\x1C").split("\x1C");
    if (!lines[0].startsWith("# ")) {
        throw new Error(`The ${chapter.import} markdown file not start with a title.`);
    }
    chapter.title = lines[0];
    let state = 0;
    for (const line of lines.slice(1)) {
        if (line.startsWith("## ")) {
            state = state === 1 ? 2 : 1;
            if (state === 2) {
                if (!chapter.hints) {
                    chapter.hints = { title: "", content: "" };
                }
                chapter.hints.title = line;
                continue;
            }
        }
        switch (state) {
            case 0:
                chapter.concepts = `${chapter.concepts || ""}${line}`;
                break;
            case 1:
                chapter.practice = `${chapter.practice || ""}${line}`;
                break;
            case 2:
                if (!chapter.hints) {
                    chapter.hints = { title: "", content: "" };
                }
                chapter.hints.content += line;
                break;
        }
    }
    return chapter;
};
const parserChapter = (chapter) => {
    chapter.title = md.render(chapter.title || "");
    chapter.concepts = md.render(chapter.concepts || "");
    chapter.practice = md.render(chapter.practice || "");
    if (chapter.hints) {
        chapter.hints.title = md.render(chapter.hints.title || "");
        chapter.hints.content = md.render(chapter.hints.content || "");
    }
    return chapter;
};
const buildNotebook = async (project) => {
    const template = utils.text.template(await fsAsync.readFile(project.ui.template.startsWith("@")
        ? htmlTemplate[project.ui.template.substring(1)]
        : utils.path.absPath(project.ui.template), { encoding: "utf-8" }));
    const buildChapter = async (chapter, chapters, indexNumber) => {
        let mdChapter = null;
        if (chapter.import) {
            mdChapter = await fsAsync.readFile(chapter.import.replace(".", utils.path.getCwd()), { encoding: "utf-8" });
        }
        let hintTitle = undefined;
        if (chapter.isMarkdown) {
            if (mdChapter) {
                chapter = parseMdFile(chapter, mdChapter);
            }
        }
        const index = {
            title: chapter.title,
            index: indexNumber.index
        };
        if (chapter.hints) {
            if (project.ui.hints?.title && !project.ui.hints.title.startsWith("## ")) {
                project.ui.hints.title = "## " + hintTitle;
            }
            chapter.hints.title = project.ui.hints?.title || chapter.hints.title;
        }
        chapter = parserChapter(chapter);
        chapters.push({
            title: chapter.title,
            chapter: template.substitute({
                "title": project.title,
                "chapterTitle": chapter.title,
                "concepts": chapter.concepts,
                "practice": chapter.practice,
                "hintsTitle": chapter.hints?.title || "",
                "hints": chapter.hints?.content || "",
                "back": project.ui.buttons.back,
                "next": project.ui.buttons.next,
                "submit": project.ui.buttons.submit
            }),
            submit: chapter.submit
        });
        if (chapter.subChapters) {
            index.subChapters = [];
            for (const subChapter of chapter.subChapters) {
                indexNumber.index += 1;
                index.subChapters.push(await buildChapter(subChapter, chapters, indexNumber));
            }
        }
        return index;
    };
    const notebookIndex = [];
    const chapters = [];
    const indexNumber = { index: 0 };
    for (const chapter of project.chapters) {
        notebookIndex.push(await buildChapter(chapter, chapters, indexNumber));
        indexNumber.index += 1;
    }
    return {
        title: project.title,
        author: project.author,
        version: project.version,
        chapters,
        currentChapter: 0,
        index: notebookIndex
    };
};
exports.buildNotebook = buildNotebook;
const saveNotebook = async (path, notebook) => {
    const content = Buffer.from(Buffer.from(JSON.stringify(notebook)).toString('hex')).toString('hex');
    await fsAsync.writeFile(path, content, { encoding: "base64" });
};
exports.saveNotebook = saveNotebook;
const saveAndBuildNotebook = async (path, project) => {
    path = `${utils.path.absPath(path)}/${project.name}.mery`;
    await (0, exports.saveNotebook)(path, await (0, exports.buildNotebook)(project));
    return path;
};
exports.saveAndBuildNotebook = saveAndBuildNotebook;
const createProject = async (path, title, author) => {
    const project = (0, exports.newProject)(title, author);
    path = `${path}/${project.name}`;
    await fsAsync.mkdir(path);
    await fsAsync.writeFile(`${path}/meryproject.json`, JSON.stringify(project, null, 2));
    return path;
};
exports.createProject = createProject;
const loadProject = async (path) => {
    return JSON.parse(await fsAsync.readFile(`${path}/meryproject.json`, { encoding: "utf-8" }));
};
exports.loadProject = loadProject;
//# sourceMappingURL=project.js.map