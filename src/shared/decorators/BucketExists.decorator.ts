import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

import { SupabaseService } from '../supabase.service';



@ValidatorConstraint({ name: 'bucketExists', async: true })
export class BucketExistsConstraint implements ValidatorConstraintInterface {
    constructor(private readonly supabase : SupabaseService){}

  async validate(bucketName: string, args: ValidationArguments): Promise<boolean> {
   

    if (!this.supabase) {
      throw new Error('SupabaseService not injected in BucketExistsConstraint');
    }
    
    return await this.supabase.bucketExists(bucketName);
  }

  defaultMessage(args: ValidationArguments): string {
    return `Bucket '${args.value}' does not exist`;
  }
}

export function BucketExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BucketExistsConstraint,
    });
  };
}
