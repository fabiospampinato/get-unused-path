
/* UTILS */

const Utils = {

  incrementer ( name: string, ext: string, attempt: number ): string {

    name = name.replace ( / \(\d+\)$/, '' ); // Removing already existent suffix

    const suffix = attempt > 1 ? ` (${attempt})` : '';

    return `${name}${suffix}${ext}`;

  }

};

/* EXPORT */

export default Utils;
