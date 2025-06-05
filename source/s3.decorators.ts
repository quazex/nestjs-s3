import { Inject } from '@nestjs/common';
import { S3_CLIENT } from './s3.tokens';

export const InjectS3 = (): ReturnType<typeof Inject> => Inject(S3_CLIENT);
