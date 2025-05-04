import { Module } from "@maltyxx/zenject";

/**
 * Module for ${MODULE_NAME}-related functionality.
 */
@Module({
  imports: [],
  providers: [],
  exports: []
})
export class ${CLASS_NAME} {
  /**
   * Create a dynamically configured module.
   * @param options Configuration options
   * @returns A configured module
   */
  static forRoot(options: Record<string, unknown>) 
    return {
      module: ${CLASS_NAME},
      providers: [provide: '${MODULE_NAME.toUpperCase()}_OPTIONS', useValue: options 
      ];
  }
} 