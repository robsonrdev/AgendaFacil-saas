export type PlanType = 'start' | 'pro' | 'business';

export const PLANS = {
  start: {
    label: 'Start',
    maxProfessionals: 1,
    maxAppointments: 30,
  },
  pro: {
    label: 'Pro',
    maxProfessionals: 3,
    maxAppointments: Infinity, // Ilimitado
  },
  business: {
    label: 'Business',
    maxProfessionals: Infinity, // Ilimitado
    maxAppointments: Infinity,
  }
};

export const getPlanLimits = (plan: string) => {
  // Se o plano não existir ou for inválido, assume o 'start' (segurança)
  return PLANS[plan as PlanType] || PLANS.start;
};