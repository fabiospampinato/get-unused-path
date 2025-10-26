
/* MAIN */

type Disposer = () => void;

type Incrementer = ( name: string, ext: string, attempt: number ) => Promise<string> | string;

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

/* EXPORT */

export type {Disposer, Incrementer, Options, Result};
