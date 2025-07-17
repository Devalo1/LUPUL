/// <reference types="@emotion/react/types/css-prop" />
import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme {}
}

// Fix pentru problema TDZ cu Emotion
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      css?:
        | import("@emotion/react").SerializedStyles
        | import("@emotion/react").CSSObject;
    }
  }
}
