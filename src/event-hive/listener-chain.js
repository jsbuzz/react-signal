import Control from './control';

class ListenerChain {
    constructor(listener, next = null) {
        this.listener = listener;
        this.next = next;
        this.actor = Control.actor;
    }

    execute(event) {
        Control.logCallback(this.actor, this.listener, event);

        this.listener(event);
        if(this.next) {
            this.next.execute(event);
        }
    }

    add(listener) {
        let node = this;

        while(node.next) {
            node = node.next;
        }

        node.next = new ListenerChain(listener);
    }

    without(listener) {
        let root = this,
            node = root,
            prev = null;

        while(node) {
            if(node.listener === listener) {
                if(prev === null) {
                    root = node.next;
                } else {
                    prev.next = node.next;
                }

                return root;
            }

            prev = node;
            node = node.next;
        }

        return root;
    }

    static with(listener, next = null) {
        return new ListenerChain(listener, next);
    }
}

export default ListenerChain
