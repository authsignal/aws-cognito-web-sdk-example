import {Card} from "@/components/ui/card";
import {Outlet, redirect, useNavigation} from "react-router-dom";
import {getCurrentUser} from "@/lib/aws-auth";

export async function loader() {
  try {
    await getCurrentUser();
    return redirect("/account/security");
  } catch {
    return null;
  }
}

export function LoginLayout() {
  const navigation = useNavigation();

  return (
    <main className="grid place-content-center min-h-screen">
      <Card className="w-[400px] overflow-hidden">
        {navigation.state === "loading" && (
          <div className="rounded-lg h-1.5 bg-foreground/20 overflow-hidden">
            <div className="animate-progress h-full bg-foreground origin-left-right" />
          </div>
        )}
        <Outlet />
      </Card>
    </main>
  );
}
