import { Link } from "react-router-dom";
import { useForm, type SubmitHandler } from 'react-hook-form';
import { LockIcon, MailIcon, MessageCircleIcon, UserIcon } from "lucide-react";
import { LoaderIcon } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { useAuthStore } from "../store/useAuthStore";
import signupImage from '../assets/signup.png';

const signupSchema = z.object({
  fullName: z.string().min(1, 'fullName is required'),
  email: z.string().min(1, 'email is required').email('Invalid email'),
  password: z.string().min(1, 'password is required').min(6, 'Password must be at least 6 characters')
})

export type TSignupSchema = z.infer<typeof signupSchema>;

const SignupPage = () => {
  const { isSigningUp, signup } = useAuthStore();
  const { register, handleSubmit } = useForm<TSignupSchema>({
    mode: 'onTouched',
    resolver: zodResolver(signupSchema)
  });
  const submitForm: SubmitHandler<TSignupSchema> = (formData) => {
    signup(formData);
  }
  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-6xl md:h-200 h-162.5">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">

            <div className="col md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">

                <div className="main_title text-center mb-8">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">Create Account</h2>
                  <p className="text-slate-400">Sign up for a new account</p>
                </div>

                <form onSubmit={handleSubmit(submitForm)} className="space-y-6">

                  <div className="input-field">
                    <label className="auth-input-label">Full Name</label>
                    <div className="relative">
                      <UserIcon className="auth-input-icon" />
                      <input type="text" {...register('fullName')} className="input" placeholder="John Doe" />
                    </div>
                  </div>

                  <div className="input-field">
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />
                      <input type="email" {...register('email')} className="input" placeholder="johndoe@gmail.com" />
                    </div>
                  </div>

                  <div className="input-field">
                    <label className="auth-input-label">Password</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      <input type="password" {...register('password')} className="input" placeholder="Enter your password" />
                    </div>
                  </div>

                  <button type="submit" className="auth-btn" disabled={isSigningUp}> 
                    {isSigningUp ? (
                      <LoaderIcon className="w-full h-5 animate-spin text-center mx-auto" />
                    ) : (
                      "Create Account"
                    )}
                  </button>

                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="auth-link">
                    Already have an account? Login
                  </Link>
                </div>

              </div>
            </div>

            <div className="col hidden md:w-1/2 md:flex items-center justify-center p-6 bg-linear-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src={signupImage}
                  alt="People using mobile devices"
                  className="w-full h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">Start Your Journey Today</h3>
                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Free</span>
                    <span className="auth-badge">Easy Setup</span>
                    <span className="auth-badge">Private</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  )
}

export default SignupPage;
