import express from 'express';
import pino from 'pino';

import { HttpCode } from './util/http';

export class Storyboard {
    public static readonly PORT: number = 1987
 
    private logger;
    private server;

    constructor() {
        this.server = express();
        this.logger = pino({
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: "dd-mm-yyyy HH:MM:ss,l",
                    ignore: "pid,hostname"
                }
            }
        });
    }

    public run() {
        this.server.get('/', (request, response) => {
            response.statusCode = HttpCode.OK;
            response.send('Hello, world!');
        });
        this.server.listen(Storyboard.PORT, () => {
            this.logger.info(`Now listening on port ${Storyboard.PORT}`);
        });
    }
}