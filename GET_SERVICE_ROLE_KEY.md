# Get Supabase Service Role Key

## Why you need this:
Your backend is currently using the `anon` (anonymous) key, which has limited permissions and is blocked by Row Level Security policies. The `service_role` key bypasses RLS and is meant for server-side use.

## Steps:

1. **Open your Supabase Dashboard**: https://lwgzhsohwqgijajawrhk.supabase.co

2. **Navigate to Settings**:
   - Click on the **Settings** icon (gear icon) in the left sidebar
   - Click on **API**

3. **Find the Service Role Key**:
   - Scroll down to the "Project API keys" section
   - You'll see two keys:
     - `anon` `public` - This is what you're currently using (limited permissions)
     - `service_role` `secret` - **This is what you need** (full permissions)

4. **Copy the service_role key**:
   - Click the eye icon to reveal the `service_role` key
   - Click the copy button to copy it

5. **Update your .env file**:
   - Open `/Users/esra/Desktop/Sparkle/backend/.env`
   - Replace the current `SUPABASE_KEY` value with the `service_role` key

   Before:
   ```
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3Z3poc29od3FnaWphamF3cmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcxODM0MTcsImV4cCI6MjA0Mjc1OTQxN30.xI9jApNYykfnMtcRy20xyihixsNSdQnfH-Ro33fk9fY
   ```

   After:
   ```
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3Z3poc29od3FnaWphamF3cmhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzE4MzQxNywiZXhwIjoyMDQyNzU5NDE3fQ.YOUR_SERVICE_ROLE_KEY_HERE
   ```

6. **Restart your backend server**:
   - The backend will automatically reload and use the new key
   - You should see the uvicorn server restart in your terminal

7. **Test onboarding again**:
   - Go back to your mobile app
   - Try completing the onboarding flow
   - The permission error should be gone! 🎉

## Important Notes:

⚠️ **Security**: The `service_role` key should NEVER be exposed in client-side code (mobile app, web frontend). Only use it in your backend server.

✅ **Safe for your setup**: Since you're using it in the FastAPI backend (server-side), this is the correct approach for Phase 1.

🔄 **Phase 2**: When you switch to real Supabase Auth, you can switch back to the `anon` key and use proper RLS policies.
