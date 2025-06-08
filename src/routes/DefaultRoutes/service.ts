import { IncomingMessage, ServerResponse } from 'http';
import { ResponseHelper } from '@/router';
import { CatchServerError } from '@/decorators/CatchServerError';
import { BaseRouteService } from '../BaseRouteService';


export class DefaultRoutesService extends BaseRouteService {
    constructor() {
        super();
    }

    @CatchServerError
    getStatus = async (_: IncomingMessage, res: ServerResponse): Promise<void> => {
        const statusData = {
            status: 'OK',
            message: 'Service is running smoothly',
            timestamp: new Date().toISOString(),
        };
        ResponseHelper.sendJSON(res, 200, statusData);
    };
    @CatchServerError
    getHealth = async (_: IncomingMessage, res: ServerResponse): Promise<void> => {
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
        };
        ResponseHelper.sendJSON(res, 200, healthData);
    };
}
