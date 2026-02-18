import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email: string, userName: string, clubName: string) => {
       if (!process.env.RESEND_API_KEY) {
              console.warn('RESEND_API_KEY is not set. Email simulation:', { email, userName, clubName });
              return { success: true, simulated: true };
       }

       try {
              const { data, error } = await resend.emails.send({
                     from: 'CourtOps <onboarding@courtops.com>',
                     to: [email],
                     subject: `¡Bienvenido a CourtOps! 🚀 - ${clubName}`,
                     html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0078F0;">Bienvenido a CourtOps, ${userName}</h1>
          <p>Estamos emocionados de ayudarte a profesionalizar la gestión de <strong>${clubName}</strong>.</p>
          <p>Tu cuenta ha sido creada con éxito. Ahora puedes acceder a tu panel de control y comenzar a configurar tus canchas y horarios.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Siguientes pasos sugeridos:</h3>
            <ol>
              <li>Configura tus horarios de apertura y cierre.</li>
              <li>Define tus reglas de precios.</li>
              <li>Comparte tu link de reservas público.</li>
            </ol>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #0078F0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ir a mi Dashboard</a>
          
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
            Si tienes alguna duda, responde a este correo o contacta a soporte.
          </p>
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
