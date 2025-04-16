import React from "react";
import SplashScreen from "./components/SplashScreen";

export default function SplashScreenPage() {
  // Wrap in error boundary (simplified version)
  try {
    return <SplashScreen />;
  } catch (error) {
    console.error("Error rendering SplashScreen:", error);
    // Return a minimal fallback UI
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#4f46e5",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <h1>Loading...</h1>
      </div>
    );
  }
}
