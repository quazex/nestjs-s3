import { Inject } from '@nestjs/common'
import { S3Tokens } from './s3.tokens'

export const InjectS3 = (): ReturnType<typeof Inject> => (
  Inject(S3Tokens.CLIENT)
)
