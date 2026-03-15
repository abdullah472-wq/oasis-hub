export const springIn = {
  initial: { y: 40, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true },
  transition: { type: "spring" as const, bounce: 0.3 },
};

export const springInDelay = (delay: number) => ({
  type: "spring" as const,
  bounce: 0.3,
  delay,
});
