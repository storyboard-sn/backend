import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { NextFunction } from 'connect';
import { Express, Request, Response } from 'express-serve-static-core';

import pino, { Logger } from 'pino';

import { MongoClient } from 'mongodb';

import { UserSubrouter } from '@/route/user';
import { HttpCode } from '@/util/http';
import { RestErrorResponse, RestStatus } from './util/rest';
import { Server, IncomingMessage, ServerResponse } from 'http';

class StoryboardMiddleware {
    public static handleError(
        error: Error,
        request: Request, response: Response, next: NextFunction
    ) {
        const body: RestErrorResponse = {
            status:  RestStatus.SERVER_ERROR,
            message: error.message
        };

        Storyboard.instance.logger.fatal
            (`Unexpected error while handling '${request.originalUrl}'`);
        
        response
            .status(HttpCode.INTERNAL_SERVER_ERROR)
            .send(body);

        next();
    }
}

export class Storyboard {
    public static readonly PORT: number = 1987;
    public static readonly URL: string = `mongodb://` +
        process.env.SB_DATABASE_USER + ':' +
        process.env.SB_DATABASE_PASSWORD + '@' +
        process.env.SB_DATABASE_ADDRESS +
        '/?appname=storyboard';

    private static _instance: Storyboard;
 
    private readonly _logger: Logger;
    private readonly _server: Express;

    private readonly db: MongoClient;

    private connection?: Server<typeof IncomingMessage, typeof ServerResponse>;

    public static get instance(): Storyboard {
        if (!Storyboard._instance)
            Storyboard._instance = new Storyboard();
        return Storyboard._instance
    }

    constructor() {
        this._server = express();

        this._server.use(express.urlencoded({ extended: true }));
        this._server.use(express.json());
        this._server.use(StoryboardMiddleware.handleError);

        this._logger = pino({
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: "dd-mm-yyyy HH:MM:ss,l",
                    ignore: "pid,hostname"
                }
            }
        });

        this.db = new MongoClient(Storyboard.URL);
        this.db.db(process.env.SB_DATABASE_NAME);

        this.connection = undefined;

        new UserSubrouter(this);
    }

    public get logger(): Logger {
        return this._logger;
    }

    public get server(): Express {
        return this._server;
    }

    public run() {
        this.connection = this.server.listen(Storyboard.PORT, () => {
            this.logger.info(`Now listening on port ${Storyboard.PORT}`);
        });
    }

    public stop() {
        this.logger.info(`Closing listener on port ${Storyboard.PORT}`);
        this.connection?.close();
        this.db.close();
    }
}