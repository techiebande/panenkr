// src/app/page.tsx
import AuthButton from "@/features/auth/AuthButton";

export default function HomePage() {
  return (
    <main>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px",
          borderBottom: "1px solid #ccc",
        }}
      >
        <h1>Football Predictions</h1>
        <AuthButton />
      </header>
      <div>
        <h2>Welcome to the site!</h2>
        {/* Your homepage content will go here */}
      </div>
    </main>
  );
}
