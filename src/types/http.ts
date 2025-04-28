// This file provides type definitions to replace Express dependencies in frontend code
export interface HttpRequest {
  body?: any;
  query?: any;
  params?: any;
  headers?: Record<string, string | string[] | undefined>;
  user?: any;
}

export interface HttpResponse {
  status: (code: number) => HttpResponse;
  json: (data: any) => void;
  send: (data: any) => void;
  end: () => void;
}

export interface NextFunction {
  (error?: any): void;
}

// Type for middleware functions
export type Middleware = (req: HttpRequest, res: HttpResponse, next: NextFunction) => void | Promise<void>;

// Type for controller functions
export type Controller = (req: HttpRequest, res: HttpResponse) => void | Promise<void>;