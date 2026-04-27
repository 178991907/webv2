import type { Settings } from "@/lib/types";
import Link from "next/link";

export function MainFooter({ settings }: { settings: Settings }) {
  return (
    <footer className="py-8 mt-auto border-t">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>
          {settings.copyright}
        </p>
      </div>
    </footer>
  );
}
