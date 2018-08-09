export function isBuffer(arg: any): boolean {
    return arg instanceof Buffer;
}

export function padLeft(str: string, len: number): string {
    return len > str.length
        ? new Array(len - str.length + 1).join(' ') + str
        : str;
}
export function padRight(str: string, len: number): string {
    return len > str.length
        ? str + new Array(len - str.length + 1).join(' ')
        : str;
}
