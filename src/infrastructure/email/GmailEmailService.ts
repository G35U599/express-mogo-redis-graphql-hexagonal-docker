import nodemailer from "nodemailer";
import {
  IEmailService,
  PasswordResetEmailInput,
} from "../../application/ports/IEmailService";

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

if (!gmailUser) {
  throw new Error("La variable de entorno GMAIL_USER es obligatoria");
}

if (!gmailAppPassword) {
  throw new Error("La variable de entorno GMAIL_APP_PASSWORD es obligatoria");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailAppPassword,
  },
});

export class GmailEmailService implements IEmailService {
  async sendPasswordResetEmail({
    to,
    name,
    resetUrl,
  }: PasswordResetEmailInput): Promise<void> {
    await transporter.sendMail({
      from: gmailUser,
      to,
      subject: "Recuperación de contraseña",
      text: `Hola ${name}. Recibimos una solicitud para restablecer tu contraseña. Usá este enlace: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Recuperación de contraseña</h2>
          <p>Hola ${name},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>
            Hacé clic en este enlace para continuar:
            <a href="${resetUrl}">${resetUrl}</a>
          </p>
          <p>Este enlace expira en 1 hora.</p>
          <p>Si vos no pediste este cambio, podés ignorar este correo.</p>
        </div>
      `,
    });
  }
}
