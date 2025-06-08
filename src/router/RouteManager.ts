import { Route } from './types';
import { HttpMethod } from '@/types';
import * as http from 'http';

export class RouteManager {
    private _routes: Route[] = [];

    public addRoute(
        method: HttpMethod,
        path: string,
        handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
    ): void {
        this._routes.push({ method, path, handler });
    }

    public findRoute(method: HttpMethod, path: string): Route | undefined {
        return this._routes.find(r => r.method === method && r.path === path);
    }

    public get routes(): Route[] {
        return [...this._routes];
    }

    public clearRoutes(): void {
        this._routes = [];
    }
}
