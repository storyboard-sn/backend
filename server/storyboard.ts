import express from 'express'
import { Express } from 'express-serve-static-core'

export class Storyboard {
    public static readonly PORT: number = 1987
 
    server: Express;

    constructor() {
        this.server = express();
    }

    public run() {
        this.server.get('/', (request, response) => {
            response.statusCode = 200;
            response.send('Hello, world!');
        });
        this.server.listen(Storyboard.PORT, () => {
            console.log('Now listening!');
        });
    }
}