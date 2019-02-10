import React, { Component } from 'react';
import Control from './event-hive/control';

import { NamespaceCtx } from '.';

const NameSpaceWrapper = ({ schema, name, services, debug, children }) => (
  <NamespaceCtx.Consumer>
    {parentNamespace => (
      <NameSpaceContext
        namespace={schema(name, parentNamespace, debug)}
        // should debug be inherited from parent namespace?
        // namespace={schema(name, parentNamespace, debug || parentNamespace && parentNamespace.logging)}
        services={services}
      >
        {children}
      </NameSpaceContext>
    )}
  </NamespaceCtx.Consumer>
);

class NameSpaceContext extends Component {
  componentDidMount() {
    let { namespace, services } = this.props;

    this.services = [];
    if (!services) return;

    (services.length ? services : [services]).forEach(Service => {
      const instance = new Service(namespace);
      if (!instance.listen) return;

      instance.displayName = Service.name;

      Control.actor = instance;
      instance.listen();

      this.services.push(instance);
    });
  }

  componentWillUnmount() {
    this.services.forEach(service => {
      Control.cleanup(service);
      service.destructor && service.destructor();
    });
  }

  render() {
    let { namespace } = this.props;

    return (
      <NamespaceCtx.Provider value={namespace}>
        {this.props.children}
      </NamespaceCtx.Provider>
    );
  }
}

export default NameSpaceWrapper;
