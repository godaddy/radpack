export const DEFAULT_EXPIRE = process.env.RADPACK_EXPIRE
  ? Number(process.env.RADPACK_EXPIRE)
  : 3600000; // 1h
export const DEFAULT_TTS = process.env.RADPACK_TTS
  ? Number(process.env.RADPACK_TTS)
  : 300000; // 5m
export const DEFAULT_RETRIES = process.env.RADPACK_RETRIES
  ? Number(process.env.RADPACK_RETRIES)
  : 5;
