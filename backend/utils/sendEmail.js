import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, text, html }) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}