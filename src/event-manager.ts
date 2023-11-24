type MyEventListener = (msg: any) => void;

// REDIS
export class EventManager {
    private watchableStack: Map<string, EventListener>;
    private timeout: number;

    constructor(timeout: number) {
        this.watchableStack = new Map<string, EventListener>();
        this.timeout = timeout;
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

    trigger(external_id: string, data: any) {
        const listener = this.watchableStack.get(external_id);
        if (listener) {
            listener(data);
        }
    }

    throwError(external_id: string, data: any) {
        const listener = this.watchableStack.get(`${external_id}#ERROR`);
        if (listener) {
            listener(data);
        }
    }
}