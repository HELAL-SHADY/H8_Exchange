declare module "@next-auth/prisma-adapter" {
  export * from "@next-auth/prisma-adapter";
}

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user?: User & {
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}
