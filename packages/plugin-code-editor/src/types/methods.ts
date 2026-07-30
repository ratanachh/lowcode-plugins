import { JSFunction, JSExpression } from '@rchh/lowcode-types';
export type Method = JSExpression | JSFunction & {
  source: string;
}

export interface Methods {
  [key: string]: Method;
}
