import { transformFromAst as babelTransformFromAst } from '@babel/standalone';
import template from '@babel/template';
import { traverse } from './ghostBabel';

import {
  functionDeclaration,
  identifier,
  blockStatement,
  Identifier,
  ObjectExpression,
  ObjectProperty,
  Expression,
  file,
  program,
  variableDeclaration,
  variableDeclarator,
  isArrowFunctionExpression,
  isBlockStatement,
  returnStatement,
} from '@babel/types';

import { Methods } from '../types';
import { pureTranspile } from './multipleFile/babel';
import { ensureCtrForIndex } from './transformUMD';

const LIFECYCLES_FUNCTION_MAP = {
  react: [
    'constructor',
    'render',
    'componentDidMount',
    'componentDidUpdate',
    'componentWillUnmount',
    'componentDidCatch',
  ],
};

/**
 * get all methods from code-editor-pane
 */
export const getMethods = (fileContent: string) => {
  const realIndexContent = ensureCtrForIndex(fileContent);
  const methodList: Methods = {};
  const state: Record<string, any> = {};
  traverse(realIndexContent, {
    ClassMethod(path) {
      const { node } = path;
      // @ts-ignore
      const { name } = node.key;
      const { params } = node;
      // creat empty AST
      const code = file(program([]));
      const callName = name === 'constructor' ? '__constructor' : name;
      const callExpressionString = template(`
        return this.$ss.default.prototype.${callName}.apply(this, Array.prototype.slice.call(arguments));
      `)();
      code.program.body.push(
        functionDeclaration(
          identifier(name),
          // @ts-ignore
          params.map((p) => {
            if (p.type === 'Identifier') {
              return identifier(p.name);
            } else {
              // Destructuring syntax or ...args
              // Return it as-is, no extra construction needed
              return p;
            }
          }) as any[],
          /**
           * Every js file goes through compilation, so when collecting methods it is enough to call the
           * prototype methods of the class exported by default from index.js.
           * The constructor is special and keeps the original behaviour;
           * only the other methods go through this transformation.
           */
          // name === 'constructor'
          //   ? body
          //   :
          blockStatement(
            Array.isArray(callExpressionString)
              ? callExpressionString
              : [callExpressionString]
          ),
          node.generator,
          node.async
        )
      );
      // @ts-ignore
      const codeStr = babelTransformFromAst(code, undefined, {}).code;

      methodList[name] = {
        type: 'JSFunction',
        value: codeStr,
      };
    },
    ClassProperty({ node }) {
      const key = node.key as Identifier;
      const stateValue = node.value as ObjectExpression;
      if (key.name === 'state') {
        const properties = stateValue.properties || [];
        for (const property of properties as ObjectProperty[]) {
          const code = file(program([]));
          code.program.body.push(
            variableDeclaration('var', [
              variableDeclarator(
                identifier('name'),
                property.value as Expression
              ),
            ])
          );
          const codeStr = (babelTransformFromAst(code, undefined, {}) as any)
            ?.code;
          const compiledCode = pureTranspile(codeStr, { esm: true });
          state[
            ((property.key as Identifier).name ?? (property?.key?.extra as any)?.rawValue) as string
          ] = {
            type: 'JSExpression',
            value: compiledCode.replace(/var *name *= */, '').replace(/;$/, ''),
          };
        }
      }
      if (isArrowFunctionExpression(node.value)) {
        const { name } = node.key as Identifier;
        const ast = file(program([]));
        const { body, params, generator, async: isAsync } = node.value;
        ast.program.body.push(
          functionDeclaration(
            node.key as Identifier,
            params,
            isBlockStatement(body)
              ? body
              : blockStatement([returnStatement(body as Expression)]),
            generator,
            isAsync
          )
        );
        methodList[name] = {
          type: 'JSFunction',
          value: (babelTransformFromAst(ast, undefined, {}) as any).code,
        };
      }
    },
  });
  const methods: any = {};
  const lifeCycles: any = {};
  for (const key of Object.keys(methodList)) {
    if (LIFECYCLES_FUNCTION_MAP.react.find((k) => k === key)) {
      lifeCycles[key] = methodList[key];
    } else {
      methods[key] = methodList[key];
    }
  }
  return { methods, lifeCycles, state };
};
