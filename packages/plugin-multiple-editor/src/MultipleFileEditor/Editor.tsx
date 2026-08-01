import FileTree from '@/components/FileTree';
import MonacoEditor from '@/components/MonacoEditor';
import Outline from '@/components/Outline';
import { useEditorContext } from '../Context';
import { Dialog, Message } from '@alifd/next';
import { intl } from '../locale';
import cls from 'classnames';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import './index.less';
import { HandleChangeFn } from '../components/FileTree/TreeNode';
import { languageMap } from '../utils/constants';
import { parseKey, treeToMap } from 'utils/files';
import { editorController, HookKeys } from '../Controller';

import { initEditorModel, useUnReactiveFn } from './util';
import type { editor } from 'monaco-editor';
import { Monaco } from '../types';
import { PluginHooks } from '@/Service';

// Minimum and maximum width (including the toolbar)
const MINWIDTH = 246;
const MAXWIDTH = 446;

const Editor: FC = () => {
  const editorContext = useEditorContext();
  const {
    fileTree,
    // softSave,
    mode,
    modifiedKeys,
    currentFile: { file, path },
    selectFile,
    updateState,
    initialFileMap,
  } = editorContext;
  const monacoEditor = useRef<editor.IStandaloneCodeEditor>();
  const monacoRef = useRef<Monaco>();
  const [fullscreen, setFullscreen] = useState(false);
  const [fileContent, setFileContent] = useState(file?.content);
  const [fileTreeWidth, setFileTreeWidth] = useState('200px');
  const containerRef = useRef<HTMLDivElement>();
  const filePath = file?.fullPath || '';
  const handleChange = useCallback<HandleChangeFn>(
    (file, path) => {
      selectFile(file, path);
      setFileContent(file?.content);
    },
    [selectFile]
  );
  const handleEditorChange = useCallback(
    (value: string) => {
      setFileContent(value);
      file && (file.content = value);
      editorController.triggerHook(HookKeys.onEditCodeChange, {
        file: file?.fullPath,
        content: value,
      });
      if (!modifiedKeys.find((k) => k === file?.fullPath)) {
        updateState({ modifiedKeys: [...modifiedKeys, file?.fullPath as any] });
      }
    },
    [file, modifiedKeys, updateState]
  );

  const handleCompile = useCallback(
    (silent?: boolean) => {
      try {
        const fileMap = treeToMap(fileTree);
        const success = editorController.compileSourceCode(fileMap);
        !silent && success && Message.success(intl('CompileSuccess'));
        return true;
      } catch (error) {
        Dialog.alert({
          title: intl('CompileFailed'),
          content: (
            <pre>{(error as any).message || intl('CompileFailedCheckSyntax')}</pre>
          ),
        });
        console.error(error);
        return false;
      }
    },
    [fileTree]
  );
  const { handler: handleSave } = useUnReactiveFn(() => {
    if (handleCompile(true)) {
      // Everything is saved, clear the modified markers
      updateState({ modifiedKeys: [] });
    }
  }, [handleCompile]);

  const handleGotoFile = useCallback(
    (filename: string) => {
      const { file, path } = parseKey(filename);
      selectFile(file, path);
    },
    [selectFile]
  );

  const handleEditorMount = useCallback(
    (codeEditor: any, monaco: Monaco) => {
      monacoEditor.current = codeEditor;
      monacoRef.current = monaco;
      initEditorModel(initialFileMap, monaco);
      editorController.initCodeEditor(codeEditor, editorContext);
      editorController.service.triggerHook(
        PluginHooks.onEditorMount,
        codeEditor
      );
    },
    [editorContext, initialFileMap]
  );

  useEffect(() => {
    if (monacoEditor.current && editorContext) {
      editorController.initCodeEditor(monacoEditor.current, editorContext);
    }
  }, [editorContext]);

  useEffect(() => {
    editorController.service.triggerHook(PluginHooks.onSelectFileChange, {
      filepath: file?.fullPath,
      content: file?.content,
    });
    editorController.triggerHook(HookKeys.onEditCodeChange, {
      file: file?.fullPath,
      content: file?.content,
    });
  }, [file, path]);

  useEffect(() => {
    editorController.editor?.on(
      'skeleton.panel-dock.unactive',
      (pluginName) => {
        if (
          pluginName === 'codeEditor' ||
          pluginName === 'multiple-file-code-editor'
        ) {
          handleSave();
        }
      }
    );
  }, [handleSave]);
  const handleFullScreen = useCallback((enable: boolean) => {
    setFullscreen(enable);
  }, []);
  const handleMoveDrag = () => {
    let first = true;
    document.onmousemove = function (e) {
      if (first) {
        // A one-pixel drag counts as a click, which avoids clicks accidentally triggering a drag
        first = false;
        return;
      }
      const clientX = e.clientX;
      const maxWidth =
        clientX < MINWIDTH ? MINWIDTH : clientX > MAXWIDTH ? MAXWIDTH : clientX;
      setFileTreeWidth(`${fullscreen ? maxWidth : maxWidth - 46}px`);
      return false;
    };

    document.onmouseup = function (e) {
      document.onmousemove = null;
      // document.onmouseup = null;
      return false;
    };
  };
  return (
    <div
      className={cls(
        'ilp-multiple-editor',
        fullscreen && 'ilp-multiple-editor-fullscreen'
      )}
      ref={containerRef as any}
    >
      <div
        onMouseDown={handleMoveDrag}
        className="ilp-multiple-editor-tree-drag"
        style={{ width: fileTreeWidth }}
      >
        <FileTree
          mode={mode}
          dir={fileTree}
          className="ilp-multiple-editor-tree"
          onChange={handleChange}
          onSave={() => handleCompile()}
          fullscreen={fullscreen}
          onFullscreen={handleFullScreen}
          actions={editorController.service.actionMap}
        />
      </div>
      <Outline
        ilpOutLineStyle={{ width: fileTreeWidth }}
        content={fileContent}
        filePath={filePath}
        className="ilp-multiple-editor-outline"
      />
      <div
        className="ilp-multiple-editor-wrapper"
        style={{ left: fileTreeWidth, width: `calc(100% - ${fileTreeWidth})` }}
      >
        <h3>{file ? file.name : intl('NoFile')}</h3>
        {file ? (
          <MonacoEditor
            language={languageMap[file.ext || ''] as any}
            filePath={filePath}
            value={file.content}
            onChange={handleEditorChange}
            onGotoFile={handleGotoFile}
            onEditorMount={handleEditorMount}
            isFullscreen={fullscreen}
          />
        ) : (
          intl('NoFileSelected')
        )}
      </div>
    </div>
  );
};

export default Editor;
