# Block management - Save as block

## Block entity

```

interface Block {
  name: string;
  title: string;
  schema: string;
  screenshot: string;
  created_at?: string;
  updated_at?: string;
}

```

## Note

Before using block management you must register the corresponding APIs in the engine config:

```

interface BlockAPI {
  listBlocks: () => Block[];
  createBlock: (Block) => any;
}

function setupConfig() {
  config.set('apiList', {
    block: {
      listBlocks,
      createBlock
    },
  })
}
```

# Usage

```
import { material } from '@rchh/lowcode-engine';
import { default as saveAsBlock } from '@rchh/action-block';

material.addBuiltinComponentAction(saveAsBlock);
```
