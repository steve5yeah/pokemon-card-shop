"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText,
}: {
  children: React.ReactNode;
  pendingText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full py-3">
      {pending ? pendingText : children}
    </button>
  );
}
