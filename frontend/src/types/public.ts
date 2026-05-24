export interface PublicConfig {
  betaMode: boolean;
  betaAccessRequired: boolean;
}

export interface BetaAccessCode {
  id: string;
  code: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export interface AdminBetaCodesResponse {
  codes: BetaAccessCode[];
}

export interface CreateBetaCodeInput {
  code: string;
  maxUses?: number;
  expiresAt?: string | null;
}

export interface CreateBetaCodeResponse {
  message: string;
  code: BetaAccessCode;
}
