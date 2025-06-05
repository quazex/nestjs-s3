# NestJS AWS S3 Module

Core features:

- Based on [official AWS S3 client for NodeJS](https://www.npmjs.com/package/@aws-sdk/client-s3);
- Covered with unit and e2e tests;
- Basic module without unnecessary boilerplate.

## Installation

To install the package, run:

```sh
npm install @quazex/nestjs-s3 @aws-sdk/client-s3
```

## Usage

### Importing the Module

To use the AWS S3 module in your NestJS application, import it into your root module (e.g., `AppModule`).

```typescript
import { Module } from '@nestjs/common';
import { S3Module } from '@quazex/nestjs-s3';

@Module({
  imports: [
    S3Module.forRoot({
        endpoint: 'http://localhost:9009',
        region: 'us-east-1',
        credentials: {
            accessKeyId: 'accessKeyId',
            secretAccessKey: '#########',
        },
        forcePathStyle: true, // for minio
    }),
  ],
})
export class AppModule {}
```

### Using S3 Client

Once the module is registered, you can inject instance of the `S3` into your providers:

```typescript
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { InjectS3 } from '@quazex/nestjs-mongodb';

@Injectable()
export class CollectionService {
    private readonly bucket = 'your_bucket';

    constructor(@InjectS3() private readonly client: S3Client) {}

    async insert(document: Record<string, unknown>) {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: document.id,
            Body: JSON.stringify(document),
        });
        await client.send(command);
    }

    async findOne(_id: ObjectId) {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: id,
        });

        const result = await client.send(command);
        const data = await result.Body?.transformToString();

        if (typeof data === 'string') {
            return JSON.parse(data);
        }

        return null;
    }
}
```

### Async Configuration

If you need dynamic configuration, use `forRootAsync`:

```typescript
import { Module } from '@nestjs/common';
import { S3Module } from '@quazex/nestjs-s3';

@Module({
    imports: [
        S3Module.forRootAsync({
            useFactory: async (config: ConfigProvider) => ({
                endpoint: config.endpoint,
                region: config.region,
                credentials: {
                    accessKeyId: config.access,
                    secretAccessKey: config.secret,
                },
                forcePathStyle: true,
            }),
            inject: [
                ConfigProvider,
            ],
        }),
    ],
})
export class AppModule {}
```

### Connection and graceful shutdown

By default, this module doesn't manage client connection on application shutdown. You can read more about lifecycle hooks on the NestJS [documentation page](https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown).

```typescript
// main.ts
const app = await NestFactory.create(AppModule);

app.useLogger(logger);
app.enableShutdownHooks(); // <<<

app.setGlobalPrefix('api');
app.enableVersioning({
    type: VersioningType.URI,
});

await app.listen(appConfig.port, '0.0.0.0');
```

```typescript
// app.bootstrap.ts
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { InjectS3 } from '@quazex/nestjs-s3';

@Injectable()
export class AppBootstrap implements OnApplicationShutdown {
    constructor(@InjectS3() private readonly client: S3Client) {}

    public onApplicationShutdown(): void {
        this.client.destroy();
    }
}
```

## License

MIT

