import ListenerChain from './listener-chain';

/* eslint import/prefer-default-export: 0 */
/* eslint no-unused-expressions: 0 */
export class EventPool {
  constructor() {
    this.events = new Map();
    this.allEvents = null;
  }

  addEventListener(eventName, listener, prepend = false) {
    if (prepend) {
      this.events.set(
        eventName,
        ListenerChain.with(
          listener, this.events.get(eventName),
        ),
      );
    } else if (this.events.has(eventName)) {
      this.events.get(eventName).add(listener);
    } else {
      this.events.set(eventName, ListenerChain.with(listener));
    }
  }

  addGlobalListener(listener, prepend) {
    if (prepend) {
      this.allEvents = ListenerChain.with(
          listener, this.allEvents,
        );
    } else if (this.allEvents) {
      this.allEvents.add(listener);
    } else {
      this.allEvents = ListenerChain.with(listener);
    }
  }

  removeEventListener(eventName, listener) {
    if (!eventName) {
      this.allEvents = this.allEvents.without(listener);
      
      return ;
    }
    // console.log('removeEventListener', eventName, listener);
    const chain = this.events.get(eventName);

    if (chain) {
      const newChain = chain.without(listener);

      if (newChain) {
        this.events.set(eventName, newChain);
      } else {
        this.events.delete(eventName);
      }
    }
  }

  dispatchEvent(fiberEvent) {
    const chain = this.events.get(fiberEvent.name);
    chain && chain.execute(fiberEvent);
    this.allEvents && this.allEvents.execute(fiberEvent);
  }
}
