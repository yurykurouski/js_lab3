import { RouteManager } from '@/router';
import { HttpMethod } from '@/types';
import { BaseRouteController } from '../BaseRouteController';
import { BookingRoutesService } from './service';
import { BookingFacade } from '@/facade/types';

export class BookingRoutesController extends BaseRouteController<BookingRoutesService> {
    constructor(routeManager: RouteManager, facade: BookingFacade) {
        super(routeManager, new BookingRoutesService(facade));
    }

    setup(routeManager: RouteManager, service: BookingRoutesService): void {
        routeManager.addRoute(HttpMethod.GET, '/api/bookings', service.getAllBookings);
        routeManager.addRoute(HttpMethod.GET, '/api/bookings/:id', service.getBookingById);
        routeManager.addRoute(HttpMethod.POST, '/api/bookings', service.createBooking);
        routeManager.addRoute(HttpMethod.DELETE, '/api/bookings/:id', service.deleteBooking);
        routeManager.addRoute(HttpMethod.PUT, '/api/bookings/:id/confirm', service.confirmBooking);
    }
}
