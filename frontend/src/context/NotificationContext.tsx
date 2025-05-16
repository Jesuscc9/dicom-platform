// src/context/NotificationContext.tsx
import React, { createContext, type ReactNode, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

type Notif = { open: boolean; message: string; severity: "error" | "success" };

export const NotificationContext = createContext<
  (msg: string, severity?: Notif["severity"]) => void
>(() => {});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notif, setNotif] = useState<Notif>({
    open: false,
    message: "",
    severity: "success",
  });

  const push = (message: string, severity: Notif["severity"] = "error") => {
    setNotif({ open: true, message, severity });
  };

  return (
    <NotificationContext.Provider value={push}>
      {children}
      <Snackbar
        open={notif.open}
        autoHideDuration={3000}
        onClose={() => setNotif((n) => ({ ...n, open: false }))}
      >
        <Alert severity={notif.severity}>{notif.message}</Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
