import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const handler = NextAuth({
	session: { strategy: "jwt" },
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			authorize(credentials) {
				const username = process.env.AUTH_DEMO_USER;
				const password = process.env.AUTH_DEMO_PASS;
				if (
					username &&
					password &&
					credentials?.username === username &&
					credentials?.password === password
				) {
					return { id: "demo-user", name: username };
				}

				return null;
			},
		}),
	],
});

export { handler as GET, handler as POST };
