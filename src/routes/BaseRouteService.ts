import { BookingFacade } from '@/facade/types';
import { IncomingMessage } from 'http';

export abstract class BaseRouteService {
    constructor(protected service?: BookingFacade) { }

    public extractIdFromPath(url: string): string | null {
        const pathOnly = url.split('?')[0];
        const match = pathOnly.match(/\/([^/]+)$/);
        return match ? match[1] : null;
    }

    public extractParamFromPath(url: string, paramName: string): string | null {
        const regex = new RegExp(`/${paramName}/([^/]+)`);
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    public parseQueryParams(url: string): Record<string, string> {
        const params: Record<string, string> = {};
        const urlObj = new URL(url, 'http://localhost');
        urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }

    public async parseRequestBody<T extends object>(
        req: IncomingMessage,
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            let body = '';

            req.on('data', (chunk: Buffer) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    if (body.trim() === '') {
                        resolve({} as T);
                    } else {
                        resolve(JSON.parse(body) as T);
                    }
                } catch {
                    reject(new Error('Invalid JSON in request body'));
                }
            });
            req.on('error', (error: Error) => {
                reject(error);
            });
        });
    }

    public extractTypeFromPath(urlPath: string): string | null {
        const parsedUrl = new URL(urlPath, 'http://localhost');
        const pathname = parsedUrl.pathname || '';
        const parts = pathname.split('/');

        const typeIndex = parts.indexOf('type');
        if (typeIndex !== -1 && parts.length > typeIndex + 1) {
            return parts[typeIndex + 1];
        }

        return null;
    }
}
