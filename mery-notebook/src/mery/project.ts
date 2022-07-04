import * as utils from "../utils";
import * as markdownit from 'markdown-it';
import * as fsAsync from 'fs/promises';

const md = markdownit();
const htmlTemplate: { [key: string]: string } = {
    "default": `${__dirname}/../templates/default.html`
};

export const newProject = (title: string = "Unamed Notebook", author: string = "Annonymus"): NotebookProject => ({
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

export const newChapter = (title: string = ""): NotebookProjectChapter => ({
    title,
    concepts: "",
    practice: "",
    hints: {
        title: "",
        content: ""
    },
    submit: [],
});

const parseMdFile = (chapter: NotebookProjectChapter, mdChapter: string): NotebookProjectChapter => {
    const lines = mdChapter.replace(/\n/g, "\n\x1C").split("\x1C");
    if (!lines[0].startsWith("# ")) { throw new Error(`The ${chapter.import} markdown file not start with a title.`); }
    chapter.title = lines[0];

    let state = 0;
    for (const line of lines.slice(1)) {
        if (line.startsWith("## ")) {
            state = state === 1 ? 2 : 1;
            if (state === 2) {
                if (!chapter.hints) { chapter.hints = { title: "", content: "" }; }
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
                if (!chapter.hints) { chapter.hints = { title: "", content: "" }; }
                chapter.hints.content += line;
                break;
        }
    }
    return chapter;
};

const parserChapter = (chapter: NotebookProjectChapter): NotebookProjectChapter => {
    chapter.title = md.render(chapter.title || "");
    chapter.concepts = md.render(chapter.concepts || "");
    chapter.practice = md.render(chapter.practice || "");
    if (chapter.hints) {
        chapter.hints.title = md.render(chapter.hints.title || "");
        chapter.hints.content = md.render(chapter.hints.content || "");
    }
    return chapter;
};

export const buildNotebook = async (project: NotebookProject): Promise<Notebook> => {
    const template: utils.text.Template = utils.text.template(await fsAsync.readFile(
        project.ui.template.startsWith("@")
            ? htmlTemplate[project.ui.template.substring(1)]
            : utils.path.absPath(project.ui.template), { encoding: "utf-8" }));

    const buildChapter = async (chapter: NotebookProjectChapter, chapters: NotebookChapter[], indexNumber: { index: number }): Promise<NotebookIndex> => {
        let mdChapter: string | null = null;

        if (chapter.import) {
            mdChapter = await fsAsync.readFile(chapter.import.replace(".", utils.path.getCwd()), { encoding: "utf-8" });
        }

        let hintTitle = undefined;

        if (chapter.isMarkdown) {
            if (mdChapter) {
                chapter = parseMdFile(chapter, mdChapter);
            }
        }

        const index: NotebookIndex = {
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

    const notebookIndex: Array<NotebookIndex> = [];
    const chapters: NotebookChapter[] = [];

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

export const saveNotebook = async (path: string, notebook: Notebook) => {
    const content = Buffer.from(Buffer.from(JSON.stringify(notebook)).toString('hex')).toString('hex');
    await fsAsync.writeFile(path, content, { encoding: "base64" });
};

export const saveAndBuildNotebook = async (path: string, project: NotebookProject): Promise<string> => {
    path = `${utils.path.absPath(path)}/${project.name}.mery`;
    await saveNotebook(path, await buildNotebook(project));
    return path;
};

export const createProject = async (path: string, title: string, author: string): Promise<string> => {
    const project = newProject(title, author);
    path = `${path}/${project.name}`;

    await fsAsync.mkdir(path);
    await fsAsync.writeFile(`${path}/meryproject.json`, JSON.stringify(project, null, 2));
    return path;
};

export const loadProject = async (path: string): Promise<NotebookProject> => {
    return <NotebookProject>JSON.parse(await fsAsync.readFile(`${path}/meryproject.json`, { encoding: "utf-8" }));
};