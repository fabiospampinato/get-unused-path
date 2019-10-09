
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
        incrementer = options.incrementer ?? Utils.incrementer,
        folderPath = options.folderPath ?? process.cwd ();

  const {name, ext} = path.parse ( options.fileName );

  return new Promise ( ( resolve, reject ) => {

    function attempt ( nr: number = 1 ) {

      if ( nr > maxAttempts ) return reject ( new Error ( 'The maximum number of attempts has been reached' ) );

      const fileName = sanitize ( incrementer ( name, ext, nr ) ),
            filePath = path.join ( folderPath, fileName );

      if ( Blacklist.has ( filePath ) ) return attempt ( nr + 1 );

      fs.access ( filePath, fs.constants.F_OK, err => {

        if ( !err ) return attempt ( nr + 1 );

        Blacklist.add ( filePath );

        const dispose = () => Blacklist.remove ( filePath );

        resolve ({ dispose, folderPath, filePath, fileName });

      });

    }

    attempt ();

  });

}

/* EXPORT */

export default getUnusedPath;
