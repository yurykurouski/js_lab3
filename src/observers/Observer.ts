export interface Observer<T = unknown> {
    update(event: T): void;
    getId(): string;
}

export interface Subject<T = unknown> {
    subscribe(observer: Observer<T>): void;
    unsubscribe(observer: Observer<T>): void;
    notify(event: T): void;
}

export abstract class BaseSubject<T = unknown> implements Subject<T> {
    protected observers: Set<Observer<T>> = new Set();

    subscribe(observer: Observer<T>): void {
        this.observers.add(observer);
    }

    unsubscribe(observer: Observer<T>): void {
        this.observers.delete(observer);
    }

    notify(event: T): void {
        console.log(`NOTIFYING ${this.observers.size} observers of event:`, event);
        this.observers.forEach(observer => {
            try {
                observer.update(event);
            } catch (error) {
                console.warn(`Observer ${observer.getId()} failed to handle event:`, error);
            }
        });
    }

    getObserverCount(): number {
        return this.observers.size;
    }
}
