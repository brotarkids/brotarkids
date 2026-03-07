import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { name, email, role, school_name } = await req.json();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">🌱 Novo Cadastro na Brotar Kids</h1>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background: #f0fdf4;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">Nome</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${name || 'Não informado'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">Email</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${email}</td>
          </tr>
          <tr style="background: #f0fdf4;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">Tipo</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${role || 'Cadastro público'}</td>
          </tr>
          ${school_name ? `
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">Escola (convite)</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${school_name}</td>
          </tr>
          ` : ''}
          <tr style="background: #f0fdf4;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">Data/Hora</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
          </tr>
        </table>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Brotar Kids <onboarding@resend.dev>',
        to: ['brotarkids@gmail.com'],
        subject: `🌱 Novo cadastro: ${name || email}`,
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending signup notification:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
