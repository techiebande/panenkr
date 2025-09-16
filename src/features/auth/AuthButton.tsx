// src/features/auth/AuthButton.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <p>Not signed in</p>
      {/* This will redirect to the default sign-in page which shows all providers */}
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  );
}
