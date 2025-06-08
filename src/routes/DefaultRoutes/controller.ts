import { RouteManager } from '@/router';
import { HttpMethod } from '@/types';
import { BaseRouteController } from '../BaseRouteController';
import { DefaultRoutesService } from './service';


export class DefaultRoutesController extends BaseRouteController<DefaultRoutesService> {
    constructor(routeManager: RouteManager) {
        super(routeManager, new DefaultRoutesService());
    }

    setup(routeManager: RouteManager, service: DefaultRoutesService): void {
        routeManager.addRoute(HttpMethod.GET, '/status', service.getStatus);
        routeManager.addRoute(HttpMethod.GET, '/health', service.getHealth);
    }
}

