import { Card } from "../../../components/ui/Card";

type StatisticTone = "default" | "green" | "orange" | "red";

interface StatisticCardProps {
  label: string;
  value: string | number;
  tone?: StatisticTone;
  className?: string;
}

const valueClasses: Record<StatisticTone, string> = {
  default: "text-ink",
  green: "text-turf",
  orange: "text-amber-deep",
  red: "text-danger",
};

export function StatisticCard({
  label,
  value,
  tone = "default",
  className = "",
}: StatisticCardProps) {
  return (
    <Card
      className={`flex min-h-[126px] flex-col justify-center px-7 py-6 ${className}`}
    >
      <p className="text-[13px] font-bold uppercase tracking-[0.06em] text-ink-soft">
        {label}
      </p>
      <p
        className={`mt-3 font-mono text-[32px] font-semibold leading-none ${valueClasses[tone]}`}
      >
        {value}
      </p>
    </Card>
  );
}
