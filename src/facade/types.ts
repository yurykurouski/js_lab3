import { RoomService } from '@/services';
import { Guest, PaymentInfo, BookingDetails, BookingAction, BookingActionInfo, Room } from '@/types';

export interface BookingFacade {
    bookRoom(
        guest: Guest,
        isDeluxe: boolean,
        checkInDate: Date,
        checkOutDate: Date,
        paymentInfo: PaymentInfo,
    ): Promise<{ success: boolean; bookingId?: string; message: string }>;
    confirmBooking(bookingId: string): { success: boolean; message: string };
    cancelBooking(bookingId: string): Promise<{ success: boolean; message: string }>;
    checkIn(bookingId: string): { success: boolean; message: string };
    checkOut(bookingId: string): Promise<{ success: boolean; message: string }>;
    getBookingInfo(bookingId: string): {
        booking?: BookingDetails;
        status?: string;
        availableActions?: BookingAction[];
        availableActionInfos?: BookingActionInfo[];
        message: string;
    };
    getAvailableRooms(): Promise<Room[]>;
    getAllBookings(): { bookingId: string; details: BookingDetails; status: string }[];
    deleteBooking(bookingId: string): { success: boolean; message: string };
    getRoomServiceForTesting(): RoomService;
}
