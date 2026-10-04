# GitHub Trends Aggregator

Have you ever wanted to know what repositories the developers you follow are starring, without scrolling through GitHub's cluttered feed? That's exactly why I built this.

This is a lightweight, serverless tool that tracks what your network is starring, grabs the top global trends, and drops a clean daily digest straight into your Telegram. It's designed to keep you in the loop with the open-source ecosystem, entirely on autopilot.

## Why I Built This (Features)

- **Network Radar:** Instead of manually checking profiles, it monitors `WatchEvent` payloads from the people you follow to help you discover hidden gems in your immediate network.
- **Global Trends:** Since GitHub doesn't have a direct "trending" API, this simulates it by querying the Search API for the top-starred repositories created in the last 24 hours and 7 days.
- **Zero-Server Setup:** It runs 100% on GitHub Actions. You don't need a VPS, and you don't need to leave your computer on. 
- **Built for Speed:** It uses asynchronous `Promise.all` mapping to fetch event streams concurrently, so it doesn't get bogged down by sequential network requests.
- **Set & Forget:** I added a keepalive mechanism so GitHub doesn't automatically suspend the cron job after 60 days of inactivity.

## Tech Stack & Architecture

I wanted to keep this project as minimal and native as possible, avoiding heavy dependencies or complex build steps:

- **Language:** TypeScript 
- **Runtime:** Node.js (v20+) using the native `fetch` API.
- **Compute:** GitHub Actions (`ubuntu-latest` runners).
- **Security:** GitHub Secrets (Tokens are never hardcoded).
- **Execution:** `tsx` (Allows us to run TypeScript directly without a pre-compilation step).

## Run Your Own Instance

Want to set this up for yourself? It's pretty straightforward.

### 1. Clone & Setup
First, fork or clone this repository. 
*Note: Feel free to keep your repository **Public** to show it off on your portfolio! As long as you use GitHub Secrets for your keys, your credentials are completely safe.*

```bash
git clone [https://github.com/YOUR_USERNAME/github-trends-aggregator.git](https://github.com/YOUR_USERNAME/github-trends-aggregator.git)
cd github-trends-aggregator
npm install

```

*(Don't forget to update the `TARGET_USERNAME` constant in `src/aggregator.ts` to your own GitHub username!)*

### 2. Configure Secrets

To let the script talk to GitHub and Telegram securely, head over to your repository's **Settings > Secrets and variables > Actions** and add these three secrets:

| Secret Key | What is it? |
| --- | --- |
| `GH_TOKEN` | A GitHub Personal Access Token with `read:user` scope. We need this to bypass the strict unauthenticated rate limits. |
| `TELEGRAM_BOT_TOKEN` | The HTTP API token you get from [@BotFather](https://t.me/BotFather) when creating your Telegram bot. |
| `TELEGRAM_CHAT_ID` | Your Telegram User ID where you want the bot to send the daily digest. |

### 3. Deployment

That's it! Once you push the code and set up the secrets, the deployment is fully automated.

The workflow is handled by `.github/workflows/tracker.yml` and is scheduled to run every day at `23:59 UTC`:

```yaml
on:
  schedule:
    - cron: '59 23 * * *'
  workflow_dispatch: # Lets you click a button to run it manually

```

### 4. Take it for a Spin

You don't have to wait until midnight to see if it works:

1. Go to the **Actions** tab in your repository.
2. Click on **Daily GitHub Tracker Bot** in the left sidebar.
3. Click the **Run workflow** button.
4. Check your Telegram—you should receive your first HTML-formatted digest in a few seconds!

## Project Structure

```text
github-trends-aggregator/
├── .github/
│   └── workflows/
│       └── tracker.yml      # The brain of the automation
├── src/
│   └── aggregator.ts        # Core logic and API calls
├── package.json             # Minimal dependencies (tsx)
└── README.md

```

## License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).
