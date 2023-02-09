import { Collection } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { Storyboard } from '@/server';

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
}

export class UserManager {
    public static readonly PASSWORD_SALTROUNDS = 16;

    private collection: Collection<UserRecord>;

    constructor (collection: Collection<UserRecord>) {
        this.collection = collection;
    }

    public get(tag: string): User | undefined {
        const userRecord = this.collection.findOne({tag: tag});

        if (!userRecord)
            return undefined;

        return new User(this, (userRecord as unknown) as UserRecord);
    }

    public create(tag: string, password: string): boolean {
        let encryptedPassword;

        bcrypt.hash(password, UserManager.PASSWORD_SALTROUNDS,
            (error: Error | undefined, password: string) => {
                if (error)
                    encryptedPassword = undefined;
                encryptedPassword = password;
            }
        );

        if (!encryptedPassword)
            return false;

        let userRecord: UserRecord = {
            tag: tag,
            password: password,
            ...UserRecordDefaults
        };
        this.collection.insertOne(userRecord);

        return true;
    }
}