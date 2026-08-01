/**
 * Design-time editor context
 */
import { createContext } from 'react';
import { Project, Setters } from '@rchh/lowcode-shell';
import Logger from 'zen-logger';

interface IEditorContext {
  project?: Project;
  logger?: Logger;
  setters?: Setters | null;
}

export const EditorContext = createContext<IEditorContext>({});
