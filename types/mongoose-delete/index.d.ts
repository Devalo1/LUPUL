declare module "mongoose-delete" {
  import mongoose from "mongoose";

  interface MongooseDeleteOptions {
    overrideMethods?: boolean | string | string[];
    deletedAt?: boolean;
    deletedBy?: boolean;
    indexFields?: boolean | string | string[];
    validateBeforeDelete?: boolean;
  }

  interface SoftDeleteModel<T extends mongoose.Document> extends mongoose.Model<T> {
    findOneDeleted(query: any): Promise<T | null>;
    restore(query: any): Promise<T>;
  }

  function mongooseDelete(schema: mongoose.Schema, options?: MongooseDeleteOptions): void;
  
  export default mongooseDelete;
}
