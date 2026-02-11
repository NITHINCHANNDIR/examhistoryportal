import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { Shield, Lock, User, CheckCircle, ArrowRight } from 'lucide-react';

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, completeOnboarding } = useAuthStore();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            const result = await completeOnboarding({
                firstName: formData.firstName,
                lastName: formData.lastName,
                newPassword: formData.newPassword
            });

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
            }
        } catch (error) {
            console.error(error);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg)',
            backgroundImage: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(239, 68, 68, 0.1), transparent 40%)',
            padding: '24px'
        }}>
            <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
                    }}>
                        <Shield _size={32} color="var(--color-primary)" />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
                        Welcome, {user?.email}
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
                        Please ensure your account security by updating your profile details and setting a new password.
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '12px',
                        color: 'var(--color-error)',
                        fontSize: '14px',
                        fontWeight: 500,
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label className="label">First Name</label>
                            <div className="input-group">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    className="input"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    placeholder="John"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Last Name</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="input"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label className="label">New Password</label>
                        <div className="input-group">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                className="input"
                                required
                                minLength={6}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label className="label">Confirm Password</label>
                        <div className="input-group ">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                className="input"
                                required
                                minLength={6}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Setting up...' : (
                            <>Complete Setup <ArrowRight size={18} /></>
                        )}
                    </button>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '13px', backgroundColor: 'var(--color-surface)', padding: '8px 16px', borderRadius: '20px' }}>
                            <CheckCircle size={14} color="var(--color-success)" />
                            Secure Environment
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
