import { BookingFrontend } from './frontend/BookingFrontend';


async function main() {
    const demo = new BookingFrontend();

    await demo.start();
}

main().catch(console.error);
