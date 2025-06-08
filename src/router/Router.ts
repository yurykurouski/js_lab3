import * as http from 'http';
import { Route } from './types';
import { HotelBookingFacade } from '@/facade';
import { HttpMethod } from '@/types';
import { HttpServer } from './HttpServer';
import { RouteManager } from './RouteManager';
import { RequestHandler } from './RequestHandler';
import { RouteSetup } from '@/routes';


export class Router {
    private static _instance: Router | undefined;
    private readonly _httpServer: HttpServer;
    private readonly _routeManager: RouteManager;
    private readonly _requestHandler: RequestHandler;
    private readonly _facade: HotelBookingFacade;

    constructor(port: number = 3000, facade: HotelBookingFacade) {
        this._facade = facade;
        this._routeManager = new RouteManager();
        this._requestHandler = new RequestHandler(this._routeManager);
        this._httpServer = new HttpServer(
            port,
            this._requestHandler.handle.bind(this._requestHandler),
        );

        this._setupRoutes();
    }

    public get server(): http.Server {
        return this._httpServer.server;
    }
    public get port(): number {
        return this._httpServer.port;
    }
    public get routes(): Route[] {
        return this._routeManager.routes;
    }
    public get facade(): HotelBookingFacade {
        return this._facade;
    }

    private _setupRoutes(): void {
        RouteSetup(this._routeManager, this._facade);
    }

    public static getInstance(): Router {
        if (!this._instance) {
            throw new Error('Router instance not initialized. Please create an instance first.');
        }
        return this._instance;
    }

    public static create(port: number, facade: HotelBookingFacade): Router {
        if (this._instance) {
            throw new Error('Router instance already exists. Use getInstance() to access it.');
        }
        this._instance = new Router(port, facade);

        return this._instance;
    }

    public addRoute(
        method: HttpMethod,
        path: string,
        handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
    ): void {
        this._routeManager.addRoute(method, path, handler);
    }


    public start(): void {
        this._httpServer.start();
    }

    public stop(): void {
        this._httpServer.stop();
    }

    /**
     * Reset the singleton instance for testing purposes
     */
    public static resetInstance(): void {
        Router._instance = undefined;
    }
}
