import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { FactoryProvider, Provider, ValueProvider } from '@nestjs/common';
import { S3AsyncConfig, S3ConfigFactory } from './s3.interfaces';
import { S3_CLIENT, S3_CONFIG } from './s3.tokens';

export class S3Providers {
    public static getOptions(options: S3ClientConfig): ValueProvider<S3ClientConfig> {
        return {
            provide: S3_CONFIG,
            useValue: options,
        };
    }

    public static getAsyncOptions(options: S3AsyncConfig): Provider<S3ClientConfig> {
        if (options.useFactory) {
            return {
                provide: S3_CONFIG,
                useFactory: options.useFactory,
                inject: options.inject,
            };
        }
        if (options.useExisting) {
            return {
                provide: S3_CONFIG,
                useFactory: async(factory: S3ConfigFactory): Promise<S3ClientConfig> => {
                    const client = await factory.createS3Config();
                    return client;
                },
                inject: [options.useExisting],
            };
        }
        throw new Error('Must provide useFactory or useClass');
    }

    public static getClient(): FactoryProvider<S3Client> {
        return {
            provide: S3_CLIENT,
            useFactory: (config: S3ClientConfig) => new S3Client(config),
            inject: [S3_CONFIG],
        };
    }
}
