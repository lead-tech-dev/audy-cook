import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private logger = new Logger('EmailService');
  private client: Resend | null = null;

  private get sender(): string {
    const name = process.env.SENDER_NAME || 'AUDY COOK';
    const addr = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
    return `${name} <${addr}>`;
  }

  private getClient(): Resend | null {
    const key = process.env.RESEND_API_KEY;
    if (!key || key.startsWith('re_placeholder')) return null;
    if (!this.client) this.client = new Resend(key);
    return this.client;
  }

  /**
   * Fire-and-forget send. Logs errors instead of throwing so it never blocks the caller flow.
   */
  send(args: SendArgs): void {
    const client = this.getClient();
    if (!client) {
      this.logger.warn(`Email NOT sent (no RESEND_API_KEY): "${args.subject}" → ${args.to}`);
      return;
    }
    void (async () => {
      try {
        const res = await client.emails.send({
          from: this.sender,
          to: [args.to],
          subject: args.subject,
          html: args.html,
        });
        this.logger.log(`Email sent → ${args.to} · id=${(res as any)?.data?.id || (res as any)?.id || 'unknown'}`);
      } catch (e: any) {
        this.logger.error(`Email FAILED → ${args.to}: ${e?.message || e}`);
      }
    })();
  }
}
