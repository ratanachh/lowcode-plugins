import _isArray from 'lodash/isArray';
import _isPlainObject from 'lodash/isPlainObject';
import {
  InterpretDataSourceConfig,
} from '@rchh/lowcode-datasource-types';
import { isJSFunction } from '@rchh/lowcode-types';

export const DATASOURCE_HANDLER_NAME_LIST = [
  'dataHandler',
  'errorHandler',
  'willFetch',
  'shouldFetch',
];

/**
 * Whether the schema is valid
 * @param schema the schema
 */
export function isSchemaValid(schema: any) {
  if (!_isPlainObject(schema)) return false;
  if (schema.list && !_isArray(schema.list)) return false;
  if (_isArray(schema?.list)) {
    return schema.list.every((dataSource: InterpretDataSourceConfig) => {
      return DATASOURCE_HANDLER_NAME_LIST.every((dataSourceHandlerName) => {
        if (isJSFunction(dataSource?.[dataSourceHandlerName])) {
          return true;
        }
        if (!(dataSourceHandlerName in dataSource)) {
          return true;
        }
        return false;
      });
    });
  }
  return true;
}

/**
 * Corrects the schema
 * @param schema the original schema
 * @param schema the corrected schema
 */
export function correctSchema(schema: any) {
  if (!_isPlainObject(schema)) return { list: [] };
  const res = {
    ...schema,
  };
  if (_isArray(res?.list)) {
    res.list = res.list.map((dataSource: InterpretDataSourceConfig) => {
      const nextDataSource = { ...dataSource };
      DATASOURCE_HANDLER_NAME_LIST.forEach((dataSourceHandlerName) => {
        if (
          isJSFunction(nextDataSource?.[dataSourceHandlerName]) &&
          dataSourceHandlerName in nextDataSource
        ) {
          delete nextDataSource[dataSourceHandlerName];
        }
      });
      return nextDataSource;
    });
  } else {
    res.list = [];
  }
  return res;
}
