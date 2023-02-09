import { Router } from 'express';

import { Storyboard } from '@/storyboard';

export abstract class Subrouter {
    private path: string;
    private router: Router;

    constructor(app: Storyboard, path: string) {
        this.path   = path;
        this.router = Router({mergeParams: true});

        app.server.use(path, this.router);

        this.setup(this.router);
    }

    protected abstract setup(router: Router): void;
}