import {
  isImportDeclaration,
  isExportDefaultDeclaration,
  isExportDeclaration,
  isVariableDeclaration,
  isFunctionDeclaration,
  isArrowFunctionExpression,
} from '@babel/types';
import { traverse } from '../ghostBabel';
import { intl } from '../../locale';

export function lintIndex(content: string) {
  let valid = true;
  let validMsg = intl('LintNoTopLevelVar');

  traverse(content, {
    Program(path) {
      for (const node of path.node.body) {
        if (!isExportDefaultDeclaration(node) && !isImportDeclaration(node)) {
          valid = false;
          if (isExportDeclaration(node)) {
            validMsg = intl('LintNamedExport');
            return;
          }
          if (isVariableDeclaration(node)) {
            validMsg = intl('LintNoVarOutsideClass');
            return;
          }
          if (isFunctionDeclaration(node)) {
            validMsg = intl('LintNoFuncOutsideClass');
            return;
          }
        }
      }
    },
    ClassProperty(path) {
      if (isArrowFunctionExpression(path.node.value)) {
        valid = false;
        validMsg = intl('LintNoArrowMethod');
      }
    },
  });
  return { valid, validMsg };
}
