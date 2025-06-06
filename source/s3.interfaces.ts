import { S3ClientConfig } from '@aws-sdk/client-s3';
import { InjectionToken, ModuleMetadata, OptionalFactoryDependency, Type } from '@nestjs/common';

export interface S3ConfigFactory {
    createS3Config(): Promise<S3ClientConfig> | S3ClientConfig;
}

export interface S3AsyncConfig extends Pick<ModuleMetadata, 'imports'> {
    inject?: Array<InjectionToken | OptionalFactoryDependency>;
    useExisting?: Type<S3ConfigFactory>;
    useFactory?: (...args: any[]) => Promise<S3ClientConfig> | S3ClientConfig;
}
