export class ServiceInitializationError extends Error {
    constructor(
        message: string,
        public readonly serviceName: string,
        public readonly originalError?: Error,
    ) {
        super(message);
        this.name = 'ServiceInitializationError';
    }
}
