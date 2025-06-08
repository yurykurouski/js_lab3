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
        return this._routes.find(r => {
            if (r.method !== method) return false;

            if (r.path === path) return true;

            return this.matchParameterizedRoute(r.path, path);
        });
    }

    private matchParameterizedRoute(routePath: string, requestPath: string): boolean {
        const routeParts = routePath.split('/');
        const requestParts = requestPath.split('/');

        if (routeParts.length !== requestParts.length) return false;

        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const requestPart = requestParts[i];

            if (routePart.startsWith(':')) continue;

            if (routePart !== requestPart) return false;
        }

        return true;
    }

    public get routes(): Route[] {
        return [...this._routes];
    }

    public clearRoutes(): void {
        this._routes = [];
    }
}
