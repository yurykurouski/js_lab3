

export class HttpService {
    static async get<T>(url: string): Promise<T> {
        const apiUrl = process.env.API_URL;
        if (!apiUrl) {
            throw new Error('API_URL environment variable is not set');
        }

        const response = await fetch(apiUrl + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json() as T;
    }
}

