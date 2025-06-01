import { GuestService } from '../services';
import { Guest } from '../types';

describe('GuestService', () => {
    let guestService: GuestService;
    let mockGuest: Guest;

    beforeEach(() => {
        guestService = new GuestService();
        mockGuest = {
            id: 'guest1',
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1234567890'
        };
    });

    describe('registerGuest', () => {
        it('should register a new guest', () => {
            guestService.registerGuest(mockGuest);
            const retrievedGuest = guestService.getGuest('guest1');

            expect(retrievedGuest).toBeDefined();
            expect(retrievedGuest).toEqual(mockGuest);
        });

        it('should overwrite existing guest with same ID', () => {
            guestService.registerGuest(mockGuest);

            const updatedGuest = { ...mockGuest, name: 'Jane Doe' };
            guestService.registerGuest(updatedGuest);

            const retrievedGuest = guestService.getGuest('guest1');
            expect(retrievedGuest!.name).toBe('Jane Doe');
        });
    });

    describe('getGuest', () => {
        it('should return guest when it exists', () => {
            guestService.registerGuest(mockGuest);
            const guest = guestService.getGuest('guest1');

            expect(guest).toBeDefined();
            expect(guest).toEqual(mockGuest);
        });

        it('should return undefined when guest does not exist', () => {
            const guest = guestService.getGuest('nonexistent');
            expect(guest).toBeUndefined();
        });
    });

    describe('validateGuest', () => {
        it('should return true for existing guest', () => {
            guestService.registerGuest(mockGuest);
            const isValid = guestService.validateGuest('guest1');
            expect(isValid).toBe(true);
        });

        it('should return false for non-existing guest', () => {
            const isValid = guestService.validateGuest('nonexistent');
            expect(isValid).toBe(false);
        });
    });

    describe('getAllGuests', () => {
        it('should return empty array when no guests registered', () => {
            const guests = guestService.getAllGuests();
            expect(guests).toEqual([]);
        });

        it('should return all registered guests', () => {
            const guest1 = mockGuest;
            const guest2 = {
                id: 'guest2',
                name: 'Jane Smith',
                email: 'jane.smith@email.com',
                phone: '+0987654321'
            };

            guestService.registerGuest(guest1);
            guestService.registerGuest(guest2);

            const guests = guestService.getAllGuests();
            expect(guests).toHaveLength(2);
            expect(guests).toContain(guest1);
            expect(guests).toContain(guest2);
        });
    });
});
