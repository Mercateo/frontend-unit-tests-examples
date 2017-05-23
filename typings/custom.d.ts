// declare function require(module: string): any;
declare const require: {
  (module: string): any;
  context(directory: string, useSubdirectories: boolean, regExp: RegExp): any;
}

declare module 'injectable-loader?*';

// declare function require: require;
