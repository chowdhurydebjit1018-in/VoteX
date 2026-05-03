export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  age?: number;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  registrationStatus: "unregistered" | "registered" | "unknown";
  constituency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  order: number;
}

export interface VotingJourney {
  id: string;
  userId: string;
  steps: JourneyStep[];
  createdAt: string;
}

export interface ElectionDeadline {
  id: string;
  title: string;
  date: string;
  description: string;
  constituency?: string;
  type: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
