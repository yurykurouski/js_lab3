import { PaymentInfo } from '@/types';

export interface BookingRequestData {
    guestId?: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    checkIn: string;
    checkOut: string;
    isDeluxe: boolean;
    checkInDate: Date;
    checkOutDate: Date;
    payment: PaymentInfo;
}
