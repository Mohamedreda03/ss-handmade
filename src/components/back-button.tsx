import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  href: string;
  label?: string;
}

export const BackButton = ({ href, label = "Back" }: BackButtonProps) => {
  return (
    <Button variant="outline" asChild>
      <Link href={href}>
        <ArrowRight className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
};
