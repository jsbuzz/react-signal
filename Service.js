import Control from './event-hive/control';

class Service {
  constructor(ns) {
    this._ns = ns;
  }

  namespace() {
    return Control.withActor(this, this._ns);
  }
}

export default Service;
