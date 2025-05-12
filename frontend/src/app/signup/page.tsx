import SignupForm from "./signupForm";

export default function SignupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
        <SignupForm />
      </div>
    </div>
  );
}
