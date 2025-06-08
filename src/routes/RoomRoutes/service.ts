import { IncomingMessage, ServerResponse } from 'http';
import { ResponseHelper } from '@/router';
import { CatchServerError } from '@/decorators/CatchServerError';
import { BaseRouteService } from '../BaseRouteService';
import { BookingFacade } from '@/facade/types';


export class RoomRoutesService extends BaseRouteService {
    constructor(protected facade: BookingFacade) {
        super(facade);
    }

    @CatchServerError
    getAllRooms = async (_: IncomingMessage, res: ServerResponse): Promise<void> => {
        const rooms = await this.facade.getAvailableRooms();
        ResponseHelper.sendJSON(res, 200, {
            rooms,
            count: rooms.length,
        });
    };

    @CatchServerError
    getRoomsByType = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const roomType = this.extractTypeFromPath(req.url || '');

        if (!roomType) {
            ResponseHelper.sendError(res, 400, 'Invalid room type');
            return;
        }

        const isDeluxe = roomType.toLowerCase() === 'deluxe';
        const rooms = (await this.facade.getAvailableRooms()).filter(room =>
            room.isDeluxe === isDeluxe,
        );

        ResponseHelper.sendJSON(res, 200, {
            rooms,
            count: rooms.length,
            type: roomType,
        });
    };

    @CatchServerError
    getRoomById = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const roomId = this.extractIdFromPath(req.url || '');
        if (!roomId) {
            ResponseHelper.sendError(res, 400, 'Invalid room ID');
            return;
        }

        const rooms = await this.facade.getAvailableRooms();
        const room = rooms.find(r => r.id === roomId);

        if (room) {
            ResponseHelper.sendJSON(res, 200, { room });
        } else {
            ResponseHelper.sendError(res, 404, 'Room not found or not available');
        }
    };
}
