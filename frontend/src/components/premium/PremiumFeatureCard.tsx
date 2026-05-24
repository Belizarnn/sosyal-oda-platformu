import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface PremiumFeatureCardProps {
  icon: string;
  titleKey: string;
  descriptionKey: string;
  className?: string;
}

export function PremiumFeatureCard({
  icon,
  titleKey,
  descriptionKey,
  className,
}: PremiumFeatureCardProps) {
  const { t } = useLanguage();

  return (
    <Card
      className={cn(
        "border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 p-5",
        className,
      )}
    >
      <div className="mb-3 text-2xl">{icon}</div>
      <h3 className="font-semibold text-foreground">{t(titleKey)}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t(descriptionKey)}</p>
    </Card>
  );
}
