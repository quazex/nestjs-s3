import {
  CreateBucketCommand,
  GetObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { HttpStatus, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common'
import { InjectS3 } from '../source/s3.decorators'
import { TTestingDocument } from './tests.types'

@Injectable()
export class TestingS3Service implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly bucket = 'testing-bucket'

  constructor(@InjectS3() private readonly client: S3Client) {}

  public async onApplicationBootstrap(): Promise<void> {
    const command = new CreateBucketCommand({ Bucket: this.bucket })
    await this.client.send(command)
  }

  public onApplicationShutdown(): void {
    this.client.destroy()
  }

  public async write(document: TTestingDocument): Promise<boolean> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: document.id,
      Body: JSON.stringify(document),
    })
    const result = await this.client.send(command)
    return result.$metadata.httpStatusCode === HttpStatus.OK
  }

  public async read(id: string): Promise<TTestingDocument | null> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: id,
    })
    const result = await this.client.send(command)
    const data = await result.Body?.transformToString()
    if (typeof data === 'string') {
      return JSON.parse(data) as TTestingDocument
    }
    return null
  }

  public async ping(): Promise<boolean> {
    const command = new ListBucketsCommand()
    const result = await this.client.send(command).catch(() => null)
    if (Array.isArray(result?.Buckets)) {
      return result.Buckets.length > 0
    }
    return false
  }
}
