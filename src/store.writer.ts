interface IStoreItem {
    name: string;
    logname: string
}

class WriterStoreItem {

    private value: string[];

    private store = new Set<string>();

    constructor(wname: string) {
        this.store.add(wname);
        this.value = [wname]
    }

    add(wname: string) {
        this.store.add(wname);
        this.value = [...this.store]
    }

    remove(wname: string) {
        this.store.delete(wname);
        this.value = [...this.store]
    }



    get isEmpy() {
        return this.store.size < 1;
    }

    get current() {
        return this.value
    }

}
export class WriterStore {
    store: {
        [logname: string]: WriterStoreItem
    } = {};

    add(witem: IStoreItem) {
        if (witem.logname in this.store) {
            this.store[witem.logname].add(witem.name);
        } else {
            this.store[witem.logname] = new WriterStoreItem(witem.name)
        }
    }

    remove(witem: IStoreItem) {
        if (witem.logname in this.store) {
            let m = this.store[witem.logname];
            m.remove(witem.name);
            if (m.isEmpy) {
                delete this.store[witem.logname]
            }
        }
    }

    getWNames(logname: string) {
        if (logname in this.store) {
            return this.store[logname].current
        }

        return [];
    }

}