import { project } from '@rchh/lowcode-engine';
import { IPublicEnumTransformStage } from '@rchh/lowcode-types';

export const deleteHiddenTransducer = (ctx: any) => {
  return {
    name: 'deleteHiddenTransducer',
    async init() {
      project.addPropsTransducer((props: any): any => {
        delete props.hidden;
        return props;
      }, IPublicEnumTransformStage.Save);
    },
  };
};

deleteHiddenTransducer.pluginName = 'deleteHiddenTransducer';
