import { OnDestroy, OnInit } from "@maltyxx/zenject";
import { injectable } from "tsyringe";

/**
 * Service for ${SERVICE_NAME} operations
 */
@injectable()
export class ${CLASS_NAME} implements OnInit, OnDestroy {
  constructor() 

  /**
   * Lifecycle hook called after instantiation
   */
  async onInit(): Promise<void> 
    console.log('${CLASS_NAME} initialized');

  /**
   * Lifecycle hook called before destruction
   */
  async onDestroy(): Promise<void> 
    console.log('${CLASS_NAME} destroyed');

  /**
   * Example method
   * @returns A sample result
   */
  getSampleData(): string 
    return '${SERVICE_NAME} data';
} 