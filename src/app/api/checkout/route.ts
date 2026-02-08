import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    // 1. Receber dados do Front-end
    const { priceId, userId, userEmail } = await req.json();

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // 2. Criar a Sessão de Checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', // 'payment' para pagamento único, 'subscription' para recorrente
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // ID do preço que vem do front-end
          quantity: 1,
        },
      ],
      customer_email: userEmail, // Já preenche o email do cliente no checkout
      
      // Metadados são cruciais: eles viajam até o webhook para sabermos QUEM pagou
      metadata: {
        userId: userId,
      },

      // Para onde o usuário vai depois de pagar?
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/?canceled=true`,
    });

    // 3. Retornar a URL do Checkout para o navegador abrir
    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Erro no Checkout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}