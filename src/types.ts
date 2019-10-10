
/* TYPES */

type Disposer = () => void;

type Incrementer = ( name: string, ext: string, attempt: number ) => string | Promise<string>;

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

/* EXPORT */

export {Disposer, Incrementer, Options, Result};
