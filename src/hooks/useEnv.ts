// check the current env is dev or prd or test using process.env.NODE_ENV
export function useEnv() {
  const env = process.env.NODE_ENV || 'production'
  return { env }
}
