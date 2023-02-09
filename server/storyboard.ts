import express from 'express';
import { Express } from 'express-serve-static-core';
import pino, { Logger } from 'pino';

import { UserSubrouter } from '@/route/user';

export class Storyboard {
    public static readonly PORT: number = 1987
 
    private readonly _logger: Logger;
    private readonly _server: Express;

    constructor() {
        this._server = express();
        this._logger = pino({
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: "dd-mm-yyyy HH:MM:ss,l",
                    ignore: "pid,hostname"
                }
            }
        });

        new UserSubrouter(this);
    }

    public get logger(): Logger {
        return this._logger;
    }

    public get server(): Express {
        return this._server;
    }

    public run() {
        this.server.listen(Storyboard.PORT, () => {
            this.logger.info(`Now listening on port ${Storyboard.PORT}`);
        });
    }
}