import { basicEvent } from './event';
// import { defineEventType } from './event-type';
import { EventGateway } from './event-gateway';
import ReadOnly from './dependencies/read-only';
import Control from './control';

// export const StateEvent = defineEventType({
//     state: Object,
// });
export const InitState = basicEvent('NameSpace:InitState');
export const StateChanged = basicEvent('NameSpace:StateChanged');
// export const StateChanged = defineEvent(StateEvent, 'NameSpace:StateChanged');

let __id = 0;
export class NameSpace extends EventGateway {
  constructor(name, stateDefinition, parent, readonly, logging) {
    super();
    this.id = ++__id;
    this.name = name;
    this.logging = logging;
    this._parent = parent;
    this._sendStateUpdates = false;

    if (stateDefinition) {
      this.defineState(stateDefinition, readonly);
      this.updatingState = false;
    }
  }

  defineState(stateDefinition, readonly = true) {
    Control.actor = this;
    let state;

    if (readonly) {
      this._state || (this._state = new ReadOnly());
      this.state = this._state.reader;
      state = this._state;
    } else {
      this.state = {};
      state = this.state;
    }

    Object.getOwnPropertyNames(stateDefinition).forEach(property => {
      if (readonly) {
        this._state.addProperty(property);
      }
      const setters = stateDefinition[property];
      for (let i = 0; i < setters.length; i += 2) {
        const callback = setters[i + 1];
        const setter = event => {
          if (readonly) {
            this._state.set(
              property,
              callback(this._state.modifier[property])(event)
            );
          } else {
            state[property] = callback(state[property])(event);
          }

          if (this._sendStateUpdates) {
            if (this.updatingState === false) {
              this.updatingState = new Promise(resolve => {
                this._sendStateUpdatesResolve = resolve;
              });
            }
            event._promise.then(() => {
              if (this._sendStateUpdatesBouncer) {
                global.clearTimeout(this._sendStateUpdatesBouncer);
              }
              this._propsChanged[property] = true;
              this._sendStateUpdatesBouncer = global.setTimeout(() => {
                Control.withActor(this, this).triggerSync(StateChanged);
                this._sendStateUpdatesResolve &&
                  this._sendStateUpdatesResolve(this._propsChanged);
                this._sendStateUpdatesBouncer = null;
                this.updatingState = false;
                this._sendStateUpdatesResolve = null;
                this._propsChanged = {};
              }, 0);
            });
          }
        };
        setter._property = property;
        this.addEventListener(setters[i], setter, true);
      }
    });

    this._propsChanged = {};
    this.triggerSync(InitState);
  }

  addEventListener(fiberEvent, eventHandler, prepend = false) {
    super.addEventListener(fiberEvent, eventHandler, prepend);
    if (fiberEvent === StateChanged) {
      this._sendStateUpdates = true;
    }
  }

  parent() {
    return this._parent;
  }

  static get(name) {
    return this.create(name);
  }

  static schema(stateDefinition, readonly = true) {
    const generator = (name, parent, logging) =>
      new NameSpace(name, stateDefinition(), parent, readonly, logging);

    generator.stateDefinition = stateDefinition;
    return generator;
  }
}

export const set = value => () => () => value;
export const modify = fn => value => payload => {
  fn(value)(payload);
  return value;
};
