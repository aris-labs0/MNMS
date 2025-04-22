import {betterAuth} from 'better-auth';
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { admin } from "better-auth/plugins"



export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
      }),
    emailAndPassword: {
        enabled: true,
        async sendResetPassword(data, request) {
            // Send an email to the user with a link to reset their password
        },
    },
    plugins: [
        admin() ,
    ],
    databaseHooks: {
        user: {
          create: {
              before: async (user) => {
                  // Modify the user object before it is created
                  return {
                     data: {
                        ...user,
                        role:"admin"
                    }
                  }
              },
            }
        }

    /** if no database is provided, the user data will be stored in memory.
     * Make sure to provide a database to persist user data **/
}});