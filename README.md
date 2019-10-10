# Get Unused Path

Reliably get an unused path you can write to.

## Features

- It attempts to find an unused file path (e.g. `/x/foo.txt`), incrementing the file name until an unused file path is found (e.g. `/x/foo (2).txt`).
- It's roboust against race conditions since it returns a "disposer" alongside each file path returned, until you call it the same file path won't be returned again.
- It throws after a configurable amount of attempts, avoiding any potential endless loops.
- The incrementer function is configurable.

## Install

```sh
npm install --save get-unused-path
```

## Usage

The following interface is provided:

```ts
type Disposer = () => void;

type Incrementer = ( name: string, ext: string, attempt: number ) => string;

type Options = {
  maxAttempts?: number, // Maximum number of attempts to make before throwing
  incrementer?: Incrementer, // Function that increments the file name during each attempt
  folderPath?: string, // Folder path where to look for unused path
  fileName: string // Initial file name
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
import * as fs from 'fs';
import getUnusedPath from 'get-unused-path';

async function example () {

  const {disposer, folderPath, filePath, fileName} = await getUnusedPath ({
    folderPath: '/x/y/z',
    fileName: 'foo.txt',
    // maxTries: 1000,
    // incrementer: ( name, ext, attempt ) => attempt > 1 ? `${name}-${attempt}${ext}` : `${name}${ext}`
  });

  console.log ( disposer ); // => Function
  console.log ( folderPath ); // => '/x/y/z'
  console.log ( filePath ); // => '/x/y/z/foo (3).txt'
  console.log ( fileName ); // => 'foo (3).txt'

  await fs.promises.writeFile ( filePath, '...' );

  disposer (); // We would have used the file path by now, so we can dispose of our "lock" on it, allowing it to be returned again in the future

}

example ();
```

## Related

- [write-unused-path](https://github.com/fabiospampinato/write-unused-path): Reliably write to an unused path.
- [copy-unused-path](https://github.com/fabiospampinato/copy-unused-path): Reliably copy to an unused path.
- [move-unused-path](https://github.com/fabiospampinato/move-unused-path): Reliably move to an unused path.

## License

MIT © Fabio Spampinato
