interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Demo version of the main site's MathText. The main site renders `$...$` math with KaTeX;
 * the demo leaves KaTeX out to stay small, so text is shown as-is.
 * If a future demo needs math, add KaTeX back here only.
 */
export default function MathText({ text, className }: MathTextProps) {
  return <span className={className}>{text}</span>;
}
