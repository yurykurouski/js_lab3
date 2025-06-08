import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { ResponseHelper } from '@/router';
import { CatchServerError } from '@/decorators/CatchServerError';
import { BookingRequestData } from './types';
import { Guest } from '@/types';
import { BaseRouteService } from '../BaseRouteService';
import { BookingFacade } from '@/facade/types';


export class BookingRoutesService extends BaseRouteService {
    constructor(protected facade: BookingFacade) {
        super(facade);
    }

    @CatchServerError
    getAllBookings = async (_: IncomingMessage, res: ServerResponse): Promise<void> => {
        const statusData = this.facade.getAllBookings();
        ResponseHelper.sendJSON(res, 200, statusData);
    };

    @CatchServerError
    getBookingById = (req: http.IncomingMessage, res: http.ServerResponse) => {
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
                availableActions: bookingInfo.availableActions,
            });
        } else {
            ResponseHelper.sendError(res, 404, 'Booking not found');
        }
    };

    @CatchServerError
    createBooking = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const bookingData = await this.parseRequestBody<BookingRequestData>(req);

        if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.payment) {
            ResponseHelper.sendError(res, 400, 'Missing required fields: checkIn, checkOut, payment');
            return;
        }

        let guest: Guest;
        if (bookingData.guestId) {
            guest = {
                id: bookingData.guestId,
                name: bookingData.guestName || 'Unknown',
                email: bookingData.guestEmail || 'unknown@example.com',
                phone: bookingData.guestPhone || '+0000000000',
            };
        } else if (
            bookingData.guestName
            && bookingData.guestEmail
            && bookingData.guestPhone
        ) {
            guest = {
                id: `guest_${Date.now()}`,
                name: bookingData.guestName,
                email: bookingData.guestEmail,
                phone: bookingData.guestPhone,
            };
        } else {
            ResponseHelper.sendError(res, 400, 'Either guestId or complete guest info (name, email, phone) required');
            return;
        }

        const booking = await this.facade.bookRoom(
            guest,
            Boolean(bookingData.isDeluxe),
            new Date(bookingData.checkIn),
            new Date(bookingData.checkOut),
            bookingData.payment,
        );

        ResponseHelper.sendJSON(res, 201, {
            booking,
            message: 'Booking created successfully',
        });
    };

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
