import { createContext } from "react";
import {
  AssistantProfile,
  AssistantProfileState,
} from "../models/AssistantProfile";

export const AssistantProfileContext = createContext<
  | {
      profileState: AssistantProfileState;
      updateProfile: (profile: AssistantProfile) => void;
    }
  | undefined
>(undefined);
