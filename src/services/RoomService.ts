import { logger } from '@/helpers/logger';
import { API_ROUTES } from '@/constants';
import { Room } from '@/types';
import { HttpService } from './HttpService';


export class RoomService {
    private rooms: Map<string, Room> = new Map();
    private isLoading: boolean = false;
    private isInitialized: boolean = false;


    private async fetchRoomsFromAPI(): Promise<Room[]> {
        return await HttpService.get<Room[]>(API_ROUTES.AVAILABLE_ROOMS);
    }

    public async initializeRooms(): Promise<void> {
        if (this.isInitialized || this.isLoading) {
            return;
        }

        this.isLoading = true;

        try {
            const rooms = await this.fetchRoomsFromAPI();

            this.rooms.clear();
            rooms.forEach((room: Room) => {
                this.rooms.set(room.id, room);
            });

            this.isInitialized = true;
        } catch (error) {
            logger.error('Failed to initialize rooms:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    public async initializeWithDefaultRooms(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            const fs = await import('fs/promises');
            const path = await import('path');

            const defaultRoomsPath = path.join(process.cwd(), 'data', 'defaultRooms.json');
            const defaultRoomsData = await fs.readFile(defaultRoomsPath, 'utf-8');
            const defaultRooms = JSON.parse(defaultRoomsData) as Room[];

            this.rooms.clear();
            defaultRooms.forEach((room: Room) => {
                this.rooms.set(room.id, room);
            });

            this.isInitialized = true;

            logger.info(`🏨 Initialized ${defaultRooms.length} rooms from local data`);
        } catch (error) {
            logger.error('Failed to initialize rooms from local data:', error);
            throw error;
        }
    }

    async getAvailableRooms(): Promise<Room[]> {
        return Array.from(this.rooms.values()).filter(room => room.isAvailable);
    }

    async getRoom(id: string): Promise<Room | undefined> {
        return this.rooms.get(id);
    }

    async reserveRoom(roomId: string): Promise<boolean> {
        const room = this.rooms.get(roomId);

        if (room && room.isAvailable) {
            room.isAvailable = false;
            logger.info(`Room ${room.number} reserved successfully`);
            return true;
        }

        return false;
    }

    async releaseRoom(roomId: string): Promise<void> {
        const room = this.rooms.get(roomId);

        if (room) {
            room.isAvailable = true;
            logger.info(`Room ${room.number} is now available`);
        }
    }

    async getRoomsByType(isDeluxe: boolean): Promise<Room[]> {
        return Array.from(this.rooms.values())
            .filter(room => room.isDeluxe === isDeluxe && room.isAvailable);
    }


    get isReady(): boolean {
        return this.isInitialized && !this.isLoading;
    }
}

