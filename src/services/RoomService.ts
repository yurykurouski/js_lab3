import { Room, RoomType } from "../types";


export class RoomService {
    private rooms: Map<string, Room> = new Map();

    constructor() {
        this.initializeRooms();
    }

    private initializeRooms(): void {
        const defaultRooms: Room[] = [
            { id: '1', number: '101', type: RoomType.STANDARD, price: 100, isAvailable: true },
            { id: '2', number: '102', type: RoomType.STANDARD, price: 100, isAvailable: true },
            { id: '3', number: '201', type: RoomType.DELUXE, price: 200, isAvailable: true },
            { id: '4', number: '202', type: RoomType.DELUXE, price: 200, isAvailable: true },
            { id: '5', number: '301', type: RoomType.SUITE, price: 500, isAvailable: true },
        ];

        defaultRooms.forEach(room => this.rooms.set(room.id, room));
    }

    getAvailableRooms(): Room[] {
        return Array.from(this.rooms.values()).filter(room => room.isAvailable);
    }

    getRoom(id: string): Room | undefined {
        return this.rooms.get(id);
    }

    reserveRoom(roomId: string): boolean {
        const room = this.rooms.get(roomId);
        if (room && room.isAvailable) {
            room.isAvailable = false;
            console.log(`Room ${room.number} reserved successfully`);
            return true;
        }
        return false;
    }

    releaseRoom(roomId: string): void {
        const room = this.rooms.get(roomId);
        if (room) {
            room.isAvailable = true;
            console.log(`Room ${room.number} is now available`);
        }
    }

    getRoomsByType(type: RoomType): Room[] {
        return Array.from(this.rooms.values()).filter(room => room.type === type && room.isAvailable);
    }
}