import { RoomService, NotificationService, BookingService } from '@/services';

export interface ServiceFactoryConfig {
    enableObservers?: boolean;
    initializationTimeout?: number;
    localMode?: boolean;
}

export interface ServiceCollection {
    roomService: RoomService;
    notificationService: NotificationService;
    bookingService: BookingService;
}
