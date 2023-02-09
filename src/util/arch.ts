import { Router } from 'express';

import { Storyboard } from '@/server';

export abstract class Subrouter {
    private path: string;
    private router: Router;

    constructor(app: Storyboard, path: string) {
        this.path   = path;
        this.router = Router({mergeParams: true});

        app.restServer.use(path, this.router);

        this.setup(this.router);
    }

    protected abstract setup(router: Router): void;
}