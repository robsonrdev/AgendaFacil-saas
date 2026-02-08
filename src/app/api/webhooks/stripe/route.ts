import { headers } from 'next/headers';

import { NextResponse } from 'next/server';

import { stripe } from '@/lib/stripe';

import { db } from '@/lib/firebase';

import { doc, updateDoc } from 'firebase/firestore';

import Stripe from 'stripe';







export async function POST(req: Request) {

  const body = await req.text();

  const signature = (await headers()).get('Stripe-Signature') as string;

  console.log("🔔 Webhook recebeu um evento!");



  let event: Stripe.Event;



  try {

    // Verifica se a mensagem veio mesmo do Stripe (usando a chave do .env)

    event = stripe.webhooks.constructEvent(

      body,

      signature,

      process.env.STRIPE_WEBHOOK_SECRET as string

    );

  } catch (error: any) {

    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });

  }



  // Se o evento for "Sessão de Checkout Completada"

  if (event.type === 'checkout.session.completed') {

    const session = event.data.object as Stripe.Checkout.Session;

   

    // Pega o ID do usuário que mandamos no checkout

    const userId = session.metadata?.userId;



    if (userId) {

      console.log(`💰 Pagamento recebido! Atualizando usuário: ${userId}`);

      try {

        // Atualiza no Firebase

        await updateDoc(doc(db, 'users', userId), {

          plan: 'pro',

          updatedAt: new Date(),

        });

        console.log('✅ Plano PRO ativado com sucesso!');

      } catch (err) {

        console.error('❌ Erro ao atualizar Firebase:', err);

      }

    }

  }



  return NextResponse.json({ received: true });

}
