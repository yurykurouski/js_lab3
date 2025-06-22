import { logger } from '@/helpers/logger';

export function Log(
    target: unknown,
    propertyKey: string | symbol,
    descriptor?: PropertyDescriptor,
): void {
    if (!descriptor) {
        const originalValue = (target as Record<string | symbol, unknown>)[propertyKey];

        if (typeof originalValue === 'function') {
            (target as Record<string | symbol, unknown>)[propertyKey] =
                function (...args: unknown[]): unknown {
                    const className = this.constructor.name;
                    const methodName = String(propertyKey);

                    logger.info(`[${className}] Calling ${methodName}`, {
                        args: args.length > 0 ? args : undefined,
                    });

                    try {
                        const originalFunc = originalValue as (...args: unknown[]) => unknown;
                        const result = originalFunc.apply(this, args);

                        if (result instanceof Promise) {
                            return result
                                .then((res: unknown) => {
                                    logger.info(`[${className}] ${methodName} completed successfully`);
                                    return res;
                                })
                                .catch((error: unknown) => {
                                    logger.error(`[${className}] ${methodName} failed:`, error);
                                    throw error;
                                });
                        }

                        logger.info(`[${className}] ${methodName} completed successfully`);
                        return result;
                    } catch (error) {
                        logger.error(`[${className}] ${methodName} failed:`, error);
                        throw error;
                    }
                };
        }
        return;
    }

    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = function (...args: unknown[]): unknown {
        const className = this.constructor.name;
        const methodName = String(propertyKey);

        logger.info(`[${className}] Calling ${methodName}`, {
            args: args.length > 0 ? args : undefined,
        });

        try {
            const result = originalMethod.apply(this, args);

            if (result instanceof Promise) {
                return result
                    .then((res: unknown) => {
                        logger.info(`[${className}] ${methodName} completed successfully`);
                        return res;
                    })
                    .catch((error: unknown) => {
                        logger.error(`[${className}] ${methodName} failed:`, error);
                        throw error;
                    });
            }

            logger.info(`[${className}] ${methodName} completed successfully`);
            return result;
        } catch (error) {
            logger.error(`[${className}] ${methodName} failed:`, error);
            throw error;
        }
    };
}
