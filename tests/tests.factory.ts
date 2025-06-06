import {
    CreateBucketCommand,
    GetObjectCommand,
    ListBucketsCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { faker } from '@faker-js/faker';
import { FactoryProvider, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MinioContainer, StartedMinioContainer } from '@testcontainers/minio';
import { S3Module } from '../source/s3.module';
import { S3_CLIENT } from '../source/s3.tokens';
import { TestingDocument, TestingS3Service } from './tests.types';

export class TestingS3Factory {
    private _testing: TestingModule;
    private _container: StartedMinioContainer;

    private _token = faker.string.alpha({ length: 10 });
    private _bucket = faker.string.alpha({ length: 10, casing: 'lower' });

    public async init(): Promise<void> {
        const tContainer = new MinioContainer();

        this._container = await tContainer.withReuse().start();

        const tProvider: FactoryProvider<TestingS3Service> = {
            provide: this._token,
            useFactory: (client: S3Client) => ({
                onApplicationBootstrap: async(): Promise<void> => {
                    const command = new CreateBucketCommand({
                        Bucket: this._bucket,
                    });
                    await client.send(command);
                },
                onApplicationShutdown: (): void => {
                    client.destroy();
                },
                write: async(document: TestingDocument): Promise<boolean> => {
                    const command = new PutObjectCommand({
                        Bucket: this._bucket,
                        Key: document.id,
                        Body: JSON.stringify(document),
                    });
                    const result = await client.send(command);
                    return result.$metadata.httpStatusCode === HttpStatus.OK;
                },
                read: async(id: string): Promise<TestingDocument | null> => {
                    const command = new GetObjectCommand({
                        Bucket: this._bucket,
                        Key: id,
                    });
                    const result = await client.send(command);
                    const data = await result.Body?.transformToString();
                    if (typeof data === 'string') {
                        return JSON.parse(data) as TestingDocument;
                    }
                    return null;
                },
                ping: async(): Promise<boolean> => {
                    const command = new ListBucketsCommand();
                    const result = await client.send(command).catch(() => null);
                    if (Array.isArray(result?.Buckets)) {
                        return result.Buckets.length > 0;
                    }
                    return false;
                },
            }),
            inject: [
                S3_CLIENT,
            ],
        };

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
                tProvider,
            ],
        });

        this._testing = await tModule.compile();
        this._testing = await this._testing.init();

        this._testing.enableShutdownHooks();
    }

    public async close(): Promise<void> {
        await this._testing.close();
        await this._container.stop();
    }

    public get service(): TestingS3Service {
        return this._testing.get<TestingS3Service>(this._token);
    }
}
