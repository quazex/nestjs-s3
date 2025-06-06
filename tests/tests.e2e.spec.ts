import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { TestingS3Factory } from './tests.factory';
import { TestingDocument } from './tests.types';

describe('S3 > E2E', () => {
    const tModule = new TestingS3Factory();

    beforeAll(tModule.init.bind(tModule));
    afterAll(tModule.close.bind(tModule));

    test('Check connection', async() => {
        const isHealth = await tModule.service.ping();
        expect(isHealth).toBe(true);
    });

    test('Check write/read operations', async() => {
        const document: TestingDocument = {
            id: faker.string.uuid(),
            name: faker.person.firstName(),
            timestamp: Date.now(),
        };

        const result = await tModule.service.write(document);
        const reply = await tModule.service.read(document.id);

        expect(reply).toBeDefined();
        expect(reply?.name).toBe(document.name);
        expect(result).toBe(true);
    });
});
