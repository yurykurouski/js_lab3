export interface Guest {
    id: string;
    name: string;
    email: string;
    phone: string;
}

export interface Room {
    id: string;
    number: string;
    isDeluxe: boolean;
    price: number;
    isAvailable: boolean;
}

export enum RoomType {
    STANDARD = 'standard',
    DELUXE = 'deluxe',
}

export interface BookingDetails {
    id: string;
    guestId: string;
    roomId: string;
    checkInDate: Date;
    checkOutDate: Date;
    totalPrice: number;
    createdAt: Date;
}

export interface PaymentInfo {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardHolderName: string;
}

export enum BookingStatus {
    NEW = 'new',
    CONFIRMED = 'confirmed',
    CHECKED_IN = 'checked_in',
    CHECKED_OUT = 'checked_out',
    CANCELLED = 'cancelled',
}

export enum BookingAction {
    CONFIRM = 'confirm',
    CANCEL = 'cancel',
    CHECK_IN = 'checkin',
    CHECK_OUT = 'checkout',
}

export interface BookingActionInfo {
    action: BookingAction;
    label: string;
    description: string;
}

