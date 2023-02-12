import { Router, Request, Response } from 'express';

import { ø, Storyboard } from '@/server';

import { Subrouter } from '@/util/arch';
import { HttpCode } from '@/util/http';
import { SessionManager } from '@/util/session';
import { User, UserManager } from '@/object/user';

import { RestStatus } from '@/interface/rest';
import {
    UserCreateRequest, UserCreateResponse,
    UserLogInRequest, UserLogInResponse,
    UserLogOutRequest, UserLogOutResponse
} from '@/interface/user' ;

export class UserPole extends Subrouter {
    public static readonly COLLECTION = 'users';

    private readonly _userManager: UserManager;
    private readonly _sessionManager: SessionManager<User>;

    constructor(app: Storyboard) {
        super(app, '/user');

        this._userManager =
            new UserManager(app.db!.collection(UserPole.COLLECTION));
        this._sessionManager = new SessionManager<User>();
    }

    protected setup(router: Router) {
        router.post('/sign-up', this.signUp.bind(this));
        router.post('/log-in', this.logIn.bind(this));
        router.post('/log-out',this.logOut.bind(this));
    }

    private async signUp(request: Request, response: Response) {
        let requestObj: UserCreateRequest = request.body;
        let responseObj: UserCreateResponse = { status: RestStatus.UNKNOWN };
        response.status(HttpCode.OK);

        if (!requestObj.tag || !requestObj.password) {
            responseObj.status = RestStatus.MALFORMED_REQUEST;
            response.send(responseObj);
            return;
        }

        ø.logger.debug(`Handling tag '${requestObj.tag}' creation`);

        let userExists: boolean;

        try {
            userExists = await this._userManager.has(requestObj.tag);
        } catch (error) {
            if (error instanceof Error)
                ø.logger.fatal
                    (error, `Failed to test user existence (${error.message})`);
            responseObj.status = RestStatus.SERVER_ERROR;

            response.send(responseObj);
            return;
        }
    
        if (userExists) {
            ø.logger.debug(
                'Cannot create a user with already existing tag ' +
                `'${requestObj.tag}'`
            );
            responseObj.status = RestStatus.FAILURE;

            response.send(responseObj);
            return;
        }

        this._userManager.create(requestObj.tag, requestObj.password)
            .then(() => {
                ø.logger.debug
                    (`User with tag '${requestObj.tag}' created successfully`);

                responseObj.status = RestStatus.SUCCESS;
                response.send(responseObj);
            })
            .catch((error) => {
                if (error instanceof Error)
                    ø.logger.fatal(error,
                        `Failed to create user with tag '${requestObj.tag}' ` +
                        `(${error.message})`
                    );
                responseObj.status = RestStatus.SERVER_ERROR;

                response.send(responseObj);
                return;
            })
    }

    private async logIn(request: Request, response: Response) {
        let requestObj: UserLogInRequest = request.body;
        let responseObj: UserLogInResponse = { status: RestStatus.UNKNOWN };
        response.status(HttpCode.OK);

        if (!requestObj.tag || !requestObj.password) {
            responseObj.status = RestStatus.MALFORMED_REQUEST;
            response.send(responseObj);
            return;
        }

        ø.logger.debug(`Handling log-in request for user '${requestObj.tag}'`);

        let user: User | undefined;

        try {
            user = await this._userManager.get(requestObj.tag);
        } catch (error) {
            if (error instanceof Error)
                ø.logger.fatal
                    (error, `Failed to get user info (${error.message})`);
            responseObj.status = RestStatus.SERVER_ERROR;

            response.send(responseObj);
            return;
        }

        if (user == undefined) {
            ø.logger.debug(`User '${requestObj.tag}' does not exist`);
            responseObj.status = RestStatus.FAILURE;

            response.send(responseObj);
            return;
        }

        user.authenticate(requestObj.password)
            .then((success: boolean) => {
                if (success) {
                    ø.logger.debug
                        (`Log-in success for user '${requestObj.tag}'`);
                    responseObj = {
                        status: RestStatus.SUCCESS,
                        session: this._sessionManager.spawn(user!)
                    };
                } else {
                    ø.logger.debug
                        (`Log-in failed for user '${requestObj.tag}'`);
                    responseObj.status = RestStatus.FAILURE;
                }

                response.send(responseObj);
            });
    }

    private async logOut(request: Request, response: Response) {
        let requestObj: UserLogOutRequest = request.body;
        let responseObj: UserLogOutResponse = { status: RestStatus.UNKNOWN };
        response.status(HttpCode.OK);

        if (!requestObj.session) {
            responseObj.status = RestStatus.MALFORMED_REQUEST;
            response.send(responseObj);
            return;
        }

        ø.logger.debug(`Log-out request from session '${requestObj.session}'`);
        
        if (!this._sessionManager.destroy(requestObj.session)) {
            ø.logger.debug(`Session '${requestObj.session}' does not exist`);
            responseObj.status = RestStatus.FAILURE;

            response.send(responseObj);
            return;
        }

        ø.logger.debug(`Log-out success from session '${requestObj.session}'`);

        responseObj.status = RestStatus.SUCCESS;
        response.send(responseObj);
    }
}
