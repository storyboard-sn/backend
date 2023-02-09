import { Collection } from 'mongodb';

import { Storyboard } from '@/server';
import { Hasher } from '@/util/hash';

export enum Palette {
    PRIMARY    = 'primary',
    SECONDARY  = 'secondary',
    TERTIARY   = 'tertiary',
    QUARTENARY = 'quartenary'
}

interface UserRecord {
    tag: string;
    password: string;
    palette: Palette;
}

const UserRecordDefaults: Pick<UserRecord, 'palette'> = {
    palette: Palette.PRIMARY
};

export class User {
    private manager: UserManager;
    private record: UserRecord;

    constructor(manager: UserManager, record: UserRecord) {
        this.manager = manager;
        this.record = record;
    }

    public authenticate(password: string): boolean {
        return Hasher.hash(password) == this.record.password;
    }
}

export class UserManagerError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class UserManager {
    private collection: Collection<UserRecord>;

    constructor (collection: Collection<UserRecord>) {
        this.collection = collection;
    }

    public async get(tag: string): Promise<User | undefined> {
        const userRecord = await this.collection.findOne({tag: tag});

        console.log(typeof(userRecord), userRecord);

        if (userRecord == null)
            return undefined;

        return new User(this, (userRecord as unknown) as UserRecord);
    }

    public async create(tag: string, password: string) {
        if (await this.get(tag))
            throw new UserManagerError(`Tag ${tag} already exists`);

        let encryptedPassword = Hasher.hash(password);
        if (!encryptedPassword)
            throw new UserManagerError(`Couldn't create an encrypted password`);

        let userRecord: UserRecord = {
            tag: tag,
            password: password,
            ...UserRecordDefaults
        };
        
        this.collection.insertOne(userRecord);

        return true;
    }
}