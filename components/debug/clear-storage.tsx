"use client";

import { Button } from "@/components/ui/button";

export function ClearStorageButton() {
  const clearStorage = () => {
    localStorage.removeItem("cybernft_user");
    window.location.reload();
  };

  return (
    <Button
      onClick={clearStorage}
      variant="destructive"
      size="sm"
      className="fixed bottom-4 right-4 z-50"
    >
      Clear Storage & Reload
    </Button>
  );
}