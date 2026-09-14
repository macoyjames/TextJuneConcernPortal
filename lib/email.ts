import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const FROM = process.env.EMAIL_FROM ?? "TextJune Concern Portal <onboarding@resend.dev>";

export async function sendNewTicketEmail(opts: {
  to: string;
  managerName: string;
  ticketId: string;
  vaName: string;
  severity: string;
  concernType: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email notification.");
    return;
  }

  const severityColor =
    opts.severity === "CRITICAL" || opts.severity === "HIGH" ? "#b91c1c" : "#1b4a2b";

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: `[${opts.severity}] New concern from ${opts.vaName} — TextJune Concern Portal`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <div style="background:#1b4a2b; padding:20px 24px; border-radius:8px 8px 0 0;">
            <h2 style="color:#fff; margin:0; font-size:18px;">TextJune Concern Portal</h2>
          </div>
          <div style="border:1px solid #e2e8e4; border-top:none; padding:24px; border-radius:0 0 8px 8px;">
            <p>Hi ${opts.managerName},</p>
            <p>A new concern has been submitted to your queue.</p>
            <table style="width:100%; border-collapse:collapse; margin:16px 0;">
              <tr><td style="padding:4px 0; color:#555;">Submitted by</td><td style="padding:4px 0;"><strong>${opts.vaName}</strong></td></tr>
              <tr><td style="padding:4px 0; color:#555;">Concern type</td><td style="padding:4px 0;">${opts.concernType}</td></tr>
              <tr><td style="padding:4px 0; color:#555;">Severity</td><td style="padding:4px 0;"><strong style="color:${severityColor};">${opts.severity}</strong></td></tr>
            </table>
            <a href="${APP_URL}/ticket/${opts.ticketId}"
               style="display:inline-block; background:#1b4a2b; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none; font-size:14px;">
              View concern
            </a>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send notification email:", err);
  }
}
