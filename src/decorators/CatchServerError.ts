import { ResponseHelper } from '@/router';
import { ServerResponse } from 'http';

export function CatchServerError(target: unknown, propertyKey: string | symbol): void {
    const originalValue = (target as Record<string | symbol, unknown>)[propertyKey];

    if (typeof originalValue === 'function') {
        (target as Record<string | symbol, unknown>)[propertyKey] =
            async function (...args: unknown[]) {
                try {
                    const result =
                        await (originalValue as (...args: unknown[]) => unknown).apply(this, args);
                    return result;
                } catch (error) {
                    console.error(`Server error in ${String(propertyKey)}:`, error);
                    const res = args.find(arg =>
                        arg && typeof (arg as { writeHead?: unknown }).writeHead === 'function',
                    ) as ServerResponse;
                    if (res && !res.headersSent) {
                        ResponseHelper.sendError(res, 500, 'Internal server error');
                    }
                }
            };
    }
}
