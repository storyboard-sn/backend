import { Router, Request, Response } from 'express';

import { Storyboard } from '@/storyboard';

import { Subrouter } from '@/util/arch';
import { HttpCode } from '@/util/http';
import { RestRequest } from '@/util/rest';

export interface UserAuthRequest extends RestRequest {
    tag: string;
    password: string;
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

        if (!requestObj.tag || !requestObj.password)
            response.status(HttpCode.BAD_REQUEST);
        else {
            response.status(HttpCode.OK);
        }

        response.send();
    }
}