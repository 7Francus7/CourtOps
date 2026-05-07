import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'CourtOps <onboarding@resend.dev>';

export const sendWelcomeEmail = async (email: string, userName: string, clubName: string) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email simulation:', { email, userName, clubName });
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      replyTo: 'courtops.saas@gmail.com',
      to: [email],
      subject: `Bienvenido a CourtOps, ${userName}!`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #030712; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">

          <!-- Header -->
          <div style="background-color: #020617; padding: 40px 20px; text-align: center; border-bottom: 1px solid #1e293b;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">
              COURT<span style="color: #10b981;">OPS</span>
            </h1>
            <p style="color: #94a3b8; font-size: 16px; margin-top: 10px;">El sistema operativo de tu club</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #ffffff; font-size: 24px; margin-top: 0; margin-bottom: 20px;">Hola ${userName}!</h2>
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Estamos encantados de darte la bienvenida a la plataforma que llevara la gestion de <strong>${clubName}</strong> al siguiente nivel. Tu cuenta ha sido creada exitosamente y ya puedes acceder a todas las herramientas premium que disenamos para ti.
            </p>

            <div style="background: linear-gradient(145deg, rgba(16,185,129,0.1) 0%, rgba(3,7,18,0) 100%); border: 1px solid rgba(16,185,129,0.2); padding: 24px; border-radius: 12px; margin: 32px 0;">
              <h3 style="color: #10b981; margin-top: 0; margin-bottom: 16px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Siguientes Pasos Rapidos</h3>
              <ul style="color: #cbd5e1; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Configura tus <strong>canchas y horarios</strong> de atencion.</li>
                <li style="margin-bottom: 8px;">Define tus tarifas en <strong>Reglas de Precios</strong>.</li>
                <li style="margin-bottom: 0px;">Comparte tu <strong>link publico</strong> para recibir reservas online 24/7.</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://courtops.vercel.app'}/dashboard" style="display: inline-block; background-color: #10b981; color: #000000; padding: 16px 32px; text-decoration: none; border-radius: 30px; font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                Ir a mi Dashboard
              </a>
            </div>

            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-top: 30px; text-align: center;">
              Tienes alguna duda iniciando? Escribenos directamente por <a href="https://wa.me/5493524421497" style="color: #10b981; text-decoration: none; font-weight: bold;">WhatsApp al +54 9 3524 42-1497</a> y te ayudaremos en minutos.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #020617; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} CourtOps. Todos los derechos reservados.<br>
              Disenado para profesionalizar el deporte.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Exception sending email:', err);
    return { success: false, error: err };
  }
};

export const sendPasswordResetEmail = async (email: string, token: string, userName: string) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Password reset simulation:', { email, token });
    return { success: true, simulated: true };
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://courtops.net'}/forgot-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      replyTo: 'courtops.saas@gmail.com',
      to: [email],
      subject: 'Restablecer tu contrasena - CourtOps',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #030712; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
          <div style="background-color: #020617; padding: 40px 20px; text-align: center; border-bottom: 1px solid #1e293b;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">
              COURT<span style="color: #10b981;">OPS</span>
            </h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #ffffff; font-size: 24px; margin-top: 0; margin-bottom: 20px;">Hola ${userName},</h2>
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Recibimos una solicitud para restablecer tu contrasena. Hace clic en el boton de abajo para crear una nueva.
            </p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #000000; padding: 16px 32px; text-decoration: none; border-radius: 30px; font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                Restablecer Contrasena
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center;">
              Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este email.
            </p>
          </div>
          <div style="background-color: #020617; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} CourtOps. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Exception sending password reset email:', err);
    return { success: false, error: err };
  }
};

export const sendBookingReminderEmail = async (
  email: string,
  clientName: string,
  bookingDate: string,
  bookingTime: string,
  courtName: string,
  clubName: string,
  clubPhone?: string | null,
  balance?: number
) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Reminder simulation:', { email, clientName, bookingDate });
    return { success: true, simulated: true };
  }

  try {
    const balanceSection = balance && balance > 0 ? `
      <div style="background: linear-gradient(145deg, rgba(245,158,11,0.1) 0%, rgba(3,7,18,0) 100%); border: 1px solid rgba(245,158,11,0.2); padding: 16px 20px; border-radius: 12px; margin: 24px 0;">
        <p style="color: #f59e0b; font-size: 14px; margin: 0; font-weight: 600;">
          Saldo pendiente: $${balance.toLocaleString()} — Recorda abonar antes de tu turno.
        </p>
      </div>
    ` : ''

    const whatsappSection = clubPhone ? `
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-top: 24px; text-align: center;">
        Necesitas cancelar o cambiar el horario? <a href="https://wa.me/${clubPhone.replace(/[^0-9]/g, '')}" style="color: #10b981; text-decoration: none; font-weight: bold;">Contacta al club</a>
      </p>
    ` : ''

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      replyTo: 'courtops.saas@gmail.com',
      to: [email],
      subject: `Recordatorio: Tu turno manana a las ${bookingTime} - ${clubName}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #030712; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
          <div style="background-color: #020617; padding: 40px 20px; text-align: center; border-bottom: 1px solid #1e293b;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">
              COURT<span style="color: #10b981;">OPS</span>
            </h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #ffffff; font-size: 24px; margin-top: 0; margin-bottom: 20px;">Hola ${clientName}!</h2>
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Te recordamos que tenes un turno reservado para manana. Aca van los detalles:
            </p>

            <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Fecha</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 16px; font-weight: 700; text-align: right;">${bookingDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Hora</td>
                  <td style="padding: 8px 0; color: #10b981; font-size: 16px; font-weight: 700; text-align: right;">${bookingTime}hs</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Cancha</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 16px; font-weight: 700; text-align: right;">${courtName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Club</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 16px; font-weight: 700; text-align: right;">${clubName}</td>
                </tr>
              </table>
            </div>

            ${balanceSection}
            ${whatsappSection}
          </div>
          <div style="background-color: #020617; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} CourtOps. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending reminder email:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Exception sending reminder email:', err);
    return { success: false, error: err };
  }
};

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export const sendBookingConfirmationEmail = async (
  email: string,
  clientName: string,
  bookingDate: string,
  bookingTime: string,
  courtName: string,
  clubName: string,
  price: number,
  options?: {
    isPending?: boolean
    paymentUrl?: string
    cancelHours?: number
    clubPhone?: string | null
  }
) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL SIM] Booking confirmation:', { email, clientName, bookingDate, isPending: options?.isPending });
    return { success: true, simulated: true };
  }

  const isPending = options?.isPending ?? false;
  const cancelH = options?.cancelHours ?? 24;

  const subject = isPending
    ? `Turno pendiente de pago — ${clubName}`
    : `¡Reserva confirmada! ${courtName} el ${bookingDate} — ${clubName}`;

  const statusBadge = isPending
    ? `<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:12px 16px;margin-bottom:24px;text-align:center;"><span style="color:#f59e0b;font-weight:700;font-size:14px;">⏳ PENDIENTE DE PAGO</span></div>`
    : `<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:12px 16px;margin-bottom:24px;text-align:center;"><span style="color:#10b981;font-weight:700;font-size:14px;">✅ RESERVA CONFIRMADA</span></div>`;

  const payButton = isPending && options?.paymentUrl
    ? `<div style="text-align:center;margin:32px 0;"><a href="${options.paymentUrl}" style="display:inline-block;background-color:#10b981;color:#000000;padding:16px 32px;text-decoration:none;border-radius:30px;font-weight:800;font-size:16px;text-transform:uppercase;letter-spacing:1px;">Pagar ahora</a></div>`
    : '';

  const cancelNote = isPending
    ? `<p style="color:#94a3b8;font-size:13px;text-align:center;margin-top:16px;">Tu lugar se reserva al completar el pago. Cancelaciones hasta ${cancelH}hs antes.</p>`
    : `<p style="color:#94a3b8;font-size:13px;text-align:center;margin-top:16px;">Podés cancelar hasta ${cancelH}hs antes del turno.</p>`;

  const clubPhoneSection = options?.clubPhone
    ? `<p style="color:#94a3b8;font-size:14px;line-height:1.6;margin-top:24px;text-align:center;">¿Necesitás cambiar algo? <a href="https://wa.me/${options.clubPhone.replace(/[^0-9]/g, '')}" style="color:#10b981;text-decoration:none;font-weight:bold;">Contactá al club</a></p>`
    : '';

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      replyTo: 'courtops.saas@gmail.com',
      to: [email],
      subject,
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background-color:#030712;color:#f8fafc;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
          <div style="background-color:#020617;padding:40px 20px;text-align:center;border-bottom:1px solid #1e293b;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">COURT<span style="color:#10b981;">OPS</span></h1>
            <p style="color:#94a3b8;font-size:14px;margin-top:8px;">${clubName}</p>
          </div>
          <div style="padding:40px 30px;">
            <h2 style="color:#ffffff;font-size:22px;margin-top:0;margin-bottom:20px;">Hola ${clientName}!</h2>
            ${statusBadge}
            <div style="background-color:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;margin:24px 0;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Fecha</td><td style="padding:8px 0;color:#ffffff;font-size:16px;font-weight:700;text-align:right;">${bookingDate}</td></tr>
                <tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Hora</td><td style="padding:8px 0;color:#10b981;font-size:16px;font-weight:700;text-align:right;">${bookingTime} hs</td></tr>
                <tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Cancha</td><td style="padding:8px 0;color:#ffffff;font-size:16px;font-weight:700;text-align:right;">${courtName}</td></tr>
                <tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Precio</td><td style="padding:8px 0;color:#ffffff;font-size:16px;font-weight:700;text-align:right;">${fmt(price)}</td></tr>
              </table>
            </div>
            ${payButton}
            ${cancelNote}
            ${clubPhoneSection}
          </div>
          <div style="background-color:#020617;padding:24px;text-align:center;border-top:1px solid #1e293b;">
            <p style="color:#64748b;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} CourtOps. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    });
    if (error) { console.error('[EMAIL] Booking confirmation error:', error); return { success: false, error }; }
    return { success: true, data };
  } catch (err) {
    console.error('[EMAIL] Booking confirmation exception:', err);
    return { success: false, error: err };
  }
};

export const sendBookingPaymentConfirmationEmail = async (
  email: string,
  clientName: string,
  bookingDate: string,
  bookingTime: string,
  courtName: string,
  clubName: string,
  amountPaid: number,
  remainingBalance: number
) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL SIM] Payment confirmation:', { email, clientName, amountPaid });
    return { success: true, simulated: true };
  }

  const balanceRow = remainingBalance > 0
    ? `<tr><td style="padding:8px 0;color:#f59e0b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Saldo restante</td><td style="padding:8px 0;color:#f59e0b;font-size:16px;font-weight:700;text-align:right;">${fmt(remainingBalance)}</td></tr>`
    : `<tr><td colspan="2" style="padding:8px 0;color:#10b981;font-size:14px;font-weight:600;text-align:center;">✨ Turno pagado en su totalidad</td></tr>`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      replyTo: 'courtops.saas@gmail.com',
      to: [email],
      subject: `Pago recibido — ${clubName}`,
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background-color:#030712;color:#f8fafc;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
          <div style="background-color:#020617;padding:40px 20px;text-align:center;border-bottom:1px solid #1e293b;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">COURT<span style="color:#10b981;">OPS</span></h1>
            <p style="color:#94a3b8;font-size:14px;margin-top:8px;">${clubName}</p>
          </div>
          <div style="padding:40px 30px;">
            <h2 style="color:#ffffff;font-size:22px;margin-top:0;margin-bottom:20px;">Hola ${clientName}!</h2>
            <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:12px 16px;margin-bottom:24px;text-align:center;"><span style="color:#10b981;font-weight:700;font-size:14px;">✅ PAGO RECIBIDO</span></div>
            <div style="background-color:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;margin:24px 0;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Fecha</td><td style="padding:8px 0;color:#ffffff;font-size:16px;font-weight:700;text-align:right;">${bookingDate}</td></tr>
                <tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Hora</td><td style="padding:8px 0;color:#10b981;font-size:16px;font-weight:700;text-align:right;">${bookingTime} hs</td></tr>
                <tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Cancha</td><td style="padding:8px 0;color:#ffffff;font-size:16px;font-weight:700;text-align:right;">${courtName}</td></tr>
                <tr style="border-top:1px solid #1e293b;"><td style="padding:12px 0 8px;color:#10b981;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Pago acreditado</td><td style="padding:12px 0 8px;color:#10b981;font-size:18px;font-weight:800;text-align:right;">${fmt(amountPaid)}</td></tr>
                ${balanceRow}
              </table>
            </div>
            <p style="color:#94a3b8;font-size:14px;text-align:center;margin-top:8px;">¡Gracias! Te esperamos en la cancha 🎾</p>
          </div>
          <div style="background-color:#020617;padding:24px;text-align:center;border-top:1px solid #1e293b;">
            <p style="color:#64748b;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} CourtOps. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    });
    if (error) { console.error('[EMAIL] Payment confirmation error:', error); return { success: false, error }; }
    return { success: true, data };
  } catch (err) {
    console.error('[EMAIL] Payment confirmation exception:', err);
    return { success: false, error: err };
  }
};

export const sendSubscriptionPaymentEmail = async (
  toEmail: string,
  clubName: string,
  planName: string,
  amount: number,
  type: 'new' | 'renewal'
) => {
  const subject = type === 'new'
    ? `Nueva suscripción: ${clubName} — ${planName}`
    : `Renovación automática: ${clubName} — ${planName}`;

  const body = type === 'new'
    ? `El club <strong>${clubName}</strong> activó el plan <strong>${planName}</strong> por <strong>${fmt(amount)}</strong>.`
    : `El club <strong>${clubName}</strong> renovó automáticamente su plan <strong>${planName}</strong> por <strong>${fmt(amount)}</strong>.`;

  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL SIM] Subscription payment:', { toEmail, subject, clubName, planName, amount });
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [toEmail],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #030712; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
          <div style="background: #020617; padding: 28px 24px; border-bottom: 1px solid #1e293b; text-align: center;">
            <h1 style="margin:0; font-size:22px; color:#fff;">COURT<span style="color:#10b981;">OPS</span></h1>
            <p style="margin:8px 0 0; color:#94a3b8; font-size:13px;">Notificación de pago</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="color:#cbd5e1; font-size:15px; line-height:1.6; margin:0 0 20px;">${body}</p>
            <div style="background:#0f172a; border:1px solid #1e293b; border-radius:8px; padding:16px 20px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="color:#94a3b8; font-size:13px;">Club</span>
                <span style="color:#fff; font-size:13px; font-weight:bold;">${clubName}</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="color:#94a3b8; font-size:13px;">Plan</span>
                <span style="color:#fff; font-size:13px; font-weight:bold;">${planName}</span>
              </div>
              <div style="display:flex; justify-content:space-between; border-top:1px solid #1e293b; padding-top:12px; margin-top:4px;">
                <span style="color:#94a3b8; font-size:13px;">Monto cobrado</span>
                <span style="color:#10b981; font-size:16px; font-weight:bold;">${fmt(amount)}</span>
              </div>
            </div>
          </div>
        </div>
      `,
    });
    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    console.error('Exception sending subscription payment email:', err);
    return { success: false, error: err };
  }
};
