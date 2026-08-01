import { IPublicTypeProjectSchema, IPublicTypeRootSchema } from '@rchh/lowcode-types';
// @ts-ignore
import prettier from 'prettier/esm/standalone.mjs';
import parserBabel from 'prettier/parser-babel';
import parserPostcss from 'prettier/parser-postcss';

// JS formatting options
const prettierJsConfig = {
  plugins: [parserBabel],
  parser: 'babel',
  tabWidth: 2, // indent with 2 spaces
  printWidth: 120, // wrap lines longer than 120 characters
  quoteProps: 'preserve', // keep quotes around object keys
  singleQuote: true, // use single quotes for strings
  semi: true, // always add a trailing semicolon
  trailingComma: 'all', // always add a trailing comma in arrays and objects
  arrowParens: 'avoid', // omit parentheses for single-argument arrow functions: x => x
};
// CSS formatting options
const prettierCssConfig = {
  plugins: [parserPostcss],
  parser: 'css',
  tabWidth: 2, // indent with 2 spaces
  printWidth: 120, // wrap lines longer than 120 characters
};

export const initCode = (
  componentSchema: IPublicTypeRootSchema | undefined
) => {
  return (
    (componentSchema as any)?.originCode ||
    `export default class LowcodeComponent extends Component {
  state = {
    name: "code plugin",
  }
  componentDidMount() {
    console.log('mount');
  }
  componentWillUnmount() {
    console.log('unmount');
  }
  testFunc() {
    console.log('test function');
  }
}`
  );
};

// Format JS
export const beautifyJs = (input: string, options: any): string => {
  if (options !== false && input) {
    try {
      input = prettier.format(input, {
        ...prettierJsConfig,
        ...options,
      });
      // Drop the trailing newline so the result matches the unformatted case
      input = input.substring(0, input.length - 1);
    } catch (e) {
      console.log(e);
    }
  }
  return input ? input : '';
};

// Format CSS
export const beautifyCSS = (input: string, options: any): string => {
  if (options !== false && input) {
    input = prettier.format(input, {
      ...prettierCssConfig,
      ...options,
    });
  }
  return input ? input : '';
};

// Convert the schema into CSS code
export const schema2CssCode = (schema: IPublicTypeProjectSchema, prettierOptions: any) => {
  return beautifyCSS(schema.componentsTree[0]?.css || '', prettierOptions);
};
