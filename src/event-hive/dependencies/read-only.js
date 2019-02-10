import clone from './clone';

const isReadonlyProxy = Symbol('isReadonlyProxy');

const readOnlyIterator = iterator => {
  const result = {};
  result[Symbol.iterator] = () => ({
    next: () => {
      const { value, done } = iterator.next();
      return {
        value: readOnlyProxy(value),
        done
      };
    }
  });
  return result;
};

export function readOnlyProxy(original) {
  if (original instanceof Array) {
    return original.map(v => readOnlyProxy(v));
  }

  if (original instanceof Map) {
    const readonlyMap = {
      has: name => original.has(name),
      get: name => readOnlyProxy(original.get(name)),
      set: () => {},
      keys: () => readOnlyIterator(original.keys()),
      values: () => readOnlyIterator(original.values()),
      entries: () => readOnlyIterator(original.entries()),
      size: original.size
    };
    readonlyMap[Symbol.iterator] = readOnlyIterator(original.entries())[
      Symbol.iterator
    ];
    return readonlyMap;
  }

  if (original instanceof Set) {
    const readonlySet = {
      has: name => original.has(name),
      get: name => readOnlyProxy(original.get(name)),
      add: () => {},
      values: () => readOnlyIterator(original.values()),
      entries: () => readOnlyIterator(original.entries())
    };
    readonlySet[Symbol.iterator] = readOnlyIterator(original.entries())[
      Symbol.iterator
    ];
    return readonlySet;
  }

  if (original && original[isReadonlyProxy]) return original;

  if (original instanceof Object) {
    return new Proxy(original, {
      get: (target, property) =>
        property === isReadonlyProxy ? true : target[property],
      set: () => true
    });
  }

  return original;
}

export const READ_ONLY_PROXY = readOnlyProxy;
export const READ_ONLY_CLONE = clone;

class ReadOnly {
  constructor(reader, method = READ_ONLY_PROXY) {
    this.reader = reader || {};
    this.method = method;
    this.modifier = {};
  }

  addProperty(name, value) {
    this.modifier[name] = value;
    this.reader[name] = this.method(value);
  }

  set(name, value) {
    this.modifier[name] = value;
    this.reader[name] = this.method(value);
  }
}

export default ReadOnly;
