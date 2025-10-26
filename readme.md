# Get Unused Path

Reliably get an unused path you can write to.

## Features

- It attempts to find an unused file path (e.g. `/x/foo.txt`), incrementing the file name until an unused file path is found (e.g. `/x/foo (2).txt`).
- It's roboust against race conditions since it returns a "disposer" alongside each file path returned, until you call it the same file path won't be returned again.
- It throws after a configurable amount of attempts, avoiding any potential endless loops.
- The incrementer function is configurable.

## Install

```sh
npm install get-unused-path
```

## Usage

The following interface is provided:

```ts
type Disposer = () => void;

type Incrementer = ( name: string, ext: string, attempt: number ) => string;

type Options = {
  fileName: string, // Initial file name
  folderPath?: string, // Folder path where to look for unused path
  incrementer?: Incrementer, // Function that increments the file name during each attempt
  maxAttempts?: number // Maximum number of attempts to make before throwing
};

type Result = {
  dispose: Disposer,
  folderPath: string,
  filePath: string,
  fileName: string
};

function getUnusedPath ( options: Options ): Promise<Result>;
```

You can use the library like so:

```ts
import fs from 'node:fs';
import getUnusedPath from 'get-unused-path';

// Let's get an unused path

const result = await getUnusedPath ({
  fileName: 'foo.txt',
  folderPath: '/x/y/z',
  // incrementer: ( name, ext, attempt ) => attempt > 1 ? `${name}-${attempt}${ext}` : `${name}${ext}`,
  // maxTries: 1_000
});

result.dispose; // => () => void
result.folderPath; // => '/x/y/z'
result.filePath; // => '/x/y/z/foo (3).txt'
result.fileName; // => 'foo (3).txt'

// Let's now write to that path

await fs.promises.writeFile ( result.filePath, '...' );

// Let's now release our lock on this file name
// We have used the file path by now, so we need to dispose of our "lock" on it, allowing it to be returned again in the future, potentially

result.dispose ();
```

## Related

- [unused-path](https://github.com/fabiospampinato/unused-path): Reliably get an unused path and copy/move/write to it.
- [copy-unused-path](https://github.com/fabiospampinato/copy-unused-path): Reliably copy to an unused path.
- [move-unused-path](https://github.com/fabiospampinato/move-unused-path): Reliably move to an unused path.
- [write-unused-path](https://github.com/fabiospampinato/write-unused-path): Reliably write to an unused path.

## License

MIT © Fabio Spampinato
