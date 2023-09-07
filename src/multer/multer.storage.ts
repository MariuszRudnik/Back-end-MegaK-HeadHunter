import * as path from 'path';

export const destionation = (): string => {
    const pathName = path.join(__dirname, '../../import')
    return pathName
}