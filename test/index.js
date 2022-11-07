
/* IMPORT */

import {describe} from 'fava';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import getUnusedPath from '../dist/index.js';

/* HELPERS */

const withTemp = async fn => {

  const TEMP = path.join ( os.tmpdir (), `get-unused-path-${randomUUID ()}` );

  try {

    fs.mkdirSync ( TEMP );

    await fn ( TEMP );

  } finally {

    fs.rmSync ( TEMP, { recursive: true } );

  }

};

/* MAIN */

describe ( 'getUnusedPath', it => {

  it ( 'returns an unused file path', t => {

    return withTemp ( async TEMP => {

      const filePathUnused = path.join ( TEMP, 'foo.txt' );
      const result = await getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt' });

      t.is ( typeof result.dispose, 'function' );
      t.is ( result.folderPath, TEMP );
      t.is ( result.filePath, filePathUnused );
      t.is ( result.fileName, 'foo.txt' );

    });

  });

  it ( 'returns an incremented unused file path', t => {

    return withTemp ( async TEMP => {

      const filePathUsed = path.join ( TEMP, 'foo.txt' );
      const filePathUnused = path.join ( TEMP, 'foo (2).txt' );

      fs.writeFileSync ( filePathUsed, '' );

      const result = await getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt' });

      t.is ( result.filePath, filePathUnused );

    });

  });

  it ( 'removes increments during the first attempt', t => {

    return withTemp ( async TEMP => {

      const filePathUnused = path.join ( TEMP, 'foo.txt' );
      const result = await getUnusedPath ({ folderPath: TEMP, fileName: 'foo (123).txt' });

      t.is ( result.filePath, filePathUnused );

    });

  });

  it ( 'trims properly paths that are too long', t => {

    return withTemp ( async TEMP => {

      const filePathUsed = path.join ( TEMP, '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000.txt' );
      const filePathUnused = path.join ( TEMP, '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 (2).txt' );

      fs.writeFileSync ( filePathUsed, '' );

      const result = await getUnusedPath ({ folderPath: TEMP, fileName: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000.txt' });

      t.is ( result.filePath, filePathUnused );

    });

  });

  it ( 'requires the disposer to be called before returning the same file path again', t => {

    return withTemp ( async TEMP => {

      const filePathUnused1 = path.join ( TEMP, 'foo.txt' );
      const filePathUnused2 = path.join ( TEMP, 'foo (2).txt' );
      const filePathUnused3 = filePathUnused1;

      const result1 = await getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt' });

      t.is ( result1.filePath, filePathUnused1 );

      const result2 = await getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt' });

      t.is ( result2.filePath, filePathUnused2 );

      result1.dispose ();

      const result3 = await getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt' });

      t.is ( result3.filePath, filePathUnused3 );

    });

  });

  it ( 'supports a custom incrementer', t => {

    return withTemp ( async TEMP => {

      const filePathUnused = path.join ( TEMP, 'foo-1.txt' );
      const result = await getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt', incrementer: ( name, ext, i ) => `${name}-${i}${ext}` });

      t.is ( result.filePath, filePathUnused );

    });

  });

  it ( 'supports a custom asynchronous incrementer', t => {

    return withTemp ( async TEMP => {

      const filePathUnused = path.join ( TEMP, 'foo-1.txt' );
      const result = await getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt', incrementer: ( name, ext, i ) => Promise.resolve ( `${name}-${i}${ext}` ) });

      t.is ( result.filePath, filePathUnused );

    });

  });

  it ( 'defaults to the process cwd', t => {

    return withTemp ( async TEMP => {

      const filePathUnused = path.join ( process.cwd (), 'foo.txt' );
      const result = await getUnusedPath ({ fileName: 'foo.txt' });

      t.is ( result.filePath, filePathUnused );

    });

  });

  it ( 'supports a disposition delay', t => {

    return withTemp ( async TEMP => {

      const filePathUnused1 = path.join ( TEMP, 'foo.txt' );
      const filePathUnused2 = path.join ( TEMP, 'foo (2).txt' );

      const result1 = await getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt' });

      t.is ( result1.filePath, filePathUnused1 );

      result1.dispose ();

      const result2 = await getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt', disposeDelay: 1000 });

      t.is ( result2.filePath, filePathUnused1 );

      result2.dispose ();

      const result3 = await getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt' });

      t.is ( result3.filePath, filePathUnused2 );

      result3.dispose ();

      await delay ( 2000 );

      const result4 = await getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt' });

      t.is ( result4.filePath, filePathUnused1 );

    });

  });

  it ( 'can ignore attempts that do not hit the filesystem', t => {

    return withTemp ( async TEMP => {

      await getUnusedPath ({ folderPath: TEMP, fileName: 'attempt.txt', maxAttempts: 1 });

      await getUnusedPath ({ folderPath: TEMP, fileName: 'attempt.txt', maxAttempts: 1, countFilesystemAttemptsOnly: true });

      t.pass ();

    });

  });

  it ( 'throws after maxAttempts attempts', t => {

    return withTemp ( async TEMP => {

      await getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt' });

      await t.throwsAsync ( () => {

        return getUnusedPath ({ folderPath: TEMP, fileName: 'foo.txt', incrementer: () => 'foo.txt' });

      }, /The maximum number of attempts has been reached/ );

    });

  });

});
