import { Guest } from '../types';


export class GuestService {
    private guests: Map<string, Guest> = new Map();

    registerGuest(guest: Guest): void {
        this.guests.set(guest.id, guest);
        console.log(`Guest ${guest.name} registered successfully`);
    }

    getGuest(id: string): Guest | undefined {
        return this.guests.get(id);
    }

    validateGuest(id: string): boolean {
        return this.guests.has(id);
    }

    getAllGuests(): Guest[] {
        return Array.from(this.guests.values());
    }
}
