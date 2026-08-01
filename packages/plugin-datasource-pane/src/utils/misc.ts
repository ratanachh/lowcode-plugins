import _isArray from 'lodash/isArray';
import _isPlainObject from 'lodash/isPlainObject';
import _findIndex from 'lodash/findIndex';
import _isUndefined from 'lodash/isUndefined';

/**
 * Merges two object arrays. When a key is given, objects from the first array are replaced by
 * objects from the second array that share the same key value.
 * @param list1 the first object array to merge
 * @param list2 the second object array to merge
 * @param key the object key used to decide whether to override
 * @param returns the merged object array
 */
export function mergeTwoObjectListByKey(
  list1: Array<Record<string, unknown>>,
  list2: Array<Record<string, unknown>>,
  key: string,
) {
  if (!_isArray(list1) && !_isArray(list2)) {
    return [];
  }
  if (!_isArray(list1)) {
    return [...list2];
  }
  if (!_isArray(list2)) {
    return [...list1];
  }
  return list2.reduce((acc, cur) => {
    if (!_isPlainObject(cur)) return acc;
    const indexToReplace = _findIndex(acc, (item) => item[key] === cur[key]);
    if (indexToReplace !== -1) {
      acc[indexToReplace] = { ...cur };
      return acc;
    }
    return acc.concat([cur]);
  }, list1);
}

export function generateClassName(name: string) {
  return `lowcode-plugin-datasource-pane-${name}`;
}

export function safeParse(input: any, fallbackValue?: any) {
  try {
    return JSON.parse(input);
  } catch (err) {
    if (!_isUndefined(fallbackValue)) {
      return fallbackValue;
    }
    return input;
  }
}
