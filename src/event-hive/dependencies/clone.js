export default function clone(obj) {
  if (!(obj instanceof Object) || obj instanceof Function) {
    return obj;
  }
  if (obj instanceof Array) {
    return obj.map(item => clone(item));
  }
  if (
    obj instanceof Number || obj instanceof String || obj instanceof Date ||
    obj instanceof RegExp || obj instanceof Boolean
  ) {
    return new obj.constructor(obj);
  }
  if (obj instanceof Map || obj instanceof Set) {
    return new obj.constructor(clone(Array.from(obj)));
  }
  if (obj.clone instanceof Function) {
    return obj.clone();
  }

  const copied = {};

  for (const key of Object.getOwnPropertyNames(obj)) {
    copied[key] = clone(obj[key]);
  }

  return copied;
}

export function coldClone(target) {
  const cloned = clone(target);
  return target === cloned
    ? target
    : Object.freeze(target)
    ;
}
