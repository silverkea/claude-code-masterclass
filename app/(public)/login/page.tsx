import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
