import {
    AbstractStartedContainer,
    GenericContainer,
    StartedTestContainer,
    Wait,
} from 'testcontainers';

export class MinioContainerOptions {
    #port: number;
    #username: string;
    #password: string;

    constructor() {
        this.#port = 9009;
        this.#username = 'testcontainers';
        this.#password = 'testcontainers';
    }

    public get port(): number {
        return this.#port;
    }

    public get username(): string {
        return this.#username;
    }

    public set username(value: string) {
        this.#username = value;
    }

    public get password(): string {
        return this.#password;
    }

    public set password(value: string) {
        this.#password = value;
    }
}

export class MinioContainerGeneric extends GenericContainer {
    private readonly options = new MinioContainerOptions();

    constructor(image = 'minio/minio:RELEASE.2025-05-24T17-08-30Z') {
        super(image);
        this
            .withCommand([
                'server',
                '/var/lib/minio',
                `--address=0.0.0.0:${this.options.port}`,
            ])
            .withEnvironment({
                MINIO_ROOT_USER: this.options.username,
                MINIO_ROOT_PASSWORD: this.options.password,
            })
            .withExposedPorts(this.options.port)
            .withWaitStrategy(Wait.forListeningPorts())
            .withReuse();
    }

    public withUsername(username: string): this {
        this.options.username = username;
        return this;
    }
    public withPassword(password: string): this {
        this.options.password = password;
        return this;
    }

    public override async start(): Promise<MinioContainerStarted> {
        const container = await super.start();
        return new MinioContainerStarted(
            container,
            this.options,
        );
    }
}

export class MinioContainerStarted extends AbstractStartedContainer {
    private readonly options: MinioContainerOptions;

    constructor(
        container: StartedTestContainer,
        options: MinioContainerOptions,
    ) {
        super(container);
        this.options = options;
    }

    public getEndpoint(): string {
        const host = this.getHost();
        const port = this.getFirstMappedPort();
        return `http://${host}:${port}`;
    }

    public getUsername(): string {
        return this.options.username;
    }

    public getPassword(): string {
        return this.options.password;
    }
}
