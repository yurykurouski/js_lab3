import { PaymentInfo } from '@/types';

export interface BookingRequestData {
    checkIn: string;
    checkOut: string;
    isDeluxe: boolean;
    checkInDate: Date;
    checkOutDate: Date;
    payment: PaymentInfo;
}
