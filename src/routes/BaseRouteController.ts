import { RouteManager } from '@/router';
import { BaseRouteService } from './BaseRouteService';


export abstract class BaseRouteController<T extends BaseRouteService = BaseRouteService> {
    constructor(routeManager: RouteManager, service: T) {
        this.setup(routeManager, service);
    }

    public abstract setup(routeManager: RouteManager, service: T): void;
}

