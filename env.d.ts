interface EnvironmentVariables {
  readonly NODE_ENV: 'development' | 'production' | 'test'
  readonly PORT: string
}

declare namespace NodeJS {
  interface ProcessEnv extends EnvironmentVariables {}
}
