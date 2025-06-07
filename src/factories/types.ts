import { PaymentProviderType } from '@/types';

export interface ServiceFactoryConfig {
    enableObservers?: boolean;
    enableMetrics?: boolean;
    initializationTimeout?: number;
    localMode?: boolean;
}

export interface PaymentAdapterConfig {
    defaultProvider: PaymentProviderType;
    fallbackProviders: PaymentProviderType[];
    enableFallback: boolean;
}
