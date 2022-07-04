import * as cp from 'child_process';

export const exec = (cmd: string, ...args: string[]) => new Promise<string>((res, rej) =>
    cp.exec(`${cmd} ${args.join(" ")}`, (e, o) => e ? rej(e) : res(o))
);
