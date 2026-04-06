import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
