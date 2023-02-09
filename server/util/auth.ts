class TokenKeyGenerator {
    public static readonly CHARACTERS =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    public static readonly LENGTH = 24;

    public static generate(): string {
        let key = '';

        for (let i = 0; i < TokenKeyGenerator.LENGTH; i++)
            key += TokenKeyGenerator.CHARACTERS[
                Math.floor(Math.random() * TokenKeyGenerator.CHARACTERS.length)
            ];

        return key;
    }
}

export class AuthState<T> {
    /* TODO: Implement expiring tokens */

    _state: T;

    constructor(state: T) {
        this._state = state;
    }

    public get state(): T {
        return this._state;
    }
}

export class AuthManager<T> {
    stateMap: Map<string, AuthState<T>>;

    constructor() {
        this.stateMap = new Map<string, AuthState<T>>();
    }

    public spawn(state: T): string {
        const key = TokenKeyGenerator.generate();

        this.stateMap.set(key, new AuthState<T>(state));

        return key;
    }

    public destroy(key: string): boolean {
        return this.stateMap.delete(key);
    }
}