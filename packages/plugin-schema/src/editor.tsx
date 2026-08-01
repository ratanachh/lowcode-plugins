import * as React from 'react';
import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import MonacoEditor from '@rchh/lowcode-plugin-base-monaco-editor';

import { Dialog, Message, Button } from '@alifd/next';
import { IPublicEnumTransformStage, IPublicModelPluginContext } from '@rchh/lowcode-types';
import { IEditorInstance } from '@rchh/lowcode-plugin-base-monaco-editor/lib/helper';

interface PluginCodeDiffProps {
  pluginContext: IPublicModelPluginContext;
  // Whether to show the project-level schema
  showProjectSchema: boolean;
}

export default function PluginSchema({ pluginContext, showProjectSchema = false }: PluginCodeDiffProps) {
  const { project, skeleton } = pluginContext;

  const [editorSize, setEditorSize] = useState({ width: 0, height: 0 });
  const getSchemaStr = useCallback(() => {
    const schema = project.exportSchema(IPublicEnumTransformStage.Save);
    const schemaToShow = showProjectSchema? schema : schema?.componentsTree?.[0];
    return schemaToShow ? JSON.stringify(schemaToShow, null, 2) : '';
  }, []);
  const [schemaValue, setSchemaValue] = useState(() => {
    return getSchemaStr();
  });
  const monacoEditorRef = useRef<IEditorInstance>();

  const resize = useCallback(() => {
    setEditorSize({
      width: document.documentElement.clientWidth - 60,
      height: document.documentElement.clientHeight - 100,
    });
  }, []);

  useLayoutEffect(() => {
    const cancelListenShowPanel = skeleton.onShowPanel((pluginName: string) => {
      if (pluginName == 'LowcodePluginAliLowcodePluginSchema') {
        setSchemaValue(getSchemaStr());
      }
    })
    return cancelListenShowPanel;
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [resize]);

  const onSave = () => {
    Dialog.alert({
      content: 'Are you 100% sure? Lowcode editor may crash.',
      footerActions: ['cancel', 'ok'],
      onOk: () => {
        let json;
        try {
          json = JSON.parse(monacoEditorRef.current?.getValue() ?? schemaValue);
        } catch (err) {
          Message.error('Cannot save schema. Schema Parse Error.' + err.message);
          return;
        }
        if (showProjectSchema) {
          // Operating on the project-level schema
          project.importSchema(json);
        } else {
          // Operating on the page-level schema
          project.importSchema({
            ...project.exportSchema(IPublicEnumTransformStage.Save),
            componentsTree: [json],
          });
        }
        Message.success('Schema Saved!');
        skeleton.hidePanel('LowcodePluginAliLowcodePluginSchema');
      }
    });
  }

  return (
    <>
      <Button
        onClick={onSave}
        style={{ position: 'absolute', right: 68, zIndex: 100, top: -38 }}
      >
        {pluginContext.intl('Save Schema')}
      </Button>
      <MonacoEditor
        height={editorSize.height}
        language="json"
        theme="vs-light"
        value={schemaValue}
        onChange={(input) => {
          setSchemaValue(input);
        }}
        editorDidMount={(_, monacoEditor) => {
          monacoEditorRef.current = monacoEditor
          monacoEditor.addAction({
            id: 'my-unique-id',
            label: 'Save Schema',
            keybindingContext: null,
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: onSave,
          });
        }}
      />
    </>
  )
}
