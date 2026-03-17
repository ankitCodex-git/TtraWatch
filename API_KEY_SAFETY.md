# 🛡️ Securing Your YouTube API Key

When you host a web application, keeping your API keys safe is critical. If a key is exposed, someone else could use your quota, potentially leading to extra costs or your key being disabled by Google.

Here is how to keep your key secure in this project.

---

## 1. The "Safety Lock" (API Restrictions) — **MUST DO**
This is the most effective way to protect a key that is used in a frontend application (like React/Vite). You tell Google: *"Only allow this key to work on MY website."*

1.  **Go to Google Cloud Console**: Navigate to the [API Credentials page](https://console.cloud.google.com/apis/credentials).
2.  **Edit your API Key**: Click on the name of your key.
3.  **Set Application Restrictions**:
    *   Under **Website restrictions**, select **Websites (HTTP referrers)**.
    *   Click **Add**.
    *   Enter your website URL (e.g., `https://your-app-name.netlify.app/*`).
    *   *Tip: Add `http://localhost:3000/*` if you want it to work while you are developing locally.*
4.  **Set API Restrictions**:
    *   Select **Restrict key**.
    *   From the dropdown, select **YouTube Data API v3**.
5.  **Save**: Click **Save** at the bottom.

**Result**: Even if a hacker steals your key, it will be useless to them because their website URL won't match your approved list.

---

## 2. Environment Variables (`.env`)
Never hardcode your API key directly in a file that you might upload to GitHub. Instead, use a `.env` file.

1.  **Create a `.env` file** in the root directory:
    ```env
    VITE_YOUTUBE_API_KEY=your_actual_key_here
    ```
2.  **Use it in your code**:
    In Vite, you can access this key using `import.meta.env.VITE_YOUTUBE_API_KEY`.
3.  **Add to `.gitignore`**: Ensure your `.env` file is listed in `.gitignore` (it is already included in this project's `.gitignore`).

---


## 3. Summary Checklist
- [ ] I have restricted my key to my website's domain in Google Cloud Console.
- [ ] I have restricted my key to only use the YouTube Data API.
- [ ] I have **NOT** committed my API key to a public GitHub repository.
- [ ] I am using a `.env` file for local development.
