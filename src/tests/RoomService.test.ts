import { RoomService } from '../services';
import { RoomType } from '../types';

describe('RoomService', () => {
    let roomService: RoomService;

    describe('initialization', () => {
        beforeEach(() => {
            roomService = new RoomService();
        });

        it('should initialize with default rooms', () => {
            const availableRooms = roomService.getAvailableRooms();
            expect(availableRooms).toHaveLength(5);

            const standardRooms = availableRooms.filter(room => room.type === RoomType.STANDARD);
            expect(standardRooms).toHaveLength(2);
            expect(standardRooms[0].number).toBe('101');
            expect(standardRooms[1].number).toBe('102');

            const deluxeRooms = availableRooms.filter(room => room.type === RoomType.DELUXE);
            expect(deluxeRooms).toHaveLength(2);
            expect(deluxeRooms[0].number).toBe('201');
            expect(deluxeRooms[1].number).toBe('202');

            const suiteRooms = availableRooms.filter(room => room.type === RoomType.SUITE);
            expect(suiteRooms).toHaveLength(1);
            expect(suiteRooms[0].number).toBe('301');
        });

        it('should initialize all rooms as available', () => {
            const availableRooms = roomService.getAvailableRooms();
            availableRooms.forEach(room => {
                expect(room.isAvailable).toBe(true);
            });
        });
    });

    describe('getAvailableRooms', () => {
        beforeEach(() => {
            roomService = new RoomService();
        });

        it('should return only available rooms', () => {
            roomService.reserveRoom('1');

            const availableRooms = roomService.getAvailableRooms();
            expect(availableRooms).toHaveLength(4);
            expect(availableRooms.find(room => room.id === '1')).toBeUndefined();
        });

        it('should return all rooms when none are reserved', () => {
            const availableRooms = roomService.getAvailableRooms();
            expect(availableRooms).toHaveLength(5);
        });
    });

    describe('getRoom', () => {
        beforeEach(() => {
            roomService = new RoomService();
        });

        it('should return room when it exists', () => {
            const room = roomService.getRoom('1');
            expect(room).toBeDefined();
            expect(room!.id).toBe('1');
            expect(room!.number).toBe('101');
        });

        it('should return undefined when room does not exist', () => {
            const room = roomService.getRoom('999');
            expect(room).toBeUndefined();
        });
    });

    describe('reserveRoom', () => {
        beforeEach(() => {
            roomService = new RoomService();
        });

        it('should reserve available room and return true', () => {
            const success = roomService.reserveRoom('1');
            expect(success).toBe(true);

            const room = roomService.getRoom('1');
            expect(room!.isAvailable).toBe(false);
        });

        it('should fail to reserve already reserved room and return false', () => {
            roomService.reserveRoom('1');
            const success = roomService.reserveRoom('1');
            expect(success).toBe(false);
        });

        it('should fail to reserve non-existent room and return false', () => {
            const success = roomService.reserveRoom('999');
            expect(success).toBe(false);
        });

        it('should remove reserved room from available rooms list', () => {
            roomService.reserveRoom('1');
            const availableRooms = roomService.getAvailableRooms();
            expect(availableRooms.find(room => room.id === '1')).toBeUndefined();
        });
    });

    describe('releaseRoom', () => {
        beforeEach(() => {
            roomService = new RoomService();
            roomService.reserveRoom('1');
        });

        it('should release reserved room', () => {
            roomService.releaseRoom('1');
            const room = roomService.getRoom('1');
            expect(room!.isAvailable).toBe(true);
        });

        it('should make released room available again', () => {
            roomService.releaseRoom('1');
            const availableRooms = roomService.getAvailableRooms();
            expect(availableRooms.find(room => room.id === '1')).toBeDefined();
        });

        it('should handle releasing non-existent room gracefully', () => {
            expect(() => roomService.releaseRoom('999')).not.toThrow();
        });

        it('should handle releasing already available room gracefully', () => {
            roomService.releaseRoom('1');
            expect(() => roomService.releaseRoom('1')).not.toThrow();

            const room = roomService.getRoom('1');
            expect(room!.isAvailable).toBe(true);
        });
    });

    describe('getRoomsByType', () => {
        beforeEach(() => {
            roomService = new RoomService();
        });

        it('should return standard rooms', () => {
            const standardRooms = roomService.getRoomsByType(RoomType.STANDARD);
            expect(standardRooms).toHaveLength(2);
            standardRooms.forEach(room => {
                expect(room.type).toBe(RoomType.STANDARD);
                expect(room.isAvailable).toBe(true);
            });
        });

        it('should return deluxe rooms', () => {
            const deluxeRooms = roomService.getRoomsByType(RoomType.DELUXE);
            expect(deluxeRooms).toHaveLength(2);
            deluxeRooms.forEach(room => {
                expect(room.type).toBe(RoomType.DELUXE);
                expect(room.isAvailable).toBe(true);
            });
        });

        it('should return suite rooms', () => {
            const suiteRooms = roomService.getRoomsByType(RoomType.SUITE);
            expect(suiteRooms).toHaveLength(1);
            suiteRooms.forEach(room => {
                expect(room.type).toBe(RoomType.SUITE);
                expect(room.isAvailable).toBe(true);
            });
        });

        it('should exclude reserved rooms of the requested type', () => {
            roomService.reserveRoom('1');

            const standardRooms = roomService.getRoomsByType(RoomType.STANDARD);
            expect(standardRooms).toHaveLength(1);
            expect(standardRooms[0].id).toBe('2');
        });

        it('should return empty array when all rooms of type are reserved', () => {
            roomService.reserveRoom('1');
            roomService.reserveRoom('2');

            const standardRooms = roomService.getRoomsByType(RoomType.STANDARD);
            expect(standardRooms).toHaveLength(0);
        });
    });

    describe('room pricing', () => {
        beforeEach(() => {
            roomService = new RoomService();
        });

        it('should have correct pricing for room types', () => {
            const standardRoom = roomService.getRoom('1');
            const deluxeRoom = roomService.getRoom('3');
            const suiteRoom = roomService.getRoom('5');

            expect(standardRoom!.price).toBe(100);
            expect(deluxeRoom!.price).toBe(200);
            expect(suiteRoom!.price).toBe(500);
        });
    });
});
