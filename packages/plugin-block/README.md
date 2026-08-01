# Block management - Block pane

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
import { plugins } from '@rchh/lowcode-engine';
import BlockPane from '@rchh/lowcode-plugin-block';

await plugins.register(BlockPane);
```
