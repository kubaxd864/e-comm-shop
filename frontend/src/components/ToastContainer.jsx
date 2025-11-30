"use client";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import Toast from "./Toast";

export default function ToastContainer({ toasts, removeToast }) {
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMountNode(document.getElementById("toast-root"));
  }, []);

  if (!mountNode) return null;

  return createPortal(
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3 items-end">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </div>,
    mountNode
  );
}
