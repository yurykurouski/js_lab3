import { logger } from '@/helpers/logger';
import { ServiceInitializationError } from '@/exceptions/ServiceInitializationError';
import {
    GuestService,
    RoomService,
    PaymentService,
    NotificationService,
    BookingService,
} from '@/services';
import { HotelBookingFacade } from '@/facade';
import { LoadingIndicator } from '@/helpers';
import {
    BookingEventManager,
    NotificationObserver,
    AuditLogObserver,
    MetricsObserver,
} from '@/observers';
import { ServiceCollection, ServiceFactoryConfig } from './types';


export class ServiceFactory {
    private static readonly DEFAULT_CONFIG: Required<ServiceFactoryConfig> = {
        enableObservers: true,
        enableMetrics: true,
        initializationTimeout: 30000,
        localMode: false,
    };


    /**
      Initialize all services
     */
    public static async initializeServices(
        config?: ServiceFactoryConfig,
    ): Promise<HotelBookingFacade> {
        const loader = new LoadingIndicator('Loading...');
        loader.start();

        try {
            const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

            const services = this.createServiceInstances();

            await this.initializeAsyncServices(services, finalConfig);

            this.setupObserver(services.notificationService, finalConfig);

            const facade = this.createFacadeInstance(services);

            loader.stop();

            return facade;
        } catch (error) {
            loader.stop('❌ Something went wrong!');
            this.handleInitializationError(error);
            throw error;
        }
    }

    /**
     * Create all service instances
     */
    private static createServiceInstances() {
        return {
            guestService: new GuestService(),
            roomService: new RoomService(),
            paymentService: new PaymentService(),
            notificationService: new NotificationService(),
            bookingService: new BookingService(),
        };
    }

    private static async initializeAsyncServices(
        services: ServiceCollection,
        config: Required<ServiceFactoryConfig>,
    ): Promise<void> {
        try {
            if (config.localMode) {
                await services.roomService.initializeWithDefaultRooms();
            } else {
                await services.roomService.initializeRooms();
            }
        } catch (error) {
            throw new ServiceInitializationError(
                'Failed to initialize room service',
                'RoomService',
                error instanceof Error ? error : new Error(String(error)),
            );
        }
    }

    // ??
    private static setupObserver(
        notificationService: NotificationService,
        config: Required<ServiceFactoryConfig>,
    ): void {
        try {
            const eventManager = BookingEventManager.getInstance();

            // Create and register observers
            const notificationObserver = new NotificationObserver(notificationService);
            const auditLogObserver = new AuditLogObserver();

            eventManager.subscribe(notificationObserver);
            eventManager.subscribe(auditLogObserver);

            // Conditionally add metrics observer
            if (config.enableMetrics) {
                const metricsObserver = new MetricsObserver();
                eventManager.subscribe(metricsObserver);
            }
        } catch (error) {
            throw new ServiceInitializationError(
                'Failed to setup observer pattern',
                'ObserverSetup',
                error instanceof Error ? error : new Error(String(error)),
            );
        }
    }


    private static createFacadeInstance(services: ServiceCollection): HotelBookingFacade {
        try {
            return new HotelBookingFacade(
                services.guestService,
                services.roomService,
                services.paymentService,
                services.notificationService,
                services.bookingService,
            );
        } catch (error) {
            throw new ServiceInitializationError(
                'Failed to create facade instance',
                'HotelBookingFacade',
                error instanceof Error ? error : new Error(String(error)),
            );
        }
    }

    /**
     * Handle initialization errors with proper logging
     */
    private static handleInitializationError(error: unknown): void {
        if (error instanceof ServiceInitializationError) {
            logger.error(`Service initialization failed in ${error.serviceName}:`, error.message);
            if (error.originalError) {
                logger.error('Original error:', error.originalError);
            }
        } else {
            logger.error('Unexpected error during service initialization:', error);
        }
    }


    /**
     * Initialize Observer pattern components ?????
     */
    private static initializeObservers(notificationService: NotificationService): void {
        try {
            const eventManager = BookingEventManager.getInstance();

            // Create and register observers
            const notificationObserver = new NotificationObserver(notificationService);
            const auditLogObserver = new AuditLogObserver();
            const metricsObserver = new MetricsObserver();

            // Subscribe observers to the event manager
            eventManager.subscribe(notificationObserver);
            eventManager.subscribe(auditLogObserver);
            eventManager.subscribe(metricsObserver);
        } catch (error) {
            throw new ServiceInitializationError(
                'Failed to initialize observers',
                'ObserverInitialization',
                error instanceof Error ? error : new Error(String(error)),
            );
        }
    }
}
