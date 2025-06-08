import { RouteManager } from '@/router';
import { HotelBookingFacade } from '@/facade';

import { RoomRoutesController } from './RoomRoutes/controller';
import { BookingRoutesController } from './BookingRoutes/controller';
import { DefaultRoutesController } from './DefaultRoutes/controller';


export const RouteSetup = (routeManager: RouteManager, facade: HotelBookingFacade) => {
    new BookingRoutesController(routeManager, facade);
    new RoomRoutesController(routeManager, facade);
    new DefaultRoutesController(routeManager);
};
