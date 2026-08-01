import React, { CSSProperties, FC, useCallback, useRef, useState } from 'react';
import { Form, Input, Dialog, Message } from '@alifd/next';
import cls from 'classnames';
import { Dir, File, getFileOrDirTarget } from '../../utils/files';
import TreeNode, {
  HandleAddFn,
  HandleChangeFn,
  HandleDeleteFn,
  HandleRenameFn,
} from './TreeNode';
import './index.less';
import { useEditorContext } from '../../Context';
import fullscreenIcon from './img/fullscreen.svg';
import fullscreenExitIcon from './img/fullscreen-exit.svg';
import compileIcon from './img/compile.svg';
import { PluginAction } from '@/Service';
import { intl } from '../../locale';

export interface FileTreeProps {
  dir?: Dir;
  mode?: 'single' | 'multiple';
  onChange?: HandleChangeFn;
  className?: string;
  onSave?: () => any;
  onFullscreen?: (enable: boolean) => void;
  fullscreen?: boolean;
  actions?: PluginAction[];
}

const defaultDir = new Dir('/', [], [], '');

function validate(
  data: { type: string; path: any },
  name: string,
  fileTree: any
) {
  const { type, path } = data;
  if (/\\|\//.test(name)) {
    return intl('InvalidName');
  }
  if (name === 'modules') {
    return intl('ModulesReserved');
  }
  const finalNode: Dir | undefined = getFileOrDirTarget(fileTree, path);
  if (finalNode) {
    const targetDir: any[] =
      type === 'file' ? finalNode?.files : finalNode.dirs;
    if (targetDir.find((t: any) => t.name === name)) {
      return intl('FileOrFolderExists');
    }
  }
  if (data.type === 'file' && name.endsWith('.less') && name !== 'index.less') {
    return intl('OnlyIndexLess');
  }
  if (data.type === 'file') {
    return name && /\.(js|less)$/.test(name)
      ? undefined
      : intl('FileNameRequired');
  }
}

const newModalStyle: CSSProperties = {
  width: 380,
};

const FileTree: FC<FileTreeProps> = ({
  dir = defaultDir,
  onChange,
  className,
  onSave,
  onFullscreen,
  fullscreen,
  mode,
  actions,
}) => {
  const { updateFileTreeByPath, fileTree, modifiedKeys, currentFile } =
    useEditorContext();
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState({ name: '' });
  const tmp = useRef<{
    path: string[];
    type: string;
    fullPath: string;
    operation?: string;
    target?: any;
  }>({} as any).current;
  const handleAdd = useCallback<HandleAddFn>(
    (type, path) => {
      tmp.operation = 'add';
      tmp.path = path;
      tmp.type = type;
      setValue({ name: '' });
      setVisible(true);
    },
    [tmp]
  );
  const handleRename = useCallback<HandleRenameFn>(
    (type, path, target) => {
      tmp.target = target;
      tmp.operation = 'rename';
      tmp.path = path;
      tmp.type = type;
      setValue({ name: '' });
      setVisible(true);
    },
    [tmp]
  );
  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const handleChange = useCallback((v: string) => {
    setValue({ name: v });
  }, []);

  const handleEditFileToTree = useCallback(
    async (e?: React.KeyboardEvent<HTMLInputElement>) => {
      if (e && !(e.key === 'Enter' || e?.keyCode === 13)) {
        return;
      }
      const { name } = value;
      const validMsg = validate(tmp, name, fileTree);
      if (!validMsg) {
        const fullPath = `${tmp.path}/${name}`;
        if (tmp.operation === 'rename') {
          updateFileTreeByPath(tmp.path, tmp.target, 'rename', name);
        } else {
          const target =
            tmp.type === 'file'
              ? new File(name, '', fullPath)
              : new Dir(name, [], [], fullPath);
          updateFileTreeByPath(tmp.path, target, 'add');
        }
        setVisible(false);
      } else {
        Message.error(validMsg);
      }
    },
    [fileTree, tmp, updateFileTreeByPath, value]
  );

  const handleDelete = useCallback<HandleDeleteFn>(
    (path, target) => {
      Dialog.confirm({
        title: intl('ConfirmDelete'),
        onOk() {
          updateFileTreeByPath(path, target, 'delete');
        },
      });
    },
    [updateFileTreeByPath]
  );
  let title = tmp.type === 'file' ? intl('NewFile') : intl('NewFolder');
  if (tmp.operation === 'rename') {
    title = tmp.type === 'file' ? intl('RenameFile') : intl('RenameFolder');
  }
  return (
    <div className={cls('ilp-file-bar', className)}>
      <h4 className="ilp-file-bar-title">
        <span>{intl('FileDirectory')}</span>
        <span>
          <img
            src={fullscreen ? fullscreenExitIcon : fullscreenIcon}
            alt={fullscreen ? intl('ExitFullscreen') : intl('Fullscreen')}
            title={fullscreen ? intl('ExitFullscreen') : intl('Fullscreen')}
            onClick={() => onFullscreen?.(!fullscreen)}
          />
          <img
            src={compileIcon}
            alt={intl('CompileCode')}
            title={intl('CompileCode')}
            onClick={onSave}
          />
          {actions?.map((item) => (
            <span
              className="ilp-tree-action-item"
              key={item.key}
              title={item.title}
              onClick={item.action}
            >
              {item.icon}
            </span>
          ))}
        </span>
      </h4>

      <TreeNode
        dir={dir}
        className={mode === 'single' ? 'ilp-file-tree-single' : ''}
        disableAction={mode === 'single'}
        onChange={onChange}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onRename={handleRename}
        modifiedKeys={modifiedKeys}
        selectedKey={currentFile.file?.fullPath}
      />

      <Dialog
        style={newModalStyle}
        title={title}
        visible={visible}
        onCancel={handleClose}
        onClose={handleClose}
        onOk={() => handleEditFileToTree()}
      >
        <Form>
          <Form.Item
            label={tmp.type === 'file' ? intl('FileName') : intl('FolderName')}
            name="name"
            required
            requiredMessage={intl('Required')}
          >
            <Input
              autoFocus
              value={value.name}
              onChange={handleChange}
              onKeyDown={(e) => handleEditFileToTree(e)}
            />
          </Form.Item>
        </Form>
      </Dialog>
    </div>
  );
};

export default FileTree;
