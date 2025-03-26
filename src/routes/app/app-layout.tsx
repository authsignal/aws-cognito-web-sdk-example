import {AuthsignalLogo} from "@/components/authsignal-logo";
import {Button} from "@/components/ui/button";
import {Link, Outlet, useNavigate} from "react-router-dom";
import {signOut} from "@/lib/aws-auth";

export function AppLayout() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 flex border-b items-center px-6 gap-6">
        <AuthsignalLogo />
        <Link className=" text-sm font-medium" to="/checkout">
          Checkout demo
        </Link>
        <Button className="ml-auto" type="button" onClick={handleSignOut}>
          Log out
        </Button>
      </header>
      <main className="flex-1">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
