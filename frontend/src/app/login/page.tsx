import LoginForm from "./loginForm";

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Login to Word Book</h1>
        <LoginForm />
      </div>
    </div>
  );
}