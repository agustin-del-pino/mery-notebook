interface NotebookChapterSubmit {
    method: string
    args: { [key: string]: any }
}

interface NotebookInfo {
    title: string
    author: string
    version: string
}
interface NotebookChapter {
    title: string
    chapter: string
    submit?: Array<NotebookChapterSubmit>
}
interface NotebookProjectChapter {
    title: string
    submit?: Array<NotebookChapterSubmit>
    subChapters?: Array<NotebookProjectChapter>
    concepts: string
    practice: string
    hints?: {
        title: string
        content: string
    },
    import?: string,
    isMarkdown?: boolean
}

interface NotebookProject extends NotebookInfo {
    name: string
    ui: {
        template: string
        buttons: {
            back: string
            next: string
            submit: string
        }
        hints?: {
            title?: string
        }
    }
    chapters: Array<NotebookProjectChapter>
}

interface NotebookIndex {
    title: string
    index: number
    subChapters?: Array<NotebookIndex>
}

interface Notebook extends NotebookInfo {
    chapters: Array<NotebookChapter>
    currentChapter: number
    index: Array<NotebookIndex>
}

interface SubmitMethodArgs {
    text: string
    wrongMessage: string
    successMessage: string

}

interface SubmitMethodResult {
    ok: boolean
    message: string
}