export const LESSON_PRICE_RUB = 400;

export type LessonPlan = "single" | "pack5" | "pack10";

export function amountRubForPlan(plan: LessonPlan): number {
  switch (plan) {
    case "single":
      return LESSON_PRICE_RUB;
    case "pack5":
      return Math.round(LESSON_PRICE_RUB * 5 * (1 - 0.2));
    case "pack10":
      return Math.round(LESSON_PRICE_RUB * 10 * (1 - 0.3));
  }
}

/** e.g. 1600 → "1 600 ₽" */
export function formatPriceRub(amount: number): string {
  return `${amount.toLocaleString("ru-RU")} ₽`;
}
