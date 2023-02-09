import { reflect } from 'typescript-rtti';

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface RestBody {

}

export interface RestRequest extends RestBody {
    
}

export enum RestResponseStatus {
    SUCCESS = 'success',
    FAILURE = 'failure'
}

export interface RestResponse extends RestBody {
    status: RestResponseStatus;
}

export function handle<T extends RestBody>
    (body: any, good: (body: T) => void, bad?: (body: any) => void): void {
    /*
     * Whoa! Isn't this supposed to be an `interface`? Well, no. Because TS
     * compile our interfaces, they get transformed to `class`es. That's why we
     * do that.
     */
    const reflectedInterface = reflect<T>().as('class').reflectedClass;
    let corresponds = true;

    if (body) {
        reflectedInterface.parameterNames.forEach((parameterName) => {
            if (!body[parameterName])
                corresponds = false;
        });
    } else
        corresponds = false;

    if (corresponds)
        good(body);
    else if (bad)
        bad(body);
}