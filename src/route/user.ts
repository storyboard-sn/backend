import { Router, Request, Response } from 'express';

import { Storyboard } from '@/server';

import { Subrouter } from '@/util/arch';
import { HttpCode } from '@/util/http';
import { SessionManager } from '@/util/session';
import { RestRequest, RestResponse, RestStatus } from '@/util/rest';
import { User, UserManager } from '@/object/user';

export interface UserAuthRequest extends RestRequest {
    tag: string;
    password: string;
}

export interface UserAuthResponse extends RestResponse {
    session?: string;
}

export class UserSubrouter extends Subrouter {
    public static readonly COLLECTION = 'users';

    private readonly _userManager: UserManager;
    private readonly _sessionManager: SessionManager<User>;

    constructor(app: Storyboard) {
        super(app, '/user');

        this._userManager =
            new UserManager(app.db!.collection(UserSubrouter.COLLECTION));
        this._sessionManager = new SessionManager<User>();
    }

    protected setup(router: Router) {
        router.post('/auth', this.authenticate.bind(this));
    }

    public async authenticate(request: Request, response: Response) {
        let requestObj: UserAuthRequest = request.body;
        let responseObj: UserAuthResponse = {
            status: RestStatus.UNKNOWN
        };
        response.status(HttpCode.OK);

        if (!requestObj.tag || !requestObj.password) {
            responseObj.status = RestStatus.MALFORMED_REQUEST;
            response.send(responseObj);
            return;
        }

        Storyboard.instance.logger.debug
            (`Handling authentication request for user '${requestObj.tag}'`);

        let user: User | undefined;

        try {
            user = await this._userManager.get(requestObj.tag);
        } catch (error) {
            if (error instanceof Error)
                Storyboard.instance.logger.fatal
                    (error, `Failed to get user info (${error.message})`);
            responseObj.status = RestStatus.SERVER_ERROR;

            response.send(responseObj);
            return;
        }

        if (user == undefined) {
            Storyboard.instance.logger.debug
                (`User '${requestObj.tag}' does not exist`);
            responseObj.status = RestStatus.FAILURE;

            response.send(responseObj);
            return;
        } else if (user.authenticate(requestObj.password)) {
            Storyboard.instance.logger.debug
                (`Authentication failed for '${requestObj.tag}'`);
            responseObj.status = RestStatus.FAILURE;

            response.send(responseObj);
            return;
        }


        responseObj = {
            status: RestStatus.SUCCESS,
            session: this._sessionManager.spawn(user)
        };

        response.send(responseObj);
    }
}