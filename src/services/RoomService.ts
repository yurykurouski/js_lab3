import { Room, RoomType } from '../types';
import defaultRoomsData from '../../data/defaultRooms.json';


export class RoomService {
    private rooms: Map<string, Room> = new Map();

    constructor() {
        this.initializeRooms();
    }

    private initializeRooms(): void {
        const roomsCopy = JSON.parse(JSON.stringify(defaultRoomsData)) as Room[];

        roomsCopy.forEach((room: Room) => {
            this.rooms.set(room.id, room);
        });
    }

    getAvailableRooms(): Room[] {
        return Array.from(this.rooms.values()).filter(room => room.isAvailable);
    }

    getRoom(id: string): Room | undefined {
        return this.rooms.get(id);
    }

    reserveRoom(roomId: string): boolean {
        const room = this.getRoom(roomId);
        if (room && room.isAvailable) {
            room.isAvailable = false;
            console.log(`Room ${room.number} reserved successfully`);
            return true;
        }
        return false;
    }

    releaseRoom(roomId: string): void {
        const room = this.getRoom(roomId);
        if (room) {
            room.isAvailable = true;
            console.log(`Room ${room.number} is now available`);
        }
    }

    getRoomsByType(type: RoomType): Room[] {
        return Array.from(this.rooms.values())
            .filter(room => room.type === type && room.isAvailable);
    }
}
