# Deploying Know-Emp to Vercel

## 1. Prerequisites

Ensure you have your environment variables ready. You can find them in your `.env.local` file. You will need:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GROQ_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 2. Deployment Methods

### Option A: Using Vercel Dashboard (Recommended for Git)

1.  Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2.  Log in to [Vercel](https://vercel.com).
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your Git repository.
5.  In the **"Configure Project"** screen:
    - **Framework Preset**: Next.js (should be auto-detected).
    - **Root Directory**: `./` (default).
    - **Environment Variables**: Expand this section and add all keys listed in prerequisites.
6.  Click **"Deploy"**.

### Option B: Using Vercel CLI

1.  Open a terminal in the project root.
2.  Run:
    ```bash
    npx vercel
    ```
3.  Follow the prompts:
    - Set up and deploy? **Y**
    - Which scope? (Select your team/user)
    - Link to existing project? **N** (unless you already created one)
    - Project name? (Press Enter for default)
    - In which directory is your code located? `./`
    - Want to modify these settings? **N** (We created a `vercel.json` to handle this)
4.  **Important**: After the first deployment (or during setup if prompted), you **must** add your environment variables in the Vercel Dashboard under **Settings > Environment Variables**, or use the CLI:
    ```bash
    npx vercel env add NEXT_PUBLIC_SUPABASE_URL
    # Follow prompts, repeat for all keys
    ```
5.  Redeploy to apply environment variables:
    ```bash
    npx vercel --prod
    ```

## 3. Common Issues

- **Build Fails**: Check the build logs on Vercel. Ensure `npm run build` passes locally.
- **Environment Variables**: If the app loads but data is missing or API calls fail, double-check that all Environment Variables are added in Vercel.
