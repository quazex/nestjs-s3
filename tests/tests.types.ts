import { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';

export interface TestingDocument {
    id: string;
    name: string;
    timestamp: number;
}

export interface TestingS3Service extends OnApplicationBootstrap, OnApplicationShutdown {
    write: (data: TestingDocument) => Promise<boolean>;
    read: (id: string) => Promise<TestingDocument | null>;
    ping: () => Promise<boolean>;
}
