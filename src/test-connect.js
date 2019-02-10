import { NameSpace } from './event-hive/namespace';

export class TestNameSpace extends NameSpace {
  events = [];
  lastEvent = null;

  constructor(name, schema, parent) {
    super(name || 'TestNameSpace', schema && schema.stateDefinition(), parent, false);
    this._sendStateUpdates = true;
  }

  trigger(event) {
    const promise = super.trigger(event);
    this.events.push(event);
    this.lastEvent = event;

    return promise;
  }

  reset() {
    this.events = [];
    this.lastEvent = null;
    this.namespaces = [];
    this.lastNamespace = null;
  }

  hasListenerFor(Event) {
    return this.eventPool.events.has(Event.EventName);
  }

  startService(Service) {
    const service = new Service(this);
    service.listen();

    return service;
  }
}

export const connectFunction = (fn, NS = new TestNameSpace()) => props =>
  fn(props, ns => ns || NS);

export const connectComponent = (ComponentClass, NS = new TestNameSpace()) =>
  class extends ComponentClass {
    namespace = ns => ns || NS;
  };

const Connect = (component, NS) => {
  let ConnectedComponent =
    component.prototype && component.prototype.render
      ? connectComponent(component, NS)
      : connectFunction(component.type || component, NS);

  ConnectedComponent.displayName = component.name;

  return ConnectedComponent;
};

export default Connect;
