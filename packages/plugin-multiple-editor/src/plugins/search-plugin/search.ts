import { editorController } from '@/Controller';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';

type Methods = Record<string, { count: number }>;

export function getAllMethodFromSchema() {
  const schema = editorController.getSchema(true);
  const componentData = schema.componentsTree?.[0];
  const methods: Methods = {};
  if (componentData) {
    Object.assign(methods, getMethodFromNode(componentData));
  }
  return methods;
}

function getMethodFromNode(node: any): Methods {
  const methods: Methods = {};
  const mergeIfReference = (obj: any) => {
    if (obj?.value && typeof obj.value) {
      // JSFunction values look like this.xxx.apply()
      const matches = obj.value.match(
        /((this\.)\w+(\.apply)?\(.*?\))/g
      ) as string[];
      if (matches?.length) {
        for (const match of matches) {
          // Double check
          if (/(this\.)\w+(\.apply)?\(.*?\)/.test(match)) {
            mergeMethod(methods, {
              [match.replace(/(this\.)|((\.apply)?\(.*$)/g, '')]: { count: 1 },
            });
          }
        }
      }
    }
  };

  // Merge an array of nodes, e.g. the element list of a slot
  const mergeNodeList = (list: any[]) => {
    if (!isArray(list)) {
      return;
    }
    for (const item of list) {
      mergeMethod(methods, getMethodFromNode(item));
    }
  };

  const propsKeys = Object.keys(node?.props || {});
  // Props and events
  for (const key of propsKeys) {
    const prop = node.props[key];
    // Handle event references
    if (key === '__events' && prop.eventDataList) {
      // Already handled in mergeIfReference, so the following is not needed for now
      // for (const ev of prop.eventDataList) {
      //   mergeMethod(methods, { [ev.relatedEventName]: { count: 1 } });
      // }
    } else {
      // Plain slot
      if (prop.type === 'JSSlot') {
        mergeNodeList(prop.value || []);
      } else if (prop.type === 'JSFunction') {
        mergeIfReference(prop);
      } else if (isArray(prop)) {
        // Array type, which may be an array of slots
        for (const item of prop) {
          if (isObject(item)) {
            for (const k of Object.keys(item)) {
              const p: any = (item as any)[k];
              if (p.type === 'JSSlot') {
                mergeNodeList(p.value);
              }
            }
          }
        }
      } else {
        // Plain props
        mergeIfReference(prop);
      }
    }
  }

  // Conditional
  mergeIfReference(node?.condition);

  // Loop
  mergeIfReference(node.loop);

  // Children
  mergeNodeList(node.children || []);

  return methods;
}

// Merge methods, summing their reference counts
function mergeMethod(methods: Methods, childMethods: Methods) {
  for (const method of Object.keys(childMethods)) {
    if (!methods[method]) {
      methods[method] = childMethods[method];
    } else {
      methods[method].count += childMethods[method].count;
    }
  }
  return methods;
}
