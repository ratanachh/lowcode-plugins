import { transform } from './babel';
import { TransformResult } from '../types';
import { intl } from '../locale';

export const transformJS = (code, config): TransformResult => {
  let hasError = false;
  let errorInfo = '';
  let transformCode = '';
  let errorLocation = undefined;
  try {
    transformCode = transform(code, config).code;
  } catch (ex: any) {
    hasError = true;
    errorInfo = ex.message?.split('\n')?.[0] ?? intl('CodeParseError');
    errorInfo = errorInfo.replace('unknown: ', '')
    errorLocation = ex.loc;
  }

  return {
    hasError,
    errorInfo,
    errorLocation,
    code: transformCode,
  };
};
