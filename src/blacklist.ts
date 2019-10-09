
/* BLACKLIST */

const Blacklist = {

  paths: {} as Record<string, boolean>,

  add ( path: string ): void {

    Blacklist.paths[path] = true;

  },

  remove ( path: string ): void {

    delete Blacklist.paths[path];

  },

  has ( path: string ): boolean {

    return path in Blacklist.paths;

  }

};

/* EXPORT */

export default Blacklist;
