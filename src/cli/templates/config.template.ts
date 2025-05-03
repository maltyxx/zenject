/**
 * Application configuration object
 */
export const appConfig = {
  /**
   * Application environment
   */
  environment: process.env.NODE_ENV || 'development',
  
  /**
   * Application port
   */
  port: parseInt(process.env.${APP_NAME}_PORT || '3000', 10),
  
  /**
   * Application host
   */
  host: process.env.${APP_NAME}_HOST || '0.0.0.0',
  
  /**
   * Application logging level
   */
  logLevel: process.env.${APP_NAME}_LOG_LEVEL || 'info',
  
  /**
   * Debug mode
   */
  debug: process.env.${APP_NAME}_DEBUG === 'true'
}; 