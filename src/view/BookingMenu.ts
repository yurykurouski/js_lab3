import inquirer from 'inquirer';
import { HotelBookingFacade } from '../facade/HotelBookingFacade';
import { Guest, RoomType, PaymentInfo, BookingAction } from '../types';
import { ExitFromAppError } from '../exceptions';
import { generateUUID } from '../helpers';


export class BookingMenu {
    private facade: HotelBookingFacade;
    private currentGuest: Guest | null = null;

    constructor() {
        this.facade = new HotelBookingFacade();
    }

    public async start(): Promise<void> {
        console.log('🏨 Interactive Hotel Booking System - Facade & State Patterns\n');
        console.log('='.repeat(70));

        let running = true;
        while (running) {
            try {
                await this.showMainMenu();
            } catch (error) {
                if (error instanceof ExitFromAppError && error.message === 'exit') {
                    console.log('\n👋 Thank you for using our Hotel Booking System!');
                    running = false;
                    break;
                }
                console.error('An error occurred:', error);
            }
        }
    }

    private async showMainMenu(): Promise<void> {
        const choices = [
            'View Available Rooms',
            'Create/Switch Guest Profile',
            'Make a Booking',
            'Manage Existing Bookings',
            'View All Bookings',
            'Exit'
        ];

        const { action } = await inquirer.prompt<{ action: string }>([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices
            }
        ]);

        switch (action) {
            case 'View Available Rooms':
                await this.showAvailableRooms();
                break;
            case 'Create/Switch Guest Profile':
                await this.createOrSwitchGuest();
                break;
            case 'Make a Booking':
                await this.makeBooking();
                break;
            case 'Manage Existing Bookings':
                await this.manageBookings();
                break;
            case 'View All Bookings':
                await this.viewAllBookings();
                break;
            case 'Exit':
                throw new ExitFromAppError('exit');
        }
    }

    private async showAvailableRooms(): Promise<void> {
        console.log('\n📋 Available Rooms:');
        const rooms = this.facade.getAvailableRooms();

        if (rooms.length === 0) {
            console.log('  No rooms available at the moment.');
        } else {
            rooms.forEach(room => {
                console.log(`  • Room ${room.number} (${room.type.toUpperCase()}) - $${room.price}/night`);
            });
        }

        await this.pressEnterToContinue();
    }

    private async createOrSwitchGuest(): Promise<void> {
        console.log('\n👤 Guest Profile Management');

        const { name, email, phone } = await inquirer.prompt<{
            name: string;
            email: string;
            phone: string;
        }>([
            {
                type: 'input',
                name: 'name',
                message: 'Enter full name:',
                validate: (input) => input.trim() !== '' || 'Name cannot be empty'
            },
            {
                type: 'input',
                name: 'email',
                message: 'Enter email address:',
                validate: (input) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(input) || 'Please enter a valid email address';
                }
            },
            {
                type: 'input',
                name: 'phone',
                message: 'Enter phone number:',
                validate: (input) => input.trim() !== '' || 'Phone number cannot be empty'
            }
        ]);

        this.currentGuest = { id: generateUUID(), name, email, phone };
        console.log(`✅ Guest profile set: ${name} (${email})`);

        await this.pressEnterToContinue();
    }

    private async makeBooking(): Promise<void> {
        if (!this.currentGuest) {
            console.log('❌ Please create a guest profile first.');
            await this.pressEnterToContinue();
            return;
        }

        console.log(`\n🎯 Making a booking for ${this.currentGuest.name}`);

        const { roomType } = await inquirer.prompt<{ roomType: RoomType }>([
            {
                type: 'list',
                name: 'roomType',
                message: 'Select room type:',
                choices: [
                    { name: 'Standard Room', value: RoomType.STANDARD },
                    { name: 'Deluxe Room', value: RoomType.DELUXE },
                    { name: 'Suite', value: RoomType.SUITE }
                ]
            }
        ]);

        const { checkInDate, checkOutDate } = await inquirer.prompt<{
            checkInDate: string;
            checkOutDate: string;
        }>([
            {
                type: 'input',
                name: 'checkInDate',
                message: 'Enter check-in date (YYYY-MM-DD):',
                validate: (input) => {
                    const date = new Date(input);
                    return !isNaN(date.getTime()) || 'Please enter a valid date in YYYY-MM-DD format';
                }
            },
            {
                type: 'input',
                name: 'checkOutDate',
                message: 'Enter check-out date (YYYY-MM-DD):',
                validate: (input) => {
                    const date = new Date(input);
                    return !isNaN(date.getTime()) || 'Please enter a valid date in YYYY-MM-DD format';
                }
            }
        ]);

        const paymentInfo = await this.getPaymentInfo();

        const bookingResult = this.facade.bookRoom(
            this.currentGuest,
            roomType,
            new Date(checkInDate),
            new Date(checkOutDate),
            paymentInfo
        );

        if (bookingResult.success) {
            console.log(`✅ ${bookingResult.message}`);
            console.log(`📋 Booking ID: ${bookingResult.bookingId}`);
        } else {
            console.log(`❌ Booking failed: ${bookingResult.message}`);
        }

        await this.pressEnterToContinue();
    }

    private async getPaymentInfo(): Promise<PaymentInfo> {
        console.log('\n💳 Payment Information');

        return await inquirer.prompt([
            {
                type: 'input',
                name: 'cardNumber',
                message: 'Enter card number:',
                validate: (input) => input.replace(/\s/g, '').length >= 16 || 'Please enter a valid card number'
            },
            {
                type: 'input',
                name: 'expiryDate',
                message: 'Enter expiry date (MM/YY):',
                validate: (input) => {
                    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
                    return regex.test(input) || 'Please enter date in MM/YY format';
                }
            },
            {
                type: 'input',
                name: 'cvv',
                message: 'Enter CVV:',
                validate: (input) => input.length === 3 || 'CVV must be 3 digits'
            },
            {
                type: 'input',
                name: 'cardHolderName',
                message: 'Enter cardholder name:',
                validate: (input) => input.trim() !== '' || 'Cardholder name cannot be empty'
            }
        ]);
    }

    private async manageBookings(): Promise<void> {
        const allBookings = this.facade.getAllBookings();

        if (allBookings.length === 0) {
            console.log('\n📭 No bookings found.');
            await this.pressEnterToContinue();
            return;
        }

        const bookingChoices = allBookings.map(booking => ({
            name: `${booking.bookingId} - ${booking.details.guestId} (${booking.status.toUpperCase()})`,
            value: booking.bookingId
        }));

        const { selectedBookingId } = await inquirer.prompt<{ selectedBookingId: string }>([
            {
                type: 'list',
                name: 'selectedBookingId',
                message: 'Select a booking to manage:',
                choices: [...bookingChoices, { name: '← Back to Main Menu', value: 'back' }]
            }
        ]);

        if (selectedBookingId === 'back') {
            return;
        }

        await this.manageSpecificBooking(selectedBookingId);
    }

    private async manageSpecificBooking(bookingId: string): Promise<void> {
        const bookingInfo = this.facade.getBookingInfo(bookingId);

        if (!bookingInfo.booking) {
            console.log('❌ Booking not found.');
            await this.pressEnterToContinue();
            return;
        }

        console.log(`\n📊 Booking Details:`);
        console.log(`🆔 ID: ${bookingInfo.booking.id}`);
        console.log(`👤 Guest: ${bookingInfo.booking.guestId}`);
        console.log(`🏨 Room: ${bookingInfo.booking.roomId}`);
        console.log(`📅 Check-in: ${bookingInfo.booking.checkInDate.toDateString()}`);
        console.log(`📅 Check-out: ${bookingInfo.booking.checkOutDate.toDateString()}`);
        console.log(`💰 Total: $${bookingInfo.booking.totalPrice}`);
        console.log(`📈 Status: ${bookingInfo.status?.toUpperCase()}`);

        const availableActionInfos = bookingInfo.availableActionInfos || [];

        if (availableActionInfos.length === 0) {
            console.log('🚫 No actions available for this booking.');
            await this.pressEnterToContinue();
            return;
        }

        const actionChoices = availableActionInfos.map(actionInfo => ({
            name: `${actionInfo.label} - ${actionInfo.description}`,
            value: actionInfo.action
        }));

        const { selectedAction } = await inquirer.prompt<{ selectedAction: BookingAction | 'back' }>([
            {
                type: 'list',
                name: 'selectedAction',
                message: 'What would you like to do?',
                choices: [...actionChoices, { name: '← Back', value: 'back' }]
            }
        ]);

        if (selectedAction === 'back') {
            return;
        }

        await this.executeBookingAction(bookingId, selectedAction);
    }

    private async executeBookingAction(bookingId: string, action: BookingAction | 'back'): Promise<void> {
        if (action === 'back') {
            return;
        }

        let result: { success: boolean; message: string };

        switch (action) {
            case BookingAction.CONFIRM:
                result = this.facade.confirmBooking(bookingId);
                break;
            case BookingAction.CANCEL:
                result = this.facade.cancelBooking(bookingId);
                break;
            case BookingAction.CHECK_IN:
                result = this.facade.checkIn(bookingId);
                break;
            case BookingAction.CHECK_OUT:
                result = this.facade.checkOut(bookingId);
                break;
            default:
                console.log('❌ Unknown action');
                await this.pressEnterToContinue();
                return;
        }

        console.log(`${result.success ? '✅' : '❌'} ${result.message}`);
        await this.pressEnterToContinue();
    }

    private async viewAllBookings(): Promise<void> {
        console.log('\n📋 All Bookings:');
        const allBookings = this.facade.getAllBookings();

        if (allBookings.length === 0) {
            console.log('  No bookings found.');
        } else {
            allBookings.forEach(booking => {
                console.log(`\n🆔 ${booking.bookingId}`);
                console.log(`  👤 Guest: ${booking.details.guestId}`);
                console.log(`  🏨 Room: ${booking.details.roomId}`);
                console.log(`  📅 ${booking.details.checkInDate.toDateString()} → ${booking.details.checkOutDate.toDateString()}`);
                console.log(`  💰 Total: $${booking.details.totalPrice}`);
                console.log(`  📈 Status: ${booking.status.toUpperCase()}`);
            });
        }

        await this.pressEnterToContinue();
    }

    private async pressEnterToContinue(): Promise<void> {
        await inquirer.prompt([
            {
                type: 'input',
                name: 'continue',
                message: 'Press Enter to continue...'
            }
        ]);
    }
}
