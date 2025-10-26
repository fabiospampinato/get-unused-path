
/* MAIN */

const incrementer = ( name: string, ext: string, attempt: number ): string => {

  name = name.replace ( /\s+\(\d+\)$/, '' ); // Removing already existent suffix

  const suffix = attempt > 1 ? ` (${attempt})` : '';

  name = name.slice ( 0, 128 - ext.length - suffix.length ); // Trimming excess characters, ensuring the suffix won't be trimmed later

  return `${name}${suffix}${ext}`;

};

/* EXPORT */

export {incrementer};
