import ReadOnly from './dependencies/read-only';
import { Optional } from './domain';
import { Event } from './event';

export class EventAttributeError extends Error {
  constructor(event, name, value, ParamType) {
    if (ParamType) {
      super(`Type mismatch for Event '${event.name}' for attribute '${name}'`);
    } else {
      super(`Unexpected parameter for Event '${event.name}'`);
    }
    this.message = 'EventAttributeError';
    this.event = event;
    this.name = name;
    this.value = value;
    this.type = ParamType;
  }
}

export function defineEventType(descriptor) {
  const propNames = Object.getOwnPropertyNames(descriptor);
  const DefinedEventClass = class extends Event {
    constructor(...params) {
      super();
      const readonly = new ReadOnly(this);
      for (let i = 0; i < params.length; i++) {
        const paramName = propNames[i];
        if (paramName === undefined || descriptor[paramName] === undefined) {
          throw new EventAttributeError(this, paramName, params[i]);
        }
        const [optional, ParamType] = Optional.from(descriptor[paramName]);

        if (optional && (params[i] === undefined || params[i] === null)) {
          readonly.addProperty(paramName, params[i]);
        } else if (ParamType.name === 'Mixed') {
          readonly.addProperty(paramName, params[i]);
        } else if (
          ParamType === Number ||
          ParamType === String ||
          ParamType === Boolean
        ) {
          readonly.addProperty(paramName, new ParamType(params[i]).valueOf());
        } else if (
          ParamType instanceof Object &&
          !(params[i] instanceof ParamType)
        ) {
          throw new EventAttributeError(this, paramName, params[i], ParamType);
        } else {
          readonly.addProperty(paramName, params[i]);
        }
      }
    }
  };
  return DefinedEventClass;
}
