import * as bcrypt from 'bcrypt';

import type { Collection } from 'mongodb';

const SALT_ROUNDS = 8;

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

    public async authenticate(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.record.password);
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

    public async has(tag: string): Promise<boolean> {
        return await this.collection.findOne({tag: tag}) != null;
    }

    public async get(tag: string): Promise<User | undefined> {
        const userRecord = await this.collection.findOne({tag: tag});

        if (userRecord == null)
            return undefined;

        return new User(this, (userRecord as unknown) as UserRecord);
    }

    public async create(tag: string, password: string) {
        if (await this.has(tag))
            throw new UserManagerError(`Tag ${tag} already exists`);

        bcrypt.hash(password, SALT_ROUNDS)
            .then((encryptedPassword: string) => {
                if (!encryptedPassword)
                    throw new UserManagerError
                        ('Couldn\'t create an encrypted password');

                let userRecord: UserRecord = {
                    tag: tag,
                    password: encryptedPassword,
                    ...UserRecordDefaults
                };
                
                this.collection.insertOne(userRecord);
            });
    }
}
