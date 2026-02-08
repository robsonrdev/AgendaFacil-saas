import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-01-28.clover', // Use a versão mais recente sugerida pelo VS Code ou essa padrão
  appInfo: {
    name: 'Agenda Facil SaaS',
    version: '0.1.0',
  },
});