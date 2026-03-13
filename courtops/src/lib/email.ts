import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email: string, userName: string, clubName: string) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email simulation:', { email, userName, clubName });
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'CourtOps <onboarding@resend.dev>',
      replyTo: 'courtops.saas@gmail.com',
      to: [email],
      subject: `¡Bienvenido a CourtOps, ${userName}! 🚀`,
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
            <h2 style="color: #ffffff; font-size: 24px; margin-top: 0; margin-bottom: 20px;">¡Hola ${userName}!</h2>
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Estamos encantados de darte la bienvenida a la plataforma que llevará la gestión de <strong>${clubName}</strong> al siguiente nivel. Tu cuenta ha sido creada exitosamente y ya puedes acceder a todas las herramientas premium que diseñamos para ti.
            </p>
            
            <div style="background: linear-gradient(145deg, rgba(16,185,129,0.1) 0%, rgba(3,7,18,0) 100%); border: 1px solid rgba(16,185,129,0.2); padding: 24px; border-radius: 12px; margin: 32px 0;">
              <h3 style="color: #10b981; margin-top: 0; margin-bottom: 16px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Siguientes Pasos Rápidos</h3>
              <ul style="color: #cbd5e1; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Configura tus <strong>canchas y horarios</strong> de atención.</li>
                <li style="margin-bottom: 8px;">Define tus tarifas en <strong>Reglas de Precios</strong>.</li>
                <li style="margin-bottom: 0px;">Comparte tu <strong>link público</strong> para recibir reservas online 24/7.</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://courtops.vercel.app'}/dashboard" style="display: inline-block; background-color: #10b981; color: #000000; padding: 16px 32px; text-decoration: none; border-radius: 30px; font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                Ir a mi Dashboard
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-top: 30px; text-align: center;">
              ¿Tienes alguna duda iniciando? Escríbenos directamente por <a href="https://wa.me/5493524421497" style="color: #10b981; text-decoration: none; font-weight: bold;">WhatsApp al +54 9 3524 42-1497</a> y te ayudaremos en minutos.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #020617; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} CourtOps. Todos los derechos reservados.<br>
              Diseñado para profesionalizar el deporte.
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
      from: 'CourtOps <onboarding@resend.dev>',
      replyTo: 'courtops.saas@gmail.com',
      to: [email],
      subject: 'Restablecer tu contraseña - CourtOps',
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
              Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón de abajo para crear una nueva.
            </p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #000000; padding: 16px 32px; text-decoration: none; border-radius: 30px; font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center;">
              Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, ignorá este email.
            </p>
          </div>
          <div style="background-color: #020617; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} CourtOps. Todos los derechos reservados.
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
