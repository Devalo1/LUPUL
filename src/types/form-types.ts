export interface FormDataType extends EventTarget {
  name: string;
  value: string;
  type?: string;
  checked?: boolean;
}
