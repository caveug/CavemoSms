export type VariantProps<T extends (...args: any) => any> = Parameters<T>[0];

type ClassValue = string | null | undefined | false;
type ClassProp = Record<string, ClassValue>;

type VariantConfig = Record<string, Record<string, ClassValue>>;
type DefaultVariants = Record<string, string>;

export function cva(
  base: string,
  config?: { variants?: VariantConfig; defaultVariants?: DefaultVariants },
) {
  return (props: Record<string, string> = {}) => {
    const { variants = {}, defaultVariants = {} } = config || {};
    const variantClassNames: string[] = [];

    for (const variant in variants) {
      const variantProp = props[variant] || defaultVariants[variant];
      if (variantProp && variants[variant][variantProp]) {
        variantClassNames.push(variants[variant][variantProp] as string);
      }
    }

    return [base, ...variantClassNames].filter(Boolean).join(" ");
  };
}
