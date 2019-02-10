import React, { PureComponent } from 'react';

import Control from './event-hive/control';
import StateConnector from './connect/StateConnector';
import { AllEvents } from './event-hive/event';

export { AllEvents };

export const NamespaceCtx = React.createContext();

// what's better for this usecase, composition or inheritence?
const connectComponent = ComponentClass =>
  class extends ComponentClass {
    on = ns => Control.withActor(this, ns);

    namespace = () => Control.withActor(this, this.props.namespace);

    componentDidMount(...stuff) {
      super.componentDidMount && super.componentDidMount(...stuff);

      this.listen && this.listen();
      this.displayName = ComponentClass.name;
    }

    componentWillUnmount(...stuff) {
      super.componentWillUnmount && super.componentWillUnmount(...stuff);
      Control.cleanup(this);
    }
  };

const connectFunction = (fn, namespace, events) => props =>
  fn(props, ns => {
    ns || (ns = props.namespace);
    return Control.withActor(fn, ns);
  });

const Connect = (
  component,
  selector = null,
  events = null,
  namespace = null
) => {
  let ConnectedComponent = Enable(component);

  if (selector) {
    ConnectedComponent = StateConnector(
      namespace,
      selector,
      events,
      ConnectedComponent
    );
  }

  const HiveComponent = props => (
    <NamespaceCtx.Consumer>
      {ctx => (
        <ConnectedComponent {...props} namespace={ctx || props.namespace} />
      )}
    </NamespaceCtx.Consumer>
  );
  HiveComponent.displayName = `~${ConnectedComponent.displayName}`;

  return HiveComponent;
};

export const Enable = component => {
  let ConnectedComponent =
    component.prototype && component.prototype.render
      ? connectComponent(component)
      : connectFunction(component.type || component);

  ConnectedComponent.displayName = component.name;

  return ConnectedComponent;
};

export default Connect;

export const Signal = connectorFn => {
  return renderFn => {
    const SignalComponent = class extends PureComponent {
      componentDidMount() {
        const { namespace } = this.props;

        const listeners = connectorFn(state => this.setState(state));
        Control.withActor(this, namespace).listen(...listeners);
      }
      
      render() {
        return this.state && renderFn(this.state);
      }

      displayName = `~${renderFn.name}`
    };
    SignalComponent.displayName = `~$${renderFn.name}`;
    
    const componentFn = () => (
      <NamespaceCtx.Consumer>
        {ctx => (
          <SignalComponent namespace={ctx || props.namespace} />
        )}
      </NamespaceCtx.Consumer>
    );
    componentFn.displayName = `~${renderFn.name}`;
    return componentFn;
  }
};
