const { env: loadEnv } = require('custom-env');
const z = require('zod');

// APPLICATION STAGE
process.env.APP_STAGE = process.env.APP_STAGE || "development";
const isProduction = process.env.APP_STAGE === "production";
const isDevelopment = process.env.APP_STAGE === "development";
const isTest = process.env.APP_STAGE === "test";

// LOAD .ENV FILE BASED ON APPLICATION STAGE
if (isDevelopment) {
    loadEnv(); // LOAD .env
} else if (isTest) {
    loadEnv('test') // LAOD .env.test
}

// ENVOIRMENT SCHEMA
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_STAGE: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().positive(),
    DATABASE: z.string(),
    DATABASE_PASSWORD: z.string().min(8),
    
    SECRET_KEY: z.string().min(32),
    EXPIRES_IN: z.string(),
    COOKIE_EXPIRES_IN: z.coerce.number().positive(),
    
    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.coerce.number().positive(),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
    
    });

// VALIDATION FOR ENVOIRMENT VARIABLE
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n Invalid environment variables:\n');

  const { fieldErrors } = parsed.error.flatten();

  Object.entries(fieldErrors).forEach(([key, messages]) => {
    console.error(`• ${key}: ${messages.join(', ')}`);
  });

  process.exit(1);
}

let env = parsed.data;

// HELPER FUNC FOR NODE ENV
const isProd = () => env.NODE_ENV === "production";
const isDev = () => env.NODE_ENV === "development";
const isTesting = () => env.NODE_ENV === "test";

// EXPORT
module.exports = { env, isProd, isDev, isTesting };