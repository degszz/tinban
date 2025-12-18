import axios from 'axios';

interface SendSMSParams {
  phone: string;
  message: string;
}

// Función para generar OTP de 6 dígitos
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Función para enviar SMS
export async function sendSMS({ phone, message }: SendSMSParams): Promise<boolean> {
  try {
    // 🔴 MODO DESARROLLO: Solo loguear en consola
    if (process.env.NODE_ENV === 'development' || !process.env.SMS_API_KEY) {
      console.log('📱 [SMS SIMULADO]');
      console.log('📞 Teléfono:', phone);
      console.log('💬 Mensaje:', message);
      console.log('✅ SMS NO enviado (modo desarrollo)');
      return true;
    }

    // 🟢 MODO PRODUCCIÓN: Integrar API real (ejemplo: Twilio)
    const response = await axios.post(
      process.env.SMS_API_URL || 'https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json',
      {
        To: phone,
        From: process.env.SMS_FROM_NUMBER,
        Body: message,
      },
      {
        auth: {
          username: process.env.SMS_ACCOUNT_SID || '',
          password: process.env.SMS_API_KEY || '',
        },
      }
    );

    console.log('✅ SMS enviado exitosamente:', response.data);
    return true;
  } catch (error: any) {
    console.error('❌ Error enviando SMS:', error.message);
    return false;
  }
}

// Función para enviar OTP por SMS
export async function sendOTP(phone: string, otpCode: string): Promise<boolean> {
  const message = `Tu código de verificación TINBAN es: ${otpCode}. Válido por 5 minutos.`;
  return sendSMS({ phone, message });
}
