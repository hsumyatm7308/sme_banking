export interface UserData {
  id: number;
  phone?: string;
  business_name: string;
  owner_name: string;
  sector?: string;
  role: string;
}

export interface BankStats {
  total_smes: number;
  active_smes: number;
  high_risk_smes: number;
  total_volume: number;
}

export interface ApiErrorResponse {
  detail?: string;
}

export function getStoredUser(): UserData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const userData = localStorage.getItem("user");
  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData) as UserData;
  } catch {
    return null;
  }
}
