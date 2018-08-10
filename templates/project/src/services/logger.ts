import { Configuration, configure, getLogger } from 'log4js';
const context = require('express-cls-hooked');

export class Logger {
    public static configure(config: Configuration) {
        configure(config);
    }

    public static getLogger(name?: string): Logger {
        return new this(name || 'default');
    }

    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    public log(level: string, message: string): void {
        getLogger(this.name).log(level, this.formatMessage(message));
    }
    public fatal(message: string): void {
        getLogger(this.name).fatal(this.formatMessage(message));
    }
    public error(message: string): void {
        getLogger(this.name).error(this.formatMessage(message));
    }
    public warn(message: string): void {
        getLogger(this.name).warn(this.formatMessage(message));
    }
    public info(message: string): void {
        getLogger(this.name).info(this.formatMessage(message));
    }
    public debug(message: string): void {
        getLogger(this.name).debug(this.formatMessage(message));
    }

    private formatMessage(message: string): string {
        const id = context.get('id');
        if (!id || id === '') {
            return message;
        }
        return `${id} - ${message}`;
    }
}
