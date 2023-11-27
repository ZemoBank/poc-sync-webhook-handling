import { REDIS_CHANNEL, RedisClient } from "./redis-client";

type MyEventListener = (msg: any) => void;

interface PubSubClient {
    publish(channel: string, message: any): Promise<void>
    consume(channel: string, callback: (message: string) => void): void
}

export class EventManager {
    private watchableStack: Map<string, EventListener>;
    private timeout: number;
    private publisher: PubSubClient
    private subscriber: PubSubClient

    constructor(timeout: number, publisher: PubSubClient, subscriber: PubSubClient) {
        this.watchableStack = new Map<string, EventListener>();
        this.timeout = timeout;
        this.publisher = publisher
        this.subscriber = subscriber
        this.listenPubSub()
    }

    _clearFromStack(external_id: string) {
        this.watchableStack.delete(external_id)
    }

    watch(
        external_id: string,
        listenerSuccess: MyEventListener,
        listenerTimeout: MyEventListener,
        listenerError: MyEventListener,
    ) {
        const thisTimeout = setTimeout(() => {
            this._clearFromStack(external_id);
            this._clearFromStack(`${external_id}#ERROR`);
            listenerTimeout({});

        }, this.timeout);

        this.watchableStack.set(external_id, (data: any) => {
            clearTimeout(thisTimeout);
            listenerSuccess(data);
            this._clearFromStack(external_id);
            this._clearFromStack(`${external_id}#ERROR`);
        })

        this.watchableStack.set(`${external_id}#ERROR`, (data: any) => {
            clearTimeout(thisTimeout);
            listenerError(data);
            this._clearFromStack(external_id);
            this._clearFromStack(`${external_id}#ERROR`);
        })
    }

    execute(data: any) {
        const listener = this.watchableStack.get(data?.external_id);
        if (!listener) {
            return false
        }
        listener(data);
        return true
    }

    listenPubSub() {
        this.subscriber.consume(REDIS_CHANNEL, this.triggerPubSub)
    }

    triggerPubSub = (message: string) => {
        const data = JSON.parse(message)
        this.execute(data)
    }

    async sendMessageToPubSub(channel: string, message: any) {
        await this.publisher.publish(channel, message)
    }

    async trigger(data: any) {
        if (!this.execute(data)) {
            await this.sendMessageToPubSub(REDIS_CHANNEL, data)
        }
    }

    throwError(external_id: string, data: any) {
        const listener = this.watchableStack.get(`${external_id}#ERROR`);
        if (listener) {
            listener(data);
        }
    }
}