const PROD_API_URL = import.meta.env.VITE_API_BASE_URL_PROD
const DEV_API_URL = import.meta.env.VITE_API_BASE_URL_DEV

export const API_BASE_URL = import.meta.env.DEV ? DEV_API_URL : PROD_API_URL;