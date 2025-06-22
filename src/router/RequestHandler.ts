import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
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

        if (method === HttpMethod.GET && this.isStaticFile(pathname)) {
            this.serveStaticFile(pathname, res);
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

    private isStaticFile(pathname: string): boolean {
        return pathname === '/' ||
            pathname.endsWith('.html') ||
            pathname.endsWith('.css') ||
            pathname.endsWith('.js') ||
            pathname.endsWith('.ico') ||
            pathname.endsWith('.png') ||
            pathname.endsWith('.jpg') ||
            pathname.endsWith('.jpeg') ||
            pathname.endsWith('.svg');
    }

    private serveStaticFile(pathname: string, res: http.ServerResponse): void {
        if (pathname === '/') {
            pathname = '/index.html';
        }

        const filePath = path.join(process.cwd(), 'public', pathname);

        if (!filePath.startsWith(path.join(process.cwd(), 'public'))) {
            ResponseHelper.sendError(res, 403, 'Forbidden');
            return;
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    ResponseHelper.sendError(res, 404, 'File not found');
                } else {
                    logger.error('File read error:', err);
                    ResponseHelper.sendError(res, 500, 'Internal server error');
                }
                return;
            }

            const contentType = this.getContentType(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    }

    private getContentType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
        };
        return mimeTypes[ext] || 'text/plain';
    }
}
