import { Badge } from "@/components/ui/Badge";
import { MOCK_PROFILE_BADGES } from "@/types/user";

export function ProfileBadgeList() {
  return (
    <div className="flex flex-wrap gap-2">
      {MOCK_PROFILE_BADGES.map((badge) => (
        <Badge key={badge} variant="accent">
          {badge}
        </Badge>
      ))}
    </div>
  );
}
