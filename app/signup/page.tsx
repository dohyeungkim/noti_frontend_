import Link from 'next/link';

export default function SignupPage() {
    return (
        <div>
            <h1>Sign Up</h1>
            <form>
                <label>
                    Username: <input type="text" />
                </label>
                <br />
                <label>
                    Password: <input type="password" />
                </label>
                <br />
                <button type="submit">Sign Up</button>
            </form>
            <div style={{ marginTop: '1rem' }}>
                <Link href="/">
                    <button style={{ marginRight: '1rem' }}>Back to Home</button>
                </Link>
                <Link href="/login">
                    <button>Go to Log In</button>
                </Link>
            </div>
        </div>
    );
}
