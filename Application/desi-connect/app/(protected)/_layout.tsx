import { Redirect, Slot } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/signup" />;
  }

  // Renders the actual screen content
  return <Slot />;
}
