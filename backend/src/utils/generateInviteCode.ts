import { randomBytes } from "crypto";
import { prisma } from "../lib/prisma";

const INVITE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(length = 10): string {
  const safeLength = Math.min(Math.max(length, 8), 12);
  const bytes = randomBytes(safeLength);
  let code = "";

  for (let i = 0; i < safeLength; i += 1) {
    code += INVITE_CHARS[bytes[i] % INVITE_CHARS.length];
  }

  return code;
}

export async function createUniqueInviteCode(length = 10): Promise<string> {
  let code = generateInviteCode(length);

  while (await prisma.room.findUnique({ where: { inviteCode: code } })) {
    code = generateInviteCode(length);
  }

  return code;
}
