import { RoomService } from '../services';
import { ServiceFactory } from '../factories';

describe('RoomService', () => {
    let roomService: RoomService;

    describe('initialization', () => {
        beforeEach(async () => {
            const facade = await ServiceFactory.initializeServices({ localMode: true });
            roomService = facade.getRoomServiceForTesting();
        });

        it('should initialize with default rooms', async () => {
            const availableRooms = await roomService.getAvailableRooms();
            expect(availableRooms).toHaveLength(5);

            const standardRooms = availableRooms.filter(room => room.isDeluxe === false);
            expect(standardRooms).toHaveLength(3);
            expect(standardRooms[0].number).toBe('101');
            expect(standardRooms[1].number).toBe('102');

            const deluxeRooms = availableRooms.filter(room => room.isDeluxe === true);
            expect(deluxeRooms).toHaveLength(2);
            expect(deluxeRooms[0].number).toBe('201');
            expect(deluxeRooms[1].number).toBe('202');
        });

        it('should initialize all rooms as available', async () => {
            const availableRooms = await roomService.getAvailableRooms();
            availableRooms.forEach(room => {
                expect(room.isAvailable).toBe(true);
            });
        });
    });

    describe('getAvailableRooms', () => {
        beforeEach(async () => {
            const facade = await ServiceFactory.initializeServices({ localMode: true });
            roomService = facade.getRoomServiceForTesting();
        });

        it('should return only available rooms', async () => {
            await roomService.reserveRoom('1');

            const availableRooms = await roomService.getAvailableRooms();
            expect(availableRooms).toHaveLength(4);
            expect(availableRooms.find(room => room.id === '1')).toBeUndefined();
        });

        it('should return all rooms when none are reserved', async () => {
            const availableRooms = await roomService.getAvailableRooms();
            expect(availableRooms).toHaveLength(5);
        });
    });

    describe('getRoom', () => {
        beforeEach(async () => {
            const facade = await ServiceFactory.initializeServices({ localMode: true });
            roomService = facade.getRoomServiceForTesting();
        });

        it('should return room when it exists', async () => {
            const room = await roomService.getRoom('1');
            expect(room).toBeDefined();
            expect(room!.id).toBe('1');
            expect(room!.number).toBe('101');
        });

        it('should return undefined when room does not exist', async () => {
            const room = await roomService.getRoom('999');
            expect(room).toBeUndefined();
        });
    });

    describe('reserveRoom', () => {
        beforeEach(async () => {
            const facade = await ServiceFactory.initializeServices({ localMode: true });
            roomService = facade.getRoomServiceForTesting();
        });

        it('should reserve available room and return true', async () => {
            const success = await roomService.reserveRoom('1');
            expect(success).toBe(true);

            const room = await roomService.getRoom('1');
            expect(room!.isAvailable).toBe(false);
        });

        it('should fail to reserve already reserved room and return false', async () => {
            await roomService.reserveRoom('1');
            const success = await roomService.reserveRoom('1');
            expect(success).toBe(false);
        });

        it('should fail to reserve non-existent room and return false', async () => {
            const success = await roomService.reserveRoom('999');
            expect(success).toBe(false);
        });

        it('should remove reserved room from available rooms list', async () => {
            await roomService.reserveRoom('1');

            const availableRooms = await roomService.getAvailableRooms();
            expect(availableRooms.find(room => room.id === '1')).toBeUndefined();
        });
    });

    describe('releaseRoom', () => {
        beforeEach(async () => {
            const facade = await ServiceFactory.initializeServices({ localMode: true });
            roomService = facade.getRoomServiceForTesting();
            await roomService.reserveRoom('1');
        });

        it('should release reserved room', async () => {
            await roomService.releaseRoom('1');
            const room = await roomService.getRoom('1');
            expect(room!.isAvailable).toBe(true);
        });

        it('should make released room available again', async () => {
            await roomService.releaseRoom('1');
            const availableRooms = await roomService.getAvailableRooms();
            expect(availableRooms.find(room => room.id === '1')).toBeDefined();
        });

        it('should handle releasing non-existent room gracefully', async () => {
            await expect(roomService.releaseRoom('999')).resolves.not.toThrow();
        });

        it('should handle releasing already available room gracefully', async () => {
            await roomService.releaseRoom('1');
            await expect(roomService.releaseRoom('1')).resolves.not.toThrow();

            const room = await roomService.getRoom('1');
            expect(room!.isAvailable).toBe(true);
        });
    });

    describe('getRoomsByType', () => {
        beforeEach(async () => {
            const facade = await ServiceFactory.initializeServices({ localMode: true });
            roomService = facade.getRoomServiceForTesting();
        });

        it('should return standard rooms', async () => {
            const standardRooms = await roomService.getRoomsByType(false);
            expect(standardRooms).toHaveLength(3);
            standardRooms.forEach(room => {
                expect(room.isDeluxe).toBe(false);
                expect(room.isAvailable).toBe(true);
            });
        });

        it('should return deluxe rooms', async () => {
            const deluxeRooms = await roomService.getRoomsByType(true);
            expect(deluxeRooms).toHaveLength(2);
            deluxeRooms.forEach(room => {
                expect(room.isDeluxe).toBe(true);
                expect(room.isAvailable).toBe(true);
            });
        });


        it('should exclude reserved rooms of the requested type', async () => {
            await roomService.reserveRoom('1');

            const standardRooms = await roomService.getRoomsByType(false);
            expect(standardRooms).toHaveLength(2);
            expect(standardRooms[0].id).toBe('2');
        });

        it('should return empty array when all rooms of type are reserved', async () => {
            await roomService.reserveRoom('1');
            await roomService.reserveRoom('2');

            const standardRooms = await roomService.getRoomsByType(false);
            expect(standardRooms).toHaveLength(1);
        });
    });

    describe('room pricing', () => {
        beforeEach(async () => {
            const facade = await ServiceFactory.initializeServices({ localMode: true });
            roomService = facade.getRoomServiceForTesting();
        });

        it('should have correct pricing for room types', async () => {
            const standardRoom = await roomService.getRoom('1');
            const deluxeRoom = await roomService.getRoom('3');
            const suiteRoom = await roomService.getRoom('5');

            expect(standardRoom!.price).toBe(100);
            expect(deluxeRoom!.price).toBe(200);
            expect(suiteRoom!.price).toBe(500);
        });
    });
});
