export interface AssistantProfile {
  name: string;
  sex: "M" | "F";
  age: number;
  addressMode: "Tu" | "Dvs";
  avatar: string;
}

export interface AssistantProfileHistory {
  timestamp: number;
  profile: AssistantProfile;
}

export interface AssistantProfileState {
  current: AssistantProfile;
  history: AssistantProfileHistory[];
}
