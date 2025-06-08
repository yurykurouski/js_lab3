import { GuestService, RoomService, PaymentService, NotificationService, BookingService } from '@/services';

export interface ServiceFactoryConfig {
    enableObservers?: boolean;
    enableMetrics?: boolean;
    initializationTimeout?: number;
    localMode?: boolean;
}

export interface ServiceCollection {
    guestService: GuestService;
    roomService: RoomService;
    paymentService: PaymentService;
    notificationService: NotificationService;
    bookingService: BookingService;
}
