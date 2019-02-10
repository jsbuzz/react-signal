const ARROW = '--> ';
const INDENT = '    ';

const Control = {
  logging: false,
  actor: null,
  withActor: (actor, ns) => {
    Control.actor = actor;
    return ns;
  },
  registerListener: (eventPool, eventName, listener) => {
    (Control.actor.__listeners || (Control.actor.__listeners = [])).push({
      eventPool,
      eventName,
      listener
    });
  },
  cleanup: actor => {
    if (!actor.__listeners) return;

    actor.__listeners.forEach(({ eventPool, eventName, listener }) => {
      eventPool.removeEventListener(eventName, listener);
    });
  },
  logTriggerSync: (hiveEvent, gateway) => {
    if (!Control.logging && !gateway.logging) return;

    if (hiveEvent.name === 'NameSpace:StateChanged') {
      console.log(
        `${Control.actor.name} triggered ${hiveEvent.name} ${Control.actor
          ._propsChanged || []}`
      );
    } else {
      const componentName =
        Control.actor.name || Control.actor.displayName || 'Component';
      console.log(
        `${componentName} triggered ${hiveEvent.name} on ${gateway.name}`
      );
    }
  },
  logCallback: (actor, fn, event) => {
    if (!Control.logging && !event._origin.logging) return;

    if (
      actor.displayName &&
      actor.displayName.substr(0, 15) === 'StateConnector('
    ) {
      console.log(
        ARROW + `${actor.displayName} checking changes <-[${event.name}]`
      );
    } else {
      console.log(
        ARROW +
          `${actor.displayName || actor.name} calling ${fnName(fn)} <-[${
            event.name
          }]`
      );
    }
  },
  logRerender: (stateConnector, prop) => {
    if (!Control.logging && (!stateConnector._namespace || !stateConnector._namespace.logging)) return;

    console.log(
      INDENT +
        `${stateConnector.displayName} re-rendering because "${prop}" changed`
    );
  }
};

export default Control;

function fnName(fn) {
  const propName = fn._property ? `<${fn._property}>` : '';

  if (fn.name) return fn.name + propName;

  const def = fn.toString().match(/_this[0-9]?\.([a-zA-Z_$]+)\(/i);
  if (!def) {
    const functionNames = fn.toString().match(/[a-zA-Z_]+\([^)]*\)/g);
    
    if (functionNames && functionNames.length) {
      return "'" + functionNames.map(n => n.split('(')[0]).join('|') + "'";
    }
  }

  return def && def.length > 1 ? `'${def[1]}${propName}'` : 'inline callback';
}
