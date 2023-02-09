import { Router, Request, Response } from 'express';

import { Storyboard } from '@/server';

import { Subrouter } from '@/util/arch';
import { HttpCode } from '@/util/http';
import { RestRequest, RestResponse, RestStatus } from '@/util/rest';

export interface UserAuthRequest extends RestRequest {
    tag: string;
    password: string;
}

export interface UserAuthResponse extends RestResponse {
    
}

export class UserSubrouter extends Subrouter {
    constructor(app: Storyboard) {
        super(app, '/user');
    }

    protected setup(router: Router) {
        router.post('/auth', this.authenticate);
    }

    public authenticate(request: Request, response: Response) {
        let requestObj: UserAuthRequest = request.body;
        let responseObj: UserAuthResponse = {
            status: RestStatus.UNKNOWN
        };

        if (!requestObj.tag || !requestObj.password) {
            response.status(HttpCode.BAD_REQUEST);
            responseObj.status = RestStatus.MALFORMED_REQUEST;
        } else {
            response.status(HttpCode.OK);
            responseObj.status = RestStatus.SUCCESS;
        }

        response.send(responseObj);
    }
}