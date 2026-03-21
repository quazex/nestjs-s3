import { Test, TestingModule } from '@nestjs/testing'
import { MinioContainer, StartedMinioContainer } from '@testcontainers/minio'
import { S3Module } from '../source/s3.module'
import { TestingS3Service } from './tests.service'

export class TestingS3Factory {
  private _testing: TestingModule
  private _container: StartedMinioContainer

  public async init(): Promise<void> {
    const tContainer = new MinioContainer('minio/minio:RELEASE.2025-09-07T16-13-09Z')
    this._container = await tContainer.withReuse().start()

    const tModule = Test.createTestingModule({
      imports: [
        S3Module.forRoot({
          endpoint: this._container.getConnectionUrl(),
          region: 'us-east-1',
          credentials: {
            accessKeyId: this._container.getUsername(),
            secretAccessKey: this._container.getPassword(),
          },
          forcePathStyle: true,
        }),
      ],
      providers: [
        TestingS3Service,
      ],
    })

    this._testing = await tModule.compile()
    this._testing = await this._testing.init()

    this._testing.enableShutdownHooks()
  }

  public async close(): Promise<void> {
    await this._testing.close()
    await this._container.stop()
  }

  public get service(): TestingS3Service {
    return this._testing.get(TestingS3Service)
  }
}
