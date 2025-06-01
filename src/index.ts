import { BookingMenu } from './view/BookingMenu';


async function main() {
    const demo = new BookingMenu();

    await demo.start();
}

main().catch(console.error);
