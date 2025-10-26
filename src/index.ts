
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sanitize from 'sanitize-basename';
import * as Utils from './utils';
import type {Options, Result} from './types';

/* HELPERS */

const blacklist = new Set<string> ();

/* MAIN */

const getUnusedPath = ( options: Options ): Promise<Result> => {

  const fileName = options.fileName;
  const folderPath = options.folderPath ?? process.cwd ();
  const incrementer = options.incrementer ?? Utils.incrementer;
  const maxAttempts = options.maxAttempts ?? 256;

  const {name, ext} = path.parse ( sanitize ( fileName ) );

  return new Promise<Result> ( async ( resolve, reject ) => {

    let attemptNr = 0;

    while ( true ) {

      attemptNr += 1;

      if ( attemptNr > maxAttempts ) return reject ( new Error ( 'The maximum number of attempts has been reached' ) );

      const fileNameIncremented = await incrementer ( name, ext, attemptNr );
      const fileName = sanitize ( fileNameIncremented );
      const filePath = path.join ( folderPath, fileName );

      if ( blacklist.has ( filePath ) ) continue;

      try {

        await fs.promises.access ( filePath, fs.constants.F_OK );

        continue;

      } catch {

        const reserve = () => blacklist.add ( filePath );
        const dispose = () => blacklist.delete ( filePath );
        const result = { dispose, folderPath, filePath, fileName };

        reserve ();
        resolve ( result );

        break;

      }

    }

  });

};

/* EXPORT */

export default getUnusedPath;
export type {Options, Result};
