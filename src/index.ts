import { BookingMenu } from './view/BookingMenu';
import { ServiceFactory } from './factories/ServiceFactory';
import { SimpleServer } from './server';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--server') || args.includes('-s')) {
        console.log('Starting HTTP server...');
        const server = new SimpleServer(3000);
        server.start();
        return;
    }

    const isLocalMode = args.includes('--localMode') || args.includes('--local');

    const facade = await ServiceFactory.initializeServices({
        localMode: isLocalMode,
    });

    const demo = new BookingMenu(facade);
    await demo.start();
}

main().catch(console.error);
