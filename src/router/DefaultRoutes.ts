import { RouteManager } from './RouteManager';
import { ResponseHelper } from './ResponseHelper';
import { HttpMethod } from '@/types';

export class DefaultRoutes {
    public static setup(routeManager: RouteManager): void {
        routeManager.addRoute(HttpMethod.GET, '/status', (_, res) => {
            ResponseHelper.sendJSON(res, 200, {
                status: 'OK',
                message: 'Hotel Booking API is running',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            });
        });

        routeManager.addRoute(HttpMethod.GET, '/health', (_, res) => {
            ResponseHelper.sendJSON(res, 200, { status: 'healthy' });
        });
    }
}
