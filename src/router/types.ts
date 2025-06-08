import { HttpMethod } from '@/types';
import * as http from 'http';


export interface Route {
    method: HttpMethod;
    path: string;
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => void;
}
