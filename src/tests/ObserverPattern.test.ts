import { BookingEventManager, NotificationObserver, AuditLogObserver, MetricsObserver } from '../patterns/observer';
import { BookingEventType } from '../patterns/observer';
import { NotificationService } from '../services/NotificationService';
import { BookingDetails, BookingStatus, RoomType } from '../types';

describe('Observer Pattern - Booking Event System', () => {
    let eventManager: BookingEventManager;
    let notificationService: NotificationService;
    let notificationObserver: NotificationObserver;
    let auditLogObserver: AuditLogObserver;
    let metricsObserver: MetricsObserver;

    beforeEach(() => {
        // Reset singleton instance for each test
        BookingEventManager.reset();
        eventManager = BookingEventManager.getInstance();

        notificationService = new NotificationService();
        notificationObserver = new NotificationObserver(notificationService);
        auditLogObserver = new AuditLogObserver();
        metricsObserver = new MetricsObserver();

        // Clear metrics for clean test state
        metricsObserver.resetMetrics();
        auditLogObserver.clearLog();
    });

    test('should create singleton event manager', () => {
        const manager1 = BookingEventManager.getInstance();
        const manager2 = BookingEventManager.getInstance();
        expect(manager1).toBe(manager2);
    });

    test('should subscribe and unsubscribe observers', () => {
        expect(eventManager.getObserverCount()).toBe(0);

        eventManager.subscribe(notificationObserver);
        expect(eventManager.getObserverCount()).toBe(1);

        eventManager.subscribe(auditLogObserver);
        expect(eventManager.getObserverCount()).toBe(2);

        eventManager.unsubscribe(notificationObserver);
        expect(eventManager.getObserverCount()).toBe(1);
    });

    test('should notify observers of booking state changes', () => {
        eventManager.subscribe(auditLogObserver);
        eventManager.subscribe(metricsObserver);

        const bookingDetails: BookingDetails = {
            id: 'TEST_BOOKING_001',
            guestId: 'guest_001',
            roomId: 'room_101',
            checkInDate: new Date('2025-06-15'),
            checkOutDate: new Date('2025-06-18'),
            totalPrice: 300,
            createdAt: new Date(),
        };

        eventManager.publishBookingStateChange(
            'TEST_BOOKING_001',
            BookingEventType.BOOKING_CONFIRMED,
            bookingDetails,
            BookingStatus.CONFIRMED,
            BookingStatus.NEW,
        );

        // Check that audit log received the event
        expect(auditLogObserver.getEventCount()).toBe(1);
        const events = auditLogObserver.getEventLog();
        expect(events[0].type).toBe(BookingEventType.BOOKING_CONFIRMED);
        expect(events[0].bookingId).toBe('TEST_BOOKING_001');

        // Check that metrics were updated
        expect(metricsObserver.getEventCount(BookingEventType.BOOKING_CONFIRMED)).toBe(1);
    });

    test('should handle payment events', () => {
        eventManager.subscribe(metricsObserver);

        eventManager.publishPaymentProcessed(
            'TEST_BOOKING_001',
            'guest_001',
            300,
            'credit_card',
        );

        expect(metricsObserver.getEventCount(BookingEventType.PAYMENT_PROCESSED)).toBe(1);
    });

    test('should handle room operation events', () => {
        eventManager.subscribe(auditLogObserver);

        eventManager.publishRoomOperation(
            'TEST_BOOKING_001',
            'room_101',
            RoomType.STANDARD,
            BookingEventType.ROOM_RESERVED,
        );

        const events = auditLogObserver.getEventLog();
        expect(events[0].type).toBe(BookingEventType.ROOM_RESERVED);
        expect(events[0].roomId).toBe('room_101');
    });

    test('should handle observer errors gracefully', () => {
        // Create a faulty observer that throws an error
        const faultyObserver = {
            getId: () => 'faulty-observer',
            update: () => {
                throw new Error('Observer error');
            },
        };

        eventManager.subscribe(faultyObserver);
        eventManager.subscribe(auditLogObserver); // This should still work

        const bookingDetails: BookingDetails = {
            id: 'TEST_BOOKING_002',
            guestId: 'guest_002',
            roomId: 'room_102',
            checkInDate: new Date('2025-06-20'),
            checkOutDate: new Date('2025-06-23'),
            totalPrice: 450,
            createdAt: new Date(),
        };

        // Should not throw despite faulty observer
        expect(() => {
            eventManager.publishBookingStateChange(
                'TEST_BOOKING_002',
                BookingEventType.BOOKING_CREATED,
                bookingDetails,
                BookingStatus.NEW,
            );
        }).not.toThrow();

        // Audit log should still receive the event
        expect(auditLogObserver.getEventCount()).toBe(1);
    });

    test('MetricsObserver should track multiple event types', () => {
        eventManager.subscribe(metricsObserver);

        const bookingDetails: BookingDetails = {
            id: 'TEST_BOOKING_003',
            guestId: 'guest_003',
            roomId: 'room_103',
            checkInDate: new Date('2025-07-01'),
            checkOutDate: new Date('2025-07-05'),
            totalPrice: 600,
            createdAt: new Date(),
        };

        // Generate multiple events
        eventManager.publishBookingStateChange(
            'TEST_BOOKING_003',
            BookingEventType.BOOKING_CREATED,
            bookingDetails,
            BookingStatus.NEW,
        );

        eventManager.publishPaymentProcessed(
            'TEST_BOOKING_003',
            'guest_003',
            600,
            'debit_card',
        );

        eventManager.publishBookingStateChange(
            'TEST_BOOKING_003',
            BookingEventType.BOOKING_CONFIRMED,
            bookingDetails,
            BookingStatus.CONFIRMED,
            BookingStatus.NEW,
        );

        // Verify metrics
        expect(metricsObserver.getEventCount(BookingEventType.BOOKING_CREATED)).toBe(1);
        expect(metricsObserver.getEventCount(BookingEventType.PAYMENT_PROCESSED)).toBe(1);
        expect(metricsObserver.getEventCount(BookingEventType.BOOKING_CONFIRMED)).toBe(1);
    });

    test('AuditLogObserver should maintain event order', () => {
        eventManager.subscribe(auditLogObserver);

        const bookingDetails: BookingDetails = {
            id: 'TEST_BOOKING_004',
            guestId: 'guest_004',
            roomId: 'room_104',
            checkInDate: new Date('2025-07-10'),
            checkOutDate: new Date('2025-07-15'),
            totalPrice: 750,
            createdAt: new Date(),
        };

        // Publish events in sequence
        eventManager.publishBookingStateChange(
            'TEST_BOOKING_004',
            BookingEventType.BOOKING_CREATED,
            bookingDetails,
            BookingStatus.NEW,
        );

        eventManager.publishBookingStateChange(
            'TEST_BOOKING_004',
            BookingEventType.BOOKING_CONFIRMED,
            bookingDetails,
            BookingStatus.CONFIRMED,
            BookingStatus.NEW,
        );

        eventManager.publishBookingStateChange(
            'TEST_BOOKING_004',
            BookingEventType.GUEST_CHECKED_IN,
            bookingDetails,
            BookingStatus.CHECKED_IN,
            BookingStatus.CONFIRMED,
        );

        const events = auditLogObserver.getEventLog();
        expect(events).toHaveLength(3);
        expect(events[0].type).toBe(BookingEventType.BOOKING_CREATED);
        expect(events[1].type).toBe(BookingEventType.BOOKING_CONFIRMED);
        expect(events[2].type).toBe(BookingEventType.GUEST_CHECKED_IN);
    });

    test('should handle multiple observers for same event', () => {
        const auditLogObserver2 = new AuditLogObserver('audit-log-2');

        eventManager.subscribe(auditLogObserver);
        eventManager.subscribe(auditLogObserver2);
        eventManager.subscribe(metricsObserver);

        const bookingDetails: BookingDetails = {
            id: 'TEST_BOOKING_005',
            guestId: 'guest_005',
            roomId: 'room_105',
            checkInDate: new Date('2025-08-01'),
            checkOutDate: new Date('2025-08-05'),
            totalPrice: 500,
            createdAt: new Date(),
        };

        eventManager.publishBookingStateChange(
            'TEST_BOOKING_005',
            BookingEventType.BOOKING_CANCELLED,
            bookingDetails,
            BookingStatus.CANCELLED,
            BookingStatus.CONFIRMED,
        );

        // All observers should have received the event
        expect(auditLogObserver.getEventCount()).toBe(1);
        expect(auditLogObserver2.getEventCount()).toBe(1);
        expect(metricsObserver.getEventCount(BookingEventType.BOOKING_CANCELLED)).toBe(1);
    });
});
