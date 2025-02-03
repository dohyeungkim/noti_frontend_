import Link from 'next/link';

export default function LoginPage() {
    return (
        <div>
            <h1>Log In</h1>
            <form>
                <label>
                    Username: <input type="text" />
                </label>
                <br />
                <label>
                    Password: <input type="password" />
                </label>
                <br />
                <button type="submit">Log In</button>
            </form>
            <div style={{ marginTop: '1rem' }}>
                <Link href="/">
                    <button style={{ marginRight: '1rem' }}>Back to Home</button>
                </Link>
                <Link href="/signup">
                    <button>Go to Sign Up</button>
                </Link>
            </div>
        </div>
    );
}
