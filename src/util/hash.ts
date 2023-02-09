import * as bcrypt from 'bcrypt';

export class Hasher {
    public static readonly SALT_ROUNDS = 16;

    public static hash(input: string) {
        let encryptedInput;

        bcrypt.hash(input, Hasher.SALT_ROUNDS,
            (error: Error | undefined, password: string) => {
                if (error)
                    throw error;
                else
                    encryptedInput = password;
            }
        );

        return encryptedInput;
    }
}