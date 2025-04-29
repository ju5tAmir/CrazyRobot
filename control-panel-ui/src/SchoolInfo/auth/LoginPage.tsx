import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [email, setEmail]     = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]     = useState('');

    const handle = async () => {
        try {
            await login(email, password);
            nav('/school-info/admin/contacts');
        } catch {
            setError('Incorrect email or password');
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-base-200">
            <div className="card p-6 w-80 bg-base-100">
                <h2 className="text-xl font-bold mb-4">Admin Login</h2>
                <input
                    type="email" placeholder="Email"
                    className="input input-bordered w-full mb-2"
                    value={email} onChange={e=>setEmail(e.target.value)}
                />
                <input
                    type="password" placeholder="Password"
                    className="input input-bordered w-full mb-2"
                    value={password} onChange={e=>setPassword(e.target.value)}
                />
                {error && <div className="text-error mb-2">{error}</div>}
                <button className="btn btn-primary w-full" onClick={handle}>
                    Sign in
                </button>
            </div>
        </div>
    );
}
