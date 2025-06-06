import { S3ClientConfig } from '@aws-sdk/client-s3';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { S3AsyncConfig } from './s3.interfaces';
import { S3Providers } from './s3.providers';

@Global()
@Module({})
export class S3Module {
    public static forRoot(config: S3ClientConfig): DynamicModule {
        const optionsProvider = S3Providers.getOptions(config);
        const clientProvider = S3Providers.getClient();

        const dynamicModule: DynamicModule = {
            module: S3Module,
            providers: [
                optionsProvider,
                clientProvider,
            ],
            exports: [
                clientProvider,
            ],
        };
        return dynamicModule;
    }


    public static forRootAsync(asyncOptions: S3AsyncConfig): DynamicModule {
        const optionsProvider = S3Providers.getAsyncOptions(asyncOptions);
        const clientProvider = S3Providers.getClient();

        const dynamicModule: DynamicModule = {
            module: S3Module,
            imports: asyncOptions.imports,
            providers: [
                optionsProvider,
                clientProvider,
            ],
            exports: [
                clientProvider,
            ],
        };

        return dynamicModule;
    }
}
