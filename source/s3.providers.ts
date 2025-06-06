import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { FactoryProvider, Provider, ValueProvider } from '@nestjs/common';
import { S3AsyncConfig, S3ConfigFactory } from './s3.interfaces';
import { S3Tokens } from './s3.tokens';

export class S3Providers {
    public static getOptions(options: S3ClientConfig): ValueProvider<S3ClientConfig> {
        const optionsToken = S3Tokens.getOptions();
        return {
            provide: optionsToken,
            useValue: options,
        };
    }

    public static getAsyncOptions(options: S3AsyncConfig): Provider<S3ClientConfig> {
        const optionsToken = S3Tokens.getOptions();
        if (options.useFactory) {
            return {
                provide: optionsToken,
                useFactory: options.useFactory,
                inject: options.inject,
            };
        }
        if (options.useExisting) {
            return {
                provide: optionsToken,
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
        const optionsToken = S3Tokens.getOptions();
        const clientToken = S3Tokens.getClient();
        return {
            provide: clientToken,
            useFactory: (config: S3ClientConfig) => new S3Client(config),
            inject: [optionsToken],
        };
    }
}
