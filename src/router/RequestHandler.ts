import * as http from 'http';
import * as url from 'url';
import { RouteManager } from './RouteManager';
import { ResponseHelper } from './ResponseHelper';
import { HttpMethod } from '@/types';
import { logger } from '@/helpers/logger';

export class RequestHandler {
    constructor(private routeManager: RouteManager) { }

    public handle(req: http.IncomingMessage, res: http.ServerResponse): void {
        const parsedUrl = url.parse(req.url || '/', true);
        const method = req.method as HttpMethod || HttpMethod.GET;
        const pathname = parsedUrl.pathname || '/';

        this.logRequest(method, pathname);
        ResponseHelper.setupCORSHeaders(res);

        if (method === HttpMethod.OPTIONS) {
            ResponseHelper.handleOptionsRequest(res);
            return;
        }

        this.processRoute(method, pathname, req, res);
    }

    private logRequest(method: HttpMethod, pathname: string): void {
        console.log(`${new Date().toISOString()} - ${method} ${pathname}`);
    }

    private processRoute(
        method: HttpMethod,
        pathname: string,
        req: http.IncomingMessage,
        res: http.ServerResponse,
    ): void {
        const route = this.routeManager.findRoute(method, pathname);

        if (route) {
            try {
                route.handler(req, res);
            } catch (error) {
                logger.error('Route handler error:', error);
                ResponseHelper.sendError(res, 500, 'Internal server error');
            }
        } else {
            ResponseHelper.sendJSON(res, 404, { error: 'Route not found', path: pathname });
        }
    }
}
