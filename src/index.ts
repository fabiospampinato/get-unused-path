
/* IMPORT */

import * as fs from 'fs';
import * as path from 'path';
import sanitize from 'sanitize-basename';
import {Options, Result} from './types';
import Blacklist from './blacklist';
import Utils from './utils';

/* GET UNUSED PATH */

function getUnusedPath ( options: Options ): Promise<Result> {

  const maxAttempts = options.maxAttempts ?? 128,
        countFilesystemAttemptsOnly = options.countFilesystemAttemptsOnly ?? false,
        disposeDelay = options.disposeDelay ?? 0,
        incrementer = options.incrementer ?? Utils.incrementer,
        folderPath = options.folderPath ?? process.cwd ();

  const {name, ext} = path.parse ( sanitize ( options.fileName ) );

  return new Promise ( ( resolve, reject ) => {

    function attempt ( nr: number, maxAttempts: number ) {

      if ( nr > maxAttempts ) return reject ( new Error ( 'The maximum number of attempts has been reached' ) );

      const increment = Promise.resolve ( incrementer ( name, ext, nr ) );

      increment.then ( increment => {

        const fileName = sanitize ( increment ),
              filePath = path.join ( folderPath, fileName );

        if ( Blacklist.has ( filePath ) ) return attempt ( nr + 1, maxAttempts + ( countFilesystemAttemptsOnly ? 1 : 0 ) );

        fs.access ( filePath, fs.constants.F_OK, err => {

          if ( !err ) return attempt ( nr + 1, maxAttempts );

          Blacklist.add ( filePath );

          const disposeNow = () => Blacklist.remove ( filePath );

          const dispose = () => {

            if ( !disposeDelay ) return disposeNow ();

            setTimeout ( disposeNow, disposeDelay );

          };

          resolve ({ dispose, folderPath, filePath, fileName });

        });

      });

    }

    attempt ( 1, maxAttempts );

  });

}

getUnusedPath.blacklist = Blacklist;

/* EXPORT */

export default getUnusedPath;
