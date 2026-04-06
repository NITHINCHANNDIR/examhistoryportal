import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import useThemeStore from '../stores/useThemeStore';
import { Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        studentId: '',
        department: '',
        batchYear: new Date().getFullYear(),
        role: 'student'
    });

    const { login, register, isLoading, error, clearError } = useAuthStore();
    const { theme, setTheme } = useThemeStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        if (isLogin) {
            await login(formData.email, formData.password);
        } else {
            await register(formData);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const inputClassName = "w-full h-[46px] px-3 mt-1.5 text-[15px] text-gray-900 dark:text-white bg-transparent border-2 border-emerald-500 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-colors placeholder-gray-400 dark:placeholder-gray-500";
    const labelClassName = "block text-[15px] font-bold text-emerald-600 tracking-wide";

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} flex items-center justify-center font-sans relative transition-colors duration-300 pb-12 pt-6`}>

            {/* Theme Toggle Button - Fixed to Top Right Corner */}
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-3 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all hover:scale-110 active:scale-95"
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className="w-full max-w-[1240px] px-4 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-24 relative z-10">

                {/* Left Side Illustration */}
                <div className="w-full md:w-[50%] flex justify-center order-2 md:order-1 relative">
                    <img
                        src="/minimalist-boy-desk.png"
                        alt="Minimalist vector illustration of a boy sitting at a desk with a green theme"
                        className="w-full max-w-lg lg:max-w-xl object-contain animate-in fade-in zoom-in duration-700 pointer-events-none drop-shadow-sm"
                    />
                </div>

                {/* Right Side Form Segment */}
                <div className="w-full md:w-[45%] max-w-[400px] mx-auto order-1 md:order-2 flex flex-col pt-8 md:pt-0">

                    <div className="mb-8">
                        <h1 className="text-[34px] font-bold text-emerald-600 tracking-tight">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h1>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-100 dark:border-red-500/20 shadow-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5" autoComplete="off">
                        
                        {!isLogin && (
                            <>
                                <div>
                                    <label className={labelClassName}>Select Role</label>
                                    <div className="flex gap-6 mt-2">
                                        <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 dark:text-gray-300">
                                            <input 
                                                type="radio" 
                                                name="role" 
                                                value="student" 
                                                checked={formData.role === 'student'} 
                                                onChange={handleChange} 
                                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                                            />
                                            Student
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 dark:text-gray-300">
                                            <input 
                                                type="radio" 
                                                name="role" 
                                                value="admin" 
                                                checked={formData.role === 'admin'} 
                                                onChange={handleChange} 
                                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                                            />
                                            Admin
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className={labelClassName}>First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className={inputClassName}
                                            required={!isLogin}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className={labelClassName}>Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className={inputClassName}
                                            required={!isLogin}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClassName}>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={inputClassName}
                                        autoComplete="off"
                                    />
                                </div>

                                {formData.role === 'student' && (
                                    <div>
                                        <label className={labelClassName}>Student ID</label>
                                        <input
                                            type="text"
                                            name="studentId"
                                            value={formData.studentId}
                                            onChange={handleChange}
                                            className={inputClassName}
                                            required={!isLogin && formData.role === 'student'}
                                            autoComplete="off"
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        <div>
                            <label className={labelClassName}>Email address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClassName}
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label className={labelClassName}>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={inputClassName}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="mt-4 flex flex-col gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-[48px] rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[16px] shadow-sm transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>{isLogin ? 'Sign in' : 'Sign up'}</>
                                )}
                            </button>

                            <div className="w-full flex justify-center mt-2">
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
                                        const loadingToast = toast.loading('Authenticating securely...');
                                        try {
                                            useAuthStore.setState({ isLoading: true, error: null });
                                            // Send the standard OIDC Google ID string to our backend
                                            const response = await api.post('/auth/google', {
                                                idToken: credentialResponse.credential,
                                                role: formData.role
                                            });

                                            const { token, user } = response.data;
                                            
                                            // Utilize standard login flow
                                            await useAuthStore.getState().firebaseLogin(user, token);
                                            toast.success('Successfully logged in!', { id: loadingToast });
                                            navigate('/');
                                        } catch (err) {
                                            console.error('Google Auth Error:', err);
                                            const errorMessage = err?.response?.data?.message || err.message || 'Google authentication failed';
                                            useAuthStore.setState({
                                                isLoading: false,
                                                error: errorMessage
                                            });
                                            toast.error(errorMessage, { id: loadingToast });
                                        }
                                    }}
                                    onError={() => {
                                        useAuthStore.setState({ error: 'Google authentication was cancelled or failed' });
                                        toast.error('Google popup was closed or failed.');
                                    }}
                                    theme={theme === 'dark' ? 'filled_black' : 'outline'}
                                    shape="rectangular"
                                    size="large"
                                    text={isLogin ? 'signin_with' : 'signup_with'}
                                />
                            </div>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-[15px] font-medium text-gray-600 dark:text-gray-400">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); clearError(); }}
                            className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default Login;
