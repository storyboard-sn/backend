import { Router, Request, Response } from 'express';

import { Storyboard } from '@/storyboard';

import { Subrouter } from '@/util/arch';
import { HttpCode } from '@/util/http';
import { handle, RestRequest } from '@/util/rest';

export interface UserAuthRequest extends RestRequest {
    tag: string;
    password: string;
}

export class UserSubrouter extends Subrouter {
    constructor(app: Storyboard) {
        super(app, '/user');
    }

    protected setup(router: Router) {
        router.get('/auth', this.authenticate);
    }

    public authenticate(request: Request, response: Response) {
        handle<UserAuthRequest>(request.body,
            (body: UserAuthRequest) => {
                response.status(HttpCode.OK);
            },
            (body) => {
                response.status(HttpCode.BAD_REQUEST);
            }
        );

        response.send();
    }
}