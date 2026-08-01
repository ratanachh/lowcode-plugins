import { PureComponent } from 'react';
import { common } from '@rchh/lowcode-engine';
import { IPublicModelPluginContext, PluginProps } from '@rchh/lowcode-types';
import { intl } from './locale';
import { IconZh } from './icons/zh';
import { IconEn } from './icons/en';
import './index.less';

const { editorCabin } = common;
const { globalLocale, Tip } = editorCabin;

class ZhEn extends PureComponent<PluginProps> {
  static displayName = 'LowcodeZhEn';

  state = {
    locale: globalLocale.getLocale(),
  };

  private dispose = globalLocale.onChangeLocale((locale) => {
    this.setState({
      locale,
    });
    window.location.reload();
  });

  componentWillUnmount() {
    this.dispose();
  }

  render() {
    const isZh = this.state.locale === 'zh-CN';
    return (
      <div
        className="lowcode-plugin-zh-en"
        onClick={() => {
          globalLocale.setLocale(isZh ? 'en-US' : 'zh-CN');
        }}
      >
        {isZh ? <IconEn size={20} /> : <IconZh size={20} />}
        <Tip direction="right">{intl('To Locale')}</Tip>
      </div>
    );
  }
}

const plugin = (ctx: IPublicModelPluginContext) => {
  return {
    // Plugin name, unique within the registration environment
    name: 'PluginZhEn',
    // Plugins this one depends on (array of plugin names)
    dep: [],
    // Plugin initializer, called right after the engine has been initialized
    init() {
      // Add a pane to the engine
      ctx.skeleton.add({
        area: 'leftArea',
        type: 'Widget',
        name: 'zhEn',
        content: ZhEn,
        contentProps: {},
        props: {
          align: 'bottom',
        },
      })
    },
  };
};

plugin.pluginName = 'PluginZhEn'

export default plugin
