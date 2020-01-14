
/* IMPORT */

import * as _ from 'lodash';
import {describe} from 'ava-spec';
import * as fs from 'fs';
import * as path from 'path';
import promiseResolve from 'promise-resolve-timeout';
import {default as getUnusedPath} from '../dist';

/* HELPERS */

const DIST = path.join ( __dirname, 'dist' );

/* GET UNUSED PATH */

describe ( 'getUnusedPath', it => {

  it.before ( () => {

    _.attempt ( fs.unlinkSync, DIST );
    _.attempt ( fs.mkdirSync, DIST );

  });

  it.after ( () => {

    _.attempt ( fs.unlinkSync, DIST );

  });

  it.serial ( 'returns an unused file path', async t => {

    const filePathUnused = path.join ( DIST, 'foo.txt' ),
          result = await getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt' });

    t.is ( typeof result.dispose, 'function' );
    t.is ( result.folderPath, DIST );
    t.is ( result.filePath, filePathUnused );
    t.is ( result.fileName, 'foo.txt' );

    result.dispose ();

  });

  it.serial ( 'returns an incremented unused file path', async t => {

    const filePathUsed = path.join ( DIST, 'foo.txt' ),
          filePathUnused = path.join ( DIST, 'foo (2).txt' );

    fs.writeFileSync ( filePathUsed );

    const result = await getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt' });

    t.is ( result.filePath, filePathUnused );

    fs.unlinkSync ( filePathUsed );

    result.dispose ();

  });

  it.serial ( 'removes increments during the first attempt', async t => {

    const filePathUnused = path.join ( DIST, 'foo.txt' ),
          result = await getUnusedPath ({ folderPath: DIST, fileName: 'foo (123).txt' });

    t.is ( result.filePath, filePathUnused );

    result.dispose ();

  });

  it.serial ( 'requires the disposer to be called before returning the same file path again', async t => {

    const filePathUnused1 = path.join ( DIST, 'foo.txt' ),
          filePathUnused2 = path.join ( DIST, 'foo (2).txt' ),
          filePathUnused3 = filePathUnused1;

    const result1 = await getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt' });

    t.is ( result1.filePath, filePathUnused1 );

    const result2 = await getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt' });

    t.is ( result2.filePath, filePathUnused2 );

    result1.dispose ();

    const result3 = await getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt' });

    t.is ( result3.filePath, filePathUnused3 );

    result1.dispose ();
    result2.dispose ();
    result3.dispose ();

  });

  it.serial ( 'supports a custom incrementer', async t => {

    const filePathUnused = path.join ( DIST, 'foo-1.txt' ),
          result = await getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt', incrementer: ( name, ext, i ) => `${name}-${i}${ext}` });

    t.is ( result.filePath, filePathUnused );

    result.dispose ();

  });

  it.serial ( 'supports a custom asynchronous incrementer', async t => {

    const filePathUnused = path.join ( DIST, 'foo-1.txt' ),
          result = await getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt', incrementer: ( name, ext, i ) => Promise.resolve ( `${name}-${i}${ext}` ) });

    t.is ( result.filePath, filePathUnused );

    result.dispose ();

  });

  it.serial ( 'defaults to the process cwd', async t => {

    const filePathUnused = path.join ( process.cwd (), 'foo.txt' ),
          result = await getUnusedPath ({ fileName: 'foo.txt' });

    t.is ( result.filePath, filePathUnused );

    result.dispose ();

  });

  it.serial ( 'supports a disposition delay', async t => {

    const filePathUnused1 = path.join ( DIST, 'foo.txt' ),
          filePathUnused2 = path.join ( DIST, 'foo (2).txt' );

    const result1 = await getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt' });

    t.is ( result1.filePath, filePathUnused1 );

    result1.dispose ();

    const result2 = await getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt', disposeDelay: 1000 });

    t.is ( result2.filePath, filePathUnused1 );

    result2.dispose ();

    const result3 = await getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt' });

    t.is ( result3.filePath, filePathUnused2 );

    result3.dispose ();

    await promiseResolve ( 2000 );

    const result4 = await getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt' });

    t.is ( result4.filePath, filePathUnused1 );

  });

  it.serial ( 'throws after maxAttempts attempts', async t => {

    await getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt' });

    await t.throwsAsync ( () => {
      return getUnusedPath ({ folderPath: DIST, fileName: 'foo.txt', incrementer: () => 'foo.txt' });
    }, /The maximum number of attempts has been reached/ );

  });

});
