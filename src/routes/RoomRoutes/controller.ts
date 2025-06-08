import { RouteManager } from '@/router';
import { HttpMethod } from '@/types';
import { BaseRouteController } from '../BaseRouteController';
import { RoomRoutesService } from './service';
import { BookingFacade } from '@/facade/types';


export class RoomRoutesController extends BaseRouteController<RoomRoutesService> {
    constructor(routeManager: RouteManager, facade: BookingFacade) {
        super(routeManager, new RoomRoutesService(facade));
    }

    setup(routeManager: RouteManager, service: RoomRoutesService): void {
        routeManager.addRoute(HttpMethod.GET, '/api/rooms', service.getAllRooms);
        routeManager.addRoute(HttpMethod.GET, '/api/rooms/type/:type', service.getRoomsByType);
        routeManager.addRoute(HttpMethod.GET, '/api/rooms/:id', service.getRoomById);
    }
}

