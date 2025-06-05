import { type S3ClientConfig } from '@aws-sdk/client-s3';
import { Faker, faker } from '@faker-js/faker';
import { describe, expect, jest, test } from '@jest/globals';
import { Injectable, Module, ValueProvider } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { S3ConfigFactory } from '../source/s3.interfaces';
import { S3Module } from '../source/s3.module';

jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn(),
}));

describe('S3 > Unit', () => {
    test('forRoot()', async() => {
        const tBuilder = Test.createTestingModule({
            imports: [
                S3Module.forRoot({
                    endpoint: faker.internet.url(),
                }),
            ],
        });
        const tFixture = await tBuilder.compile();

        const oModule = tFixture.get(S3Module);
        expect(oModule).toBeDefined();

        await tFixture.close();
    });

    test('forRootAsync with useFactory()', async() => {
        const configToken = faker.word.adjective();
        const provider: ValueProvider<Faker> = {
            provide: configToken,
            useValue: faker,
        };

        @Module({
            providers: [provider],
            exports: [provider],
        })
        class ConfigModule {}

        const tBuilder = Test.createTestingModule({
            imports: [
                S3Module.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: (f: Faker) => ({
                        url: f.internet.url(),
                    }),
                    inject: [configToken],
                }),
            ],
        });
        const tFixture = await tBuilder.compile();

        const oModule = tFixture.get(S3Module);
        expect(oModule).toBeInstanceOf(S3Module);

        await tFixture.close();
    });

    test('forRootAsync with useExisting()', async() => {
        @Injectable()
        class S3Config implements S3ConfigFactory {
            public createS3Config(): S3ClientConfig {
                return {
                    endpoint: faker.internet.url(),
                };
            }
        }

        @Module({
            providers: [S3Config],
            exports: [S3Config],
        })
        class ConfigModule {}

        const tBuilder = Test.createTestingModule({
            imports: [
                S3Module.forRootAsync({
                    imports: [ConfigModule],
                    useExisting: S3Config,
                }),
            ],
        });
        const tFixture = await tBuilder.compile();

        const oModule = tFixture.get(S3Module);
        expect(oModule).toBeInstanceOf(S3Module);

        await tFixture.close();
    });
});
