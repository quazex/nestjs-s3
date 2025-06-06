import { Inject } from '@nestjs/common';
import { S3Tokens } from './s3.tokens';

export const InjectS3 = (): ReturnType<typeof Inject> => {
    const token = S3Tokens.getClient();
    return Inject(token);
};
