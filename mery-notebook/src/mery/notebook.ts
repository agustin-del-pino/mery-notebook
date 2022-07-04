import * as fsAsync from 'fs/promises';
import submits from './submits';

let notebook: Notebook | null;

export const loadNotebook = async (path: string) => {
    const file = (await fsAsync.readFile(path, { encoding: "base64" })).toString();
    const strNotebook = Buffer.from(Buffer.from(file, 'hex').toString("utf-8"), 'hex').toString("utf-8");
    notebook = <Notebook>JSON.parse(strNotebook);
};


export const getChapterHtml = (chapter: number): string | undefined => {
    if (notebook === null) { throw new Error('No notebook loaded.'); }
    if (chapter < 0) { return; }
    if (chapter >= notebook.chapters.length) { return; }

    notebook.currentChapter = chapter;
    return notebook.chapters[chapter].chapter;
};

export const getCurrentChapter = () => {
    if (notebook === null) { throw new Error('No notebook loaded.'); }
    return notebook.currentChapter;
};

export const getChaptersTitle = (): {title:string, index:number}[] => {
    if (notebook === null) { throw new Error('No notebook loaded.'); }
    return notebook.index.reduce((t, c) => [...t, {title:c.title, index:c.index}], new Array());
};

export const getSubChaptersTitle = (chapter: number): {title:string, index:number}[] | undefined => {
    if (notebook === null) { throw new Error('No notebook loaded.'); }
    return notebook.index[chapter]?.subChapters?.reduce((t, c) => [...t, {title:c.title, index:c.index}], new Array());
};

export const submit = (text: string) => {
    if (notebook === null) { throw new Error('No notebook loaded.'); }
    return notebook.chapters[notebook.currentChapter].submit?.map(({ method, args }) => {
        let result: SubmitMethodResult | null = null;
        args = { ...args, text };
        if (submits.hasOwnProperty(method)) {
            result = submits[method](args);
        };
        return result || { ok: false, message: "An error ocurred when the submit were processed." };
    });
};