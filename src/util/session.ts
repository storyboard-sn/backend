class SessionKeyGenerator {
    public static readonly CHARACTERS =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    public static readonly LENGTH = 24;

    public static generate(): string {
        let key = '';

        for (let i = 0; i < SessionKeyGenerator.LENGTH; i++)
            key += SessionKeyGenerator.CHARACTERS[
                Math.floor(Math.random() * SessionKeyGenerator.CHARACTERS.length)
            ];

        return key;
    }
}

export class SessionState<T> {
    /* TODO: Implement expiring tokens */

    _state: T;

    constructor(state: T) {
        this._state = state;
    }

    public get state(): T {
        return this._state;
    }
}

export class SessionManager<T> {
    stateMap: Map<string, SessionState<T>>;

    constructor() {
        this.stateMap = new Map<string, SessionState<T>>();
    }

    public spawn(state: T): string {
        const key = SessionKeyGenerator.generate();

        this.stateMap.set(key, new SessionState<T>(state));

        return key;
    }

    public destroy(key: string): boolean {
        return this.stateMap.delete(key);
    }

    public has(key: string): boolean {
        return this.stateMap.has(key);
    }

    public get(key: string): T | undefined {
        return this.stateMap.get(key)?.state;
    }
}