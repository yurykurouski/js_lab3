export class LoadingIndicator {
    private interval: NodeJS.Timeout | null = null;
    private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    private currentFrame = 0;
    private message: string;

    constructor(message: string = 'Loading...') {
        this.message = message;
    }

    start(): void {
        process.stdout.write('\x1B[?25l');

        this.interval = setInterval(() => {
            process.stdout.write(`\r${this.frames[this.currentFrame]} ${this.message}`);
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }, 100);
    }

    stop(finalMessage?: string): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        process.stdout.write('\r\x1B[K');
        process.stdout.write('\x1B[?25h');

        if (finalMessage) {
            console.log(finalMessage);
        }
    }

    updateMessage(newMessage: string): void {
        this.message = newMessage;
    }
}
