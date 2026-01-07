/// <reference types="vite/client" />

// Augment NodeJS namespace to strictly type process.env.API_KEY 
// without redeclaring the global process variable which causes conflicts with @types/node.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
