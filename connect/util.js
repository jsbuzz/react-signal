
export const extractProps = (selector) => {
  const strSelector = selector.toString();
  const arrowFunction = strSelector.includes('=>');
  let propList = null;

  if (arrowFunction) {
    propList = strSelector
      .split('=>').shift().trim()
      .replace(/[(){}\s]/g, '')
      .split(',');
  } else {
    propList = strSelector
      .split('return').pop().trim()
      .replace(/[(){};\s]/g, '')
      .split(',')
      .map(
        prop => prop.split(':').pop().split('.').pop(),
      );
  }

  return propList.length ? propList : null;
};
