import * as React from 'react';
import {
  IPublicModelPluginContext,
  IPublicModelResource,
  IPublicTypeSkeletonConfig,
  IPublicTypeContextMenuAction,
} from '@rchh/lowcode-types';
import Icon from './icon';
import { Pane } from './pane';
import './index.scss';
import { intl } from './locale';

export interface IOptions {
  init?: (ctx: IPublicModelPluginContext) => {};

  renderAddFileComponent?: () => React.JSX.Element;

  handleClose?: (force?: boolean) => void;

  filterResourceList?: () => {};

  showIconText?: boolean;

  skeletonConfig?: IPublicTypeSkeletonConfig;

  /**
   * Context menu items
   */
  contextMenuActions?: (ctx: IPublicModelPluginContext) => IPublicTypeContextMenuAction[];

  /**
   * Context menu items of a resource
   */
  resourceContextMenuActions?: (ctx: IPublicModelPluginContext, resource: IPublicModelResource) => IPublicTypeContextMenuAction[];

  /**
   * Context menu items of a resource group
   */
  resourceGroupContextMenuActions?: (ctx: IPublicModelPluginContext, resources: IPublicModelResource[]) => IPublicTypeContextMenuAction[];
}

const ViewManagerPane = (
  ctx: IPublicModelPluginContext,
  options: IOptions = {}
) => {
  return {
    // Plugin initializer, called right after the engine has been initialized
    async init() {
      const showIconText = options.showIconText ?? true;
      // Add a pane to the engine
      ctx.skeleton.add({
        area: 'leftArea',
        name: 'ViewManagerPane',
        props: {
          icon: <Icon showIconText={showIconText} />,
          description: intl('view_manager.src.ViewManagement'),
          className: `workspace-view-pane-icon ${showIconText ? 'show-icon-text' : null }`,
        },
        panelProps: {
          width: '200px',
        },
        content: Pane,
        contentProps: {
          options: {
            handleClose: () => {
              ctx.skeleton.hidePanel('ViewManagerPane');
            },
            ...options,
          },
          pluginContext: ctx,
        },
        ...(options.skeletonConfig || {}),
        type: options.skeletonConfig?.type || 'PanelDock',
      });
    },
  };
};

// Plugin name, unique within the registration environment
ViewManagerPane.pluginName = 'ViewManagerPane';
ViewManagerPane.meta = {
  // Plugins this one depends on (array of plugin names)
  dependencies: [],
  engines: {
    lowcodeEngine: '^1.3.0', // The plugin requires an engine of version ^1.0.0 or above
  },
  preferenceDeclaration: {
    title: intl('view_manager.src.ViewManagementPanelPlugIn'),
    properties: [
      {
        key: 'init',
        type: 'function',
        description: '',
      },
      {
        key: 'handleClose',
        type: 'function',
        description: '',
      },
      {
        key: 'showIconText',
        type: 'boolean',
        description: '',
      },
      {
        key: 'skeletonConfig',
        type: 'object',
        description: '',
      },
      {
        key: 'contextMenuActions',
        type: 'function',
        description: intl('view_manager.src.ContextMenuActions'),
      },
      {
        key: 'resourceContextMenuActions',
        type: 'function',
        description: intl('view_manager.src.ResourceContextMenuActions'),
      },
      {
        key: 'resourceGroupContextMenuActions',
        type: 'function',
        description: intl('view_manager.src.ResourceGroupContextMenuActions'),
      },
      {
        key: 'filterResourceList',
        type: 'function',
        description: '',
      },
      {
        key: 'showIconText',
        type: 'boolean',
        description: '',
      },
      {
        key: 'skeletonConfig',
        type: 'object',
        description: '',
      }
    ],
  },
};

export default ViewManagerPane;
