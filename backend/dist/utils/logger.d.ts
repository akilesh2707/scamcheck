declare class Logger {
    private formatEntry;
    private output;
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map