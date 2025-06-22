import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { ResponseHelper } from '@/router';
import { CatchServerError } from '@/decorators/CatchServerError';
import { Log } from '@/decorators/Log';
import { BookingRequestData } from './types';
import { BaseRouteService } from '../BaseRouteService';
import { BookingFacade } from '@/facade/types';


export class BookingRoutesService extends BaseRouteService {
    constructor(protected facade: BookingFacade) {
        super(facade);
    }

    @Log
    @CatchServerError
    getAllBookings = async (_: IncomingMessage, res: ServerResponse): Promise<void> => {
        const statusData = this.facade.getAllBookings();
        ResponseHelper.sendJSON(res, 200, statusData);
    };

    @Log
    @CatchServerError
    getBookingById = async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const bookingId = this.extractIdFromPath(req.url || '');

        if (!bookingId) {
            ResponseHelper.sendError(res, 400, 'Invalid booking ID');
            return;
        }

        const bookingInfo = this.facade.getBookingInfo(bookingId);
        if (bookingInfo.booking) {
            ResponseHelper.sendJSON(res, 200, {
                booking: bookingInfo.booking,
                status: bookingInfo.status,
            });
        } else {
            ResponseHelper.sendError(res, 404, 'Booking not found');
        }
    };

    @Log
    @CatchServerError
    createBooking = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const bookingData = await this.parseRequestBody<BookingRequestData>(req);

        const booking = await this.facade.bookRoom(
            Boolean(bookingData.isDeluxe),
            new Date(bookingData.checkIn),
            new Date(bookingData.checkOut),
            bookingData.payment,
        );

        if (booking.success) {
            ResponseHelper.sendJSON(res, 201, {
                booking,
                message: 'Booking created successfully',
            });
        } else {
            ResponseHelper.sendError(res, 500, booking.message || 'Failed to create booking');
        }
    };

    @Log
    @CatchServerError
    deleteBooking = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const bookingId = this.extractIdFromPath(req.url || '');
        if (!bookingId) {
            ResponseHelper.sendError(res, 400, 'Invalid booking ID');
            return;
        }

        const success = await this.facade.cancelBooking(bookingId);
        if (success.success) {
            ResponseHelper.sendJSON(res, 200, {
                message: 'Booking cancelled successfully',
                bookingId,
            });
        } else {
            ResponseHelper.sendError(res, 404, 'Booking not found or cannot be cancelled');
        }

    };

    @Log
    @CatchServerError
    confirmBooking = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const bookingId = this.extractIdFromPath(req.url || '');

        if (!bookingId) {
            ResponseHelper.sendError(res, 400, 'Invalid booking ID');
            return;
        }

        const success = this.facade.confirmBooking(bookingId);
        if (success.success) {
            ResponseHelper.sendJSON(res, 200, {
                message: 'Booking confirmed successfully',
                bookingId,
            });
        } else {
            ResponseHelper.sendError(res, 404, 'Booking not found or cannot be confirmed');
        }

    };
}
