import {
    BookingDetails,
    Guest,
    PaymentInfo,
    Room,
    BookingAction,
    BookingActionInfo,
} from '@/types';
import {
    GuestService,
    RoomService,
    PaymentService,
    NotificationService,
    BookingService,
} from '@/services';
import { BookingFacade } from './types';


export class HotelBookingFacade implements BookingFacade {
    private guestService: GuestService;
    private roomService: RoomService;
    private paymentService: PaymentService;
    private notificationService: NotificationService;
    private bookingService: BookingService;

    constructor(
        guestService: GuestService,
        roomService: RoomService,
        paymentService: PaymentService,
        notificationService: NotificationService,
        bookingService: BookingService,
    ) {
        this.guestService = guestService;
        this.roomService = roomService;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
        this.bookingService = bookingService;
    }

    public async bookRoom(
        guest: Guest,
        isDeluxe: boolean,
        checkInDate: Date,
        checkOutDate: Date,
        paymentInfo: PaymentInfo,
    ): Promise<{ success: boolean; bookingId?: string; message: string }> {
        try {
            console.log(`\n=== Starting booking process for ${guest.name} ===`);

            if (!this.guestService.validateGuest(guest.id)) {
                this.guestService.registerGuest(guest);
            }

            const availableRooms = await this.roomService.getRoomsByType(isDeluxe);
            if (availableRooms.length === 0) {
                return { success: false, message: `No ${isDeluxe ? 'deluxe' : 'standard'} rooms available` };
            }

            const selectedRoom = availableRooms[0];

            const nights = Math.ceil(
                (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
            );
            const totalPrice = selectedRoom.price * nights;

            const bookingId = this.bookingService.generateBookingId();

            const paymentSuccess = this.paymentService.processPayment(
                totalPrice,
                paymentInfo.cardNumber,
                bookingId,
                guest.id,
            );
            if (!paymentSuccess) {
                return { success: false, message: 'Payment processing failed' };
            }

            const reservationSuccess = await this.roomService.reserveRoom(selectedRoom.id);
            if (!reservationSuccess) {
                return { success: false, message: 'Failed to reserve room' };
            }

            const bookingDetails: BookingDetails = {
                id: bookingId,
                guestId: guest.id,
                roomId: selectedRoom.id,
                checkInDate,
                checkOutDate,
                totalPrice,
                createdAt: new Date(),
            };

            this.bookingService.createBooking(bookingDetails);

            this.notificationService.sendBookingConfirmation(guest.email, bookingId);
            this.notificationService.sendReceiptEmail(guest.email, totalPrice);

            console.log(`=== Booking completed successfully! Booking ID: ${bookingId} ===\n`);

            return {
                success: true,
                bookingId,
                message: `Booking created successfully. Room ${selectedRoom.number} reserved for ${nights} nights.`,
            };

        } catch (error) {
            console.error('Booking failed:', error);
            return { success: false, message: 'An unexpected error occurred during booking' };
        }
    }

    public confirmBooking(bookingId: string): { success: boolean; message: string } {
        const booking = this.bookingService.getBooking(bookingId);
        if (!booking) {
            return { success: false, message: 'Booking not found' };
        }

        try {
            booking.confirm();
            const guest = this.guestService.getGuest(booking.getDetails().guestId);
            if (guest) {
                this.notificationService.sendCheckInReminder(guest.email, bookingId);
            }
            return { success: true, message: 'Booking confirmed successfully' };
        } catch (error) {
            return { success: false, message: error instanceof Error ? error.message : 'Confirmation failed' };
        }
    }

    public async cancelBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
        const booking = this.bookingService.getBooking(bookingId);
        if (!booking) {
            return { success: false, message: 'Booking not found' };
        }

        try {
            const bookingDetails = booking.getDetails();
            booking.cancel();

            await this.roomService.releaseRoom(bookingDetails.roomId);

            this.paymentService.refundPayment(bookingDetails.totalPrice, bookingId);

            const guest = this.guestService.getGuest(bookingDetails.guestId);
            if (guest) {
                this.notificationService.sendCancellationNotice(guest.email, bookingId);
            }

            return { success: true, message: 'Booking cancelled successfully' };
        } catch (error) {
            return { success: false, message: error instanceof Error ? error.message : 'Cancellation failed' };
        }
    }

    public checkIn(bookingId: string): { success: boolean; message: string } {
        const booking = this.bookingService.getBooking(bookingId);
        if (!booking) {
            return { success: false, message: 'Booking not found' };
        }

        try {
            booking.checkIn();
            return { success: true, message: 'Check-in completed successfully' };
        } catch (error) {
            return { success: false, message: error instanceof Error ? error.message : 'Check-in failed' };
        }
    }

    public async checkOut(bookingId: string): Promise<{ success: boolean; message: string }> {
        const booking = this.bookingService.getBooking(bookingId);
        if (!booking) {
            return { success: false, message: 'Booking not found' };
        }

        try {
            const bookingDetails = booking.getDetails();
            booking.checkOut();

            await this.roomService.releaseRoom(bookingDetails.roomId);

            return { success: true, message: 'Check-out completed successfully' };
        } catch (error) {
            return { success: false, message: error instanceof Error ? error.message : 'Check-out failed' };
        }
    }

    public getBookingInfo(bookingId: string): {
        booking?: BookingDetails;
        status?: string;
        availableActions?: BookingAction[];
        availableActionInfos?: BookingActionInfo[];
        message: string
    } {
        const booking = this.bookingService.getBooking(bookingId);
        if (!booking) {
            return { message: 'Booking not found' };
        }

        return {
            booking: booking.getDetails(),
            status: booking.getStatus(),
            availableActions: booking.getAvailableActions(),
            availableActionInfos: booking.getAvailableActionInfos(),
            message: 'Booking information retrieved successfully',
        };
    }

    public async getAvailableRooms(): Promise<Room[]> {
        return await this.roomService.getAvailableRooms();
    }

    public getAllBookings(): { bookingId: string; details: BookingDetails; status: string }[] {
        return this.bookingService.getAllBookings().map(booking => ({
            bookingId: booking.getDetails().id,
            details: booking.getDetails(),
            status: booking.getStatus(),
        }));
    }

    public deleteBooking(bookingId: string): { success: boolean; message: string } {
        const success = this.bookingService.deleteBooking(bookingId);

        if (success) {
            return { success: true, message: 'Booking deleted successfully' };
        } else {
            return { success: false, message: 'Booking not found or could not be deleted' };
        }
    }

    public getRoomServiceForTesting(): RoomService {
        return this.roomService;
    }
}
