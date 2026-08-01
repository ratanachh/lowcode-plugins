import { material, project } from '@rchh/lowcode-engine';
import { filterPackages } from '@rchh/lowcode-plugin-inject';
import { Message, Dialog } from '@alifd/next';
import { TransformStage } from '@rchh/lowcode-types';

export const loadIncrementalAssets = () => {
  material?.onChangeAssets(() => {
    Message.success('[MCBreadcrumb] material loaded successfully');
  });

  material.loadIncrementalAssets({
    packages: [
      {
        title: 'MCBreadcrumb',
        package: 'mc-breadcrumb',
        version: '1.0.0',
        urls: [
          'https://unpkg.alibaba-inc.com/mc-breadcrumb@1.0.0/dist/MCBreadcrumb.js',
          'https://unpkg.alibaba-inc.com/mc-breadcrumb@1.0.0/dist/MCBreadcrumb.css',
        ],
        library: 'MCBreadcrumb',
      } as any,
    ],
    components: [
      {
        componentName: 'MCBreadcrumb',
        title: 'MCBreadcrumb',
        docUrl: '',
        screenshot: '',
        npm: {
          package: 'mc-breadcrumb',
          version: '1.0.0',
          exportName: 'MCBreadcrumb',
          main: 'lib/index.js',
          destructuring: false,
          subName: '',
        },
        props: [
          {
            name: 'prefix',
            propType: 'string',
            description: 'Brand prefix of the style class names',
            defaultValue: 'next-',
          },
          {
            name: 'title',
            propType: 'string',
            description: 'Title',
            defaultValue: 'next-',
          },
          {
            name: 'rtl',
            propType: 'bool',
          },
          {
            name: 'children',
            propType: {
              type: 'instanceOf',
              value: 'node',
            },
            description: 'Breadcrumb children; Breadcrumb.Item elements are expected',
          },
          {
            name: 'maxNode',
            propType: {
              type: 'oneOfType',
              value: [
                'number',
                {
                  type: 'oneOf',
                  value: ['auto'],
                },
              ],
            },
            description:
              'Maximum number of breadcrumb items to show; extra items are hidden. Set to auto to adapt to the parent width.',
            defaultValue: 100,
          },
          {
            name: 'separator',
            propType: {
              type: 'instanceOf',
              value: 'node',
            },
            description: 'Separator, either text or an Icon',
          },
          {
            name: 'component',
            propType: {
              type: 'oneOfType',
              value: ['string', 'func'],
            },
            description: 'Tag type',
            defaultValue: 'nav',
          },
          {
            name: 'className',
            propType: 'any',
          },
          {
            name: 'style',
            propType: 'object',
          },
        ],
        configure: {
          component: {
            isContainer: true,
            isModel: true,
            rootSelector: 'div.MCBreadcrumb',
          } as any,
        },
      },
    ],

    componentList: [
      {
        title: 'Common',
        icon: '',
        children: [
          {
            componentName: 'MCBreadcrumb',
            title: 'MC Breadcrumb',
            icon: '',
            package: 'mc-breadcrumb',
            library: 'MCBreadcrumb',
            snippets: [
              {
                title: 'MC Breadcrumb',
                screenshot:
                  'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_breadcrumb.png',
                schema: {
                  componentName: 'MCBreadcrumb',
                  props: {
                    title: 'Material center',
                    prefix: 'next-',
                    maxNode: 100,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  } as any);
};

export const preview = (scenarioName = 'index') => {
  saveSchema(scenarioName);
  setTimeout(() => {
    const search = window.location.search
      ? `${window.location.search}&scenarioName=${scenarioName}`
      : `?scenarioName=${scenarioName}`;
    window.open(`./preview.html${search}`);
  }, 500);
};

export const saveSchema = async (scenarioName = 'index') => {
  setProjectSchemaToLocalStorage(scenarioName);

  await setPackgesToLocalStorage(scenarioName);
  // window.localStorage.setItem(
  //   'projectSchema',
  //   JSON.stringify(project.exportSchema(TransformStage.Save))
  // );
  // const packages = await filterPackages(material.getAssets().packages);
  // window.localStorage.setItem(
  //   'packages',
  //   JSON.stringify(packages)
  // );
  Message.success('Saved locally');
};

export const resetSchema = async (scenarioName = 'index') => {
  try {
    await new Promise<void>((resolve, reject) => {
      Dialog.confirm({
        content: 'Are you sure you want to reset? All your changes will be lost.',
        onOk: () => {
          resolve();
        },
        onCancel: () => {
          reject();
        },
      });
    });
  } catch (err) {
    return;
  }

  // Apart from the combined scenario, no scenario ships a default schema.json, so build an empty page here
  if (scenarioName !== 'index') {
    window.localStorage.setItem(
      getLSName(scenarioName),
      JSON.stringify({
        componentsTree: [{ componentName: 'Page', fileName: 'sample' }],
        componentsMap: material.componentsMap,
        version: '1.0.0',
        i18n: {},
      })
    );
    project
      .getCurrentDocument()
      ?.importSchema({ componentName: 'Page', fileName: 'sample' });
    project.simulatorHost?.rerender();
    Message.success('Page reset');
    return;
  }

  let schema;
  try {
    schema = await request('./schema.json');
  } catch (err) {
    schema = {
      componentName: 'Page',
      fileName: 'sample',
    };
  }

  window.localStorage.setItem(
    getLSName('index'),
    JSON.stringify({
      componentsTree: [schema],
      componentsMap: material.componentsMap,
      version: '1.0.0',
      i18n: {},
    })
  );

  project.getCurrentDocument()?.importSchema(schema);
  project.simulatorHost?.rerender();
  Message.success('Page reset');
};

const getLSName = (scenarioName: string, ns = 'projectSchema') =>
  `${scenarioName}:${ns}`;

export const getProjectSchemaFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  return JSON.parse(
    window.localStorage.getItem(getLSName(scenarioName)) || '{}'
  );
};

const setProjectSchemaToLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  window.localStorage.setItem(
    getLSName(scenarioName),
    JSON.stringify(project.exportSchema(TransformStage.Save as any))
  );
};

const setPackgesToLocalStorage = async (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  const packages = await filterPackages(material.getAssets().packages);
  window.localStorage.setItem(
    getLSName(scenarioName, 'packages'),
    JSON.stringify(packages)
  );
};

export const getPackagesFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  return JSON.parse(
    window.localStorage.getItem(getLSName(scenarioName, 'packages')) || '{}'
  );
};

export const getPageSchema = async (scenarioName = 'index') => {
  const pageSchema =
    getProjectSchemaFromLocalStorage(scenarioName).componentsTree?.[0];

  if (pageSchema) {
    return pageSchema;
  }

  return await request('./schema.json');
};

function request(
  dataAPI: string,
  method = 'GET',
  data?: object | string,
  headers?: object,
  otherProps?: any
): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return Promise.resolve(require('./schema.json'));
}
