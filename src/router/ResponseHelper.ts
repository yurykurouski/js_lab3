import * as http from 'http';

export class ResponseHelper {
    public static sendResponse(
        res: http.ServerResponse,
        statusCode: number,
        contentType: string,
        content: string,
    ): void {
        res.writeHead(statusCode, { 'Content-Type': contentType });
        res.end(content);
    }

    public static sendJSON(res: http.ServerResponse, statusCode: number, data: unknown): void {
        this.sendResponse(res, statusCode, 'application/json', JSON.stringify(data, null, 2));
    }

    public static sendError(res: http.ServerResponse, statusCode: number, message: string): void {
        this.sendJSON(res, statusCode, { error: message });
    }

    public static setupCORSHeaders(res: http.ServerResponse): void {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    public static handleOptionsRequest(res: http.ServerResponse): void {
        this.setupCORSHeaders(res);
        res.writeHead(200);
        res.end();
    }
}
