function compare({ text, expected, wrongMessage, successMessage }: SubmitMethodArgs & { expected: string[] }): SubmitMethodResult {
    const ok = expected.includes(text);
    return { ok, message: ok ? successMessage : wrongMessage };
}

function similarLines({ text, similar, percent, wrongMessage, successMessage }: SubmitMethodArgs & { similar: string, percent: number }): SubmitMethodResult {
    const similarLines = similar.split("\n");
    const textLines = text.split("\n");
    const ok = similarLines.length * (percent / 100) <= similarLines.reduce(
        (a, line, i) => a + (line.replaceAll(/\s/, "") === textLines[i]?.replaceAll(/\s/, "") ? 1 : 0), 0);

    return { ok, message: ok ? successMessage : wrongMessage };
}

const submits: {[key:string]: Function} = {
    "compare": compare,
    "similarLines": similarLines
};

export default submits;