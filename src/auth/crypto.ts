import { hash, compare } from 'bcrypt';
import { promisify } from 'util';
import * as crypto from 'crypto';

import { safetyConfiguration } from 'config';
import { Code } from 'src/types/user/user.type';

const scrypter = promisify(crypto.scrypt);
const randomByter = promisify(crypto.randomBytes);
const algorithm = safetyConfiguration.algorithm;
const iterations = safetyConfiguration.iterations


const coding = async (toCode: string, salt: string): Promise<Code> => {
    try {
        const key = await scrypter(safetyConfiguration.password, salt, iterations);
        const iv = await randomByter(16);

        const cipher = crypto.createCipheriv(algorithm, key as crypto.CipherKey, iv);
        let encrypted = cipher.update(toCode, 'utf-8', 'hex');
        encrypted += cipher.final('hex');

        return {
            coded: encrypted,
            iv: iv.toString('hex')
        }
    } catch (err) {
        console.log(err)
        throw new Error('Error in function coding module crypto');
    }

};

const decoding = async (toDecode: string, iv: string, salt: string): Promise<string> => {
    try {
        const key = await scrypter(safetyConfiguration.password, salt, iterations);
        const ivd = Buffer.from(iv, 'hex');

        const decipher = crypto.createDecipheriv(algorithm, key as crypto.CipherKey, ivd);
        let decrypted = decipher.update(toDecode, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');

        return decrypted;
    } catch (err) {
        console.log(err)
        throw new Error('decoding error');
    }
}

export const hasher = async (password: string, salt: string): Promise<Code> => {
    try {

        const hashed = await hash(password, 12);
        const codedPassword = await coding(hashed, salt);
        return {
            coded: codedPassword.coded,
            iv: codedPassword.iv
        };
    } catch (err) {
        console.log(err)
        throw new Error('Error during hash function in crypto module');
    }
}

export const comparer = async (password: string, checkpassword: string, key: string, salt: string): Promise<Boolean> => {
    try {
        const decodedChcekPassword = await decoding(checkpassword, key, salt);
        const isUserCorrect = await compare(password, decodedChcekPassword) as Boolean;
        return isUserCorrect;
    } catch (err) {
        console.log(err)
        throw new Error('Error during comparing passwords in crypto module');
    }
}