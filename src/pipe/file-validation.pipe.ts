import * as path from 'path';
import { unlink } from 'fs/promises';
import { PipeTransform, Injectable, ArgumentMetadata, NotAcceptableException } from '@nestjs/common';
import { fileConfiguration } from 'config';
import { destionation } from 'src/multer/multer.storage';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {

        const { mimetype, size, filename } = value.file[0];

        if (mimetype !== fileConfiguration.acceptableFileType) {
            await unlink(path.join(destionation(), filename))
            throw new NotAcceptableException(Error, 'nieprawidłowy typ pliku');
        }

        if (size > fileConfiguration.maxFileSize) {
            await unlink(path.join(destionation(), filename))
            throw new NotAcceptableException(Error, 'plik jest zbyt duży')
        }

        return value
    }
}
