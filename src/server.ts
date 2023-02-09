import * as packageInfo from '../package.json';
import 'dotenv/config';

import express from 'express';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { NextFunction } from 'connect';
import { Express, Request, Response } from 'express-serve-static-core';

import pino, { Logger } from 'pino';

import { Db, MongoClient } from 'mongodb';

import { HttpCode } from '@/util/http';
import { RestResponse, RestStatus } from '@/util/rest';

import { UserPole } from '@/pole/user';

class StoryboardMiddleware {
    public static handleError(
        error: Error,
        request: Request, response: Response, next: NextFunction
    ) {
        const body: RestResponse = { status:  RestStatus.SERVER_ERROR };

        ø.logger.fatal(`Unexpected error while handling '${request.originalUrl}'`);
        
        response
            .status(HttpCode.INTERNAL_SERVER_ERROR)
            .send(body);

        next();
    }
}

export class Storyboard {
    public static readonly PORT = 1987;

    public static readonly DATABASE_URL = `mongodb://` +
        process.env.SB_DATABASE_USER + ':' +
        process.env.SB_DATABASE_PASSWORD + '@' +
        process.env.SB_DATABASE_ADDRESS + '/' +
        process.env.SB_DATABASE_NAME +
        '?appname=storyboard';

    private static _instance: Storyboard;

    public static get instance(): Storyboard {
        if (!Storyboard._instance)
            Storyboard._instance = new Storyboard();
        return Storyboard._instance;
    }
 
    private readonly _logger: Logger;
    private readonly _restServer: Express;

    private _dbServer?: MongoClient;
    private _db?: Db;

    private _users?: UserPole;

    private _restListener?: Server<typeof IncomingMessage, typeof ServerResponse>;

    private constructor() {
        this._restServer = express();

        this._restServer.use(express.urlencoded({ extended: true }));
        this._restServer.use(express.json());
        this._restServer.use(StoryboardMiddleware.handleError);

        this._logger = pino({
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: "dd-mm-yyyy HH:MM:ss,l",
                    ignore: "pid,hostname",
                }
            },
            level: 'trace'
        });
    }

    public get logger(): Logger {
        return this._logger;
    }

    public get restServer(): Express {
        return this._restServer;
    }

    public get db(): Db | undefined {
        return this._db;
    }

    public get users(): UserPole | undefined {
        return this._users;
    }

    public async run() {
        this.logger.info(`Hello, Storyboard! ${packageInfo.version}`);

        this.logger.debug('Connecting to database');
        this._dbServer = new MongoClient(Storyboard.DATABASE_URL);
        this._db = this._dbServer.db();

        try {
            await this._db.command({ping: 1})
        } catch (error) {
            if (error instanceof Error) {
                this.logger.fatal
                    (`Failed to connect to database, cannot start: ${error.message}`);
                return;
            } else
                throw error;
        }

        this.logger.info("Successfully created a connection to the database");

        this._users = new UserPole(this);

        this._restListener = this.restServer.listen(Storyboard.PORT, () => {
            this.logger.info(`Now listening on port ${Storyboard.PORT}`);
        });
    }

    public stop() {
        this.logger.info(`Closing listener on port ${Storyboard.PORT}`);
        this._restListener?.close();
        this._dbServer!.close();
    }
}

export const ø = Storyboard.instance;