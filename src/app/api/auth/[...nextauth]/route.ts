import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();
        const emailRegex = new RegExp(`^${credentials.email.trim()}$`, "i");
        const user = await User.findOne({ email: emailRegex });
        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email to login.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          business_name: user.business_name,
          industry: user.industry,
          phone: user.phone,
          address: user.address,
          state: user.state,
          pincode: user.pincode,
          country: user.country,
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.business_name = (user as any).business_name;
        token.industry = (user as any).industry;
        token.phone = (user as any).phone;
        token.address = (user as any).address;
        token.state = (user as any).state;
        token.pincode = (user as any).pincode;
        token.country = (user as any).country;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).business_name = token.business_name;
        (session.user as any).industry = token.industry;
        (session.user as any).phone = token.phone as string;
        (session.user as any).address = token.address as string;
        (session.user as any).state = token.state as string;
        (session.user as any).pincode = token.pincode as string;
        (session.user as any).country = token.country as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
