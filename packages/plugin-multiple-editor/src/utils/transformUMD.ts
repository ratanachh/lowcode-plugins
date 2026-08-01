import {
  transformFromAst,
  transform as babelTransform,
} from '@babel/standalone';
import type { PluginObj } from '@babel/core';
import { traverse, parse } from './ghostBabel';
import {
  isIdentifier,
  ClassBody,
  classMethod,
  identifier,
  Identifier,
  blockStatement,
} from '@babel/types';
import { ObjectType } from '../types';
import { transform } from './multipleFile';

export function getConstructorContent(oldCtr: string) {
  const executableScript = 'this.__initExtra.apply(this);';

  if (!oldCtr) {
    return `function constructor() {
      ${executableScript};
    }`;
  } else {
    // Insert the executable code at the top of the constructor
    return oldCtr.replace(
      /function +constructor\([a-zA-Z\-_]*\) *\{/,
      `function constructor() {\n${executableScript}\n`
    );
  }
}

/**
 * Makes sure index.js has a constructor
 * @param content
 * @returns
 */
export function ensureCtrForIndex(content: string): string {
  const ast = parse(content);
  let hasConstructor = false;
  traverse(ast, {
    ClassMethod({ node }) {
      if ((node.key as Identifier).name === 'constructor') {
        hasConstructor = true;
      }
    },
  });
  // Add a default constructor when there is none
  if (!hasConstructor) {
    traverse(ast, {
      ClassDeclaration({ node }) {
        node.body.body.unshift(
          classMethod(
            'method',
            identifier('constructor'),
            [],
            blockStatement([])
          )
        );
      },
    });
  }
  return (transformFromAst(ast, undefined, {}) as any)?.code || '';
}

function preprocessIndex(content: string) {
  const contentWithCtr = ensureCtrForIndex(content);

  const processPlugin = (): PluginObj => {
    return {
      visitor: {
        ClassMethod(path) {
          const { key, body } = path.node;
          if (isIdentifier(key) && key.name === 'constructor') {
            (path.parent as ClassBody).body.push(
              classMethod('method', identifier('__constructor'), [], body)
            );
          }
        },
      },
    };
  };
  return (
    babelTransform(contentWithCtr, { plugins: [processPlugin] }).code || ''
  );
}

export function getInitFuncContent(fileMap: ObjectType<string>, es6?: boolean) {
  const finalFileMap = Object.entries(fileMap)
    .filter(([k]) => !['index.css', 'index.less'].includes(k))
    .map(([key, content]) => {
      let realContent = content;
      if (key === 'index.js') {
        realContent = preprocessIndex(
          realContent
            .replace('extends Component', '')
            .replace(/super\([a-zA-Z_]*\);?/, '')
        );
      }
      if (key === 'index.js' && !/export +default/gi.test(content)) {
        realContent = realContent.replace(
          'class LowcodeComponent',
          'export default class LowcodeComponent'
        );
      }

      return [key, realContent];
    })
    .reduce((val, [key, content]) => ({ ...val, [key]: content }), {});

  const compiled = transform(finalFileMap, {
    plugins: [],
    es6,
  });
  return `function __initExtra() {
  ${compiled}
  this.$ss = exports;
  this.$ss.index = exports;
  return exports;
}`;
}
