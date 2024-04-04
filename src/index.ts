
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sanitize from 'sanitize-basename';
import Utils from './utils';
import type {Options, Result} from './types';

/* HELPERS */

const blacklist = new Set<string> ();

/* MAIN */

const getUnusedPath = ( options: Options ): Promise<Result> => {

  const maxAttempts = options.maxAttempts ?? 128;
  const countFilesystemAttemptsOnly = options.countFilesystemAttemptsOnly ?? false;
  const disposeDelay = options.disposeDelay ?? 0;
  const incrementer = options.incrementer ?? Utils.incrementer;
  const folderPath = options.folderPath ?? process.cwd ();

  const {name, ext} = path.parse ( sanitize ( options.fileName ) );

  return new Promise<Result> ( ( resolve, reject ) => {

    const attempt = async ( nr: number, maxAttempts: number ): Promise<void> => {

      if ( nr > maxAttempts ) return reject ( new Error ( 'The maximum number of attempts has been reached' ) );

      const increment = await incrementer ( name, ext, nr );
      const fileName = sanitize ( increment );
      const filePath = path.join ( folderPath, fileName );

      if ( blacklist.has ( filePath ) ) return attempt ( nr + 1, maxAttempts + ( countFilesystemAttemptsOnly ? 1 : 0 ) );

      try {

        await fs.promises.access ( filePath, fs.constants.F_OK );

        attempt ( nr + 1, maxAttempts );

      } catch {

        blacklist.add ( filePath );

        const dispose = (): void => {

          const dispose = () => blacklist.delete ( filePath );

          if ( disposeDelay ) {

            setTimeout ( dispose, disposeDelay );

          } else {

            dispose ();

          }

        };

        resolve ({ dispose, folderPath, filePath, fileName });

      }

    };

    attempt ( 1, maxAttempts );

  });

};

/* EXPORT */

export default getUnusedPath;
export type {Options, Result};
