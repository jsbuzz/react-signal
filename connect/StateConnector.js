import React, { Component } from 'react';
import Control from '../event-hive/control';
import { StateChanged } from '../event-hive/namespace';

import { extractProps } from './util';

const StateConnector = (NameSpace, selector, events, WrappedComponent) => {
  const Connector = class extends Component {
    namespace = () => Control.withActor(
      this,
      NameSpace || this.props.namespace
    );
    propSelector = typeof selector === 'function' ? selector : props => props
    watchedProps = null
    _namespace = NameSpace;

    componentDidMount() {
      this.displayName = `StateConnector(${WrappedComponent.displayName || WrappedComponent.name})`;

      if (events && events.length) {
        events.forEach( Event => this.namespace().listen(
          Event, () => this.checkState(),
        ));
      } else {
        this.namespace().listen(
          StateChanged, () => this.checkState(),
        );
        this.watchedProps = extractProps(selector);
        if (this.watchedProps) {
          this.watchedProps.forEach(prop => {
            if (typeof this.namespace().state[prop] === 'undefined') {
              this.watchedProps = null;
              console.warn(`${WrappedComponent.displayName} was connected with property watcher '${prop}' that is missing from state`, this.namespace().state);
            }
          })
        }
      }
    }

    checkState() {
      if (this.watchedProps) {
        for (let prop of this.watchedProps) {
          if (this.namespace()._propsChanged[prop]) {
            Control.logRerender(this, prop);
            this.forceUpdate();
            break ;
          }
        }
        return ;
      }
      this.forceUpdate();
    }

    componentWillUnmount(...stuff) {
      Control.cleanup(this);
    }

    render() {
      const ns = this.namespace();
      return <WrappedComponent {...this.props} {...this.propSelector((ns && ns.state) || {})} />;
    }
  };
  Connector.displayName = `StateConnector(${WrappedComponent.displayName || WrappedComponent.name})`;

  return Connector;
};

export default StateConnector;
