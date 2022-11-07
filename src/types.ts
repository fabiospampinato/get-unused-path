
/* MAIN */

type Disposer = () => void;

type Incrementer = ( name: string, ext: string, attempt: number ) => string | Promise<string>;

type Options = {
  maxAttempts?: number, // Maximum number of attempts to make before throwing
  countFilesystemAttemptsOnly?: boolean, // Whether to count as attempts only checks that hit the filesystem, ignoring quick checks performed by the library when it knows already that a path is used because it hasn't been disposed of yet
  disposeDelay?: number, // Milliseconds to delay disposals by
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

export type {Disposer, Incrementer, Options, Result};
