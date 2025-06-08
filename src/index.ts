import { BookingMenu } from '@/view/BookingMenu';
import { ServiceFactory } from '@/factories';

import dotenv from 'dotenv';
import { Router } from '@/router';
import { logger } from '@/helpers/logger';

dotenv.config();

async function main() {
    const args = process.argv.slice(2);

    const isLocalMode = args.includes('--localMode') || args.includes('--local');
    const isServerMode = args.includes('--server') || args.includes('-s');

    const facade = await ServiceFactory.initializeServices({
        localMode: isLocalMode,
    });

    if (isServerMode) {
        const server = new Router(Number(process.env.PORT), facade);

        server.start();
    } else {
        const demo = new BookingMenu(facade);

        await demo.start();
    }
}

main().catch(logger.error);
