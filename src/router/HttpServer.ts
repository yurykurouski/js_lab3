import * as http from 'http';

export class HttpServer {
    private _server: http.Server;
    private _port: number;

    constructor(
        port: number,
        requestHandler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
    ) {
        this._port = port;
        this._server = http.createServer(requestHandler);
    }

    public get server(): http.Server {
        return this._server;
    }

    public get port(): number {
        return this._port;
    }

    public start(): void {
        this._server.listen(this._port, () => {
            console.log(`🚀 Server running at http://localhost:${this._port}`);
        });

        this.setupGracefulShutdown();
    }

    public stop(): void {
        this._server.close();
    }

    private setupGracefulShutdown(): void {
        const shutdown = (signal: string) => {
            console.log(`${signal} received, shutting down gracefully`);
            this._server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}
