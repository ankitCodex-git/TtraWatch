# TtraWatch 📺

TtraWatch is a focused, productivity-first YouTube playlist manager and video player designed for organized learning. It allows users to curate their educational content into custom playlists, providing a distraction-free environment for deep work and skill acquisition.

![TtraWatch Screenshot](Screenshot.png)

## 🚀 Purpose

The primary goal of TtraWatch is to solve the problem of distraction on YouTube. By extracting videos into a dedicated management tool, users can:
- **Focus on Learning:** Eliminate recommendations, comments, and other distractions.
- **Stay Organized:** Categorize videos into specific subjects (e.g., Math, Physics, Chemistry).
- **Track Progress:** Monitor learning milestones with completion tracking and statistics.

## ✨ Key Features

- **Custom Playlists:** Create, edit, and manage multiple playlists for different learning paths.
- **Video Management:** Add YouTube videos easily via URL with automatic thumbnail integration.
- **Progress Tracking:** Mark videos as "Active" or "Completed" and visualize your progress with dynamic progress bars.
- **Dashboard Overview:** Get a bird's-eye view of your learning stats, including total videos and completion rates.
- **Search & Filter:** Quickly find specific playlists or videos in your library.
- **Modern UI/UX:** A clean, responsive interface with smooth animations and intuitive navigation.
- **Security Focused:** Built-in protection against common web vulnerabilities like XSS and DDoS.

## 🛠️ Tech Stack

- **Frontend:**
  - Vanilla JavaScript (SPA Architecture)
  - Custom CSS (Tailwind-inspired styling)
  - [Lucide](https://lucide.dev/) for iconography
  - [Motion](https://motion.dev/) for smooth animations
- **Backend:**
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  - [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for lightweight, fast data storage
- **Security:**
  - [Helmet](https://helmetjs.github.io/) for secure HTTP headers
  - [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit) for DDoS protection
  - [Sanitize-HTML](https://www.npmjs.com/package/sanitize-html) for XSS prevention
- **Build Tool:**
  - [Vite](https://vitejs.dev/)

## 🏁 Getting Started

### Prerequisites
- Node.js installed on your machine.

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the development server (runs both backend and frontend via Vite):
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Production Build
To create a production-ready build:
```bash
npm run build
```
> ⚠️ **Important**: In order to add an entire playlist at once, you **must** have the **Google YouTube Data API v3** enabled and configured. Make sure to set up your API key before proceeding with the security guidelines below.

---

# 🛡️ Securing Your YouTube API Key

When you host a web application, keeping your API keys safe is critical. If a key is exposed, someone else could use your quota, potentially leading to extra costs or your key being disabled by Google. (FYI API is free so do not worry)

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

Designed with ❤️ by AnkitCodex for focused learners.
