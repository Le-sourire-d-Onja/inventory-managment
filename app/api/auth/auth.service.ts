import bcrypt from "bcrypt";
import { signSessionToken } from "@/lib/auth";

export default class AuthService {
  /**
   * Compares the submitted password with the bcrypt hash stored in
   * `APP_PASSWORD_HASH` and returns a signed session JWT when valid.
   *
   * Next.js charge les `.env` avec `dotenv-expand` : les `$` dans un hash
   * bcrypt (`$2b$10$…`) sont interprétés comme des variables. Échappez chaque
   * `$` avec un antislash : `APP_PASSWORD_HASH=\$2b\$10\$...`
   */
  static async login(
    password: string,
  ): Promise<{ ok: true; token: string } | { ok: false }> {
    const raw = process.env.APP_PASSWORD_HASH?.trim();
    if (!raw) {
      console.error("APP_PASSWORD_HASH is not set");
      return { ok: false };
    }
    const valid = await bcrypt.compare(password, raw);
    if (!valid) {
      return { ok: false };
    }
    const token = await signSessionToken();
    return { ok: true, token };
  }
}
