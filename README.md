```markdown
# 📊 GitHub Trends Aggregator

A serverless, event-driven automation tool that aggregates GitHub activity and global repository trends, dispatching daily digests directly to Telegram. 

Designed to keep developers informed about their network's activities and the broader open-source ecosystem without requiring manual navigation or continuous context-switching.

## ✨ Features

- **Network Intelligence (Stargazer Tracker):** Monitors `WatchEvent` payloads from your GitHub followers to discover new repositories gaining traction within your immediate network.
- **Global Trends Aggregation:** Simulates GitHub's trending page by querying the Search API for top-starred repositories created in the last 24 hours (Daily) and 7 days (Weekly).
- **Serverless Automation:** Fully powered by GitHub Actions using scheduled cron jobs, requiring zero external server infrastructure.
- **Concurrent Execution:** Utilizes asynchronous `Promise.all` mapping to concurrently fetch event streams, significantly reducing I/O bottleneck time.
- **Resilience:** Implements a keepalive mechanism to prevent GitHub from suspending the cron job due to repository inactivity.

## 🏗 Architecture & Tech Stack

This project is built with minimalism and native APIs in mind, avoiding heavy dependencies.

- **Language:** TypeScript
- **Runtime:** Node.js (v20+) utilizing the native `fetch` API.
- **CI/CD & Compute:** GitHub Actions (`ubuntu-latest` runners).
- **Security:** GitHub Secrets (Libsodium sealed boxes) for credential injection.
- **Execution Script:** `tsx` for direct TypeScript execution without a pre-compilation step.

## 🚀 Setup & Installation

### 1. Repository Preparation
Fork or clone this repository to your local machine. Ensure the repository visibility is set to **Private** to protect your network analytics if preferred.

```bash
git clone [https://github.com/YOUR_USERNAME/github-trends-aggregator.git](https://github.com/YOUR_USERNAME/github-trends-aggregator.git)
cd github-trends-aggregator
npm install

```

*Note: Update the `TARGET_USERNAME` constant in `src/aggregator.ts` to your own GitHub username.*

### 2. Environment Variables & Secrets

To enable the GitHub Action to run securely, you must configure the following repository secrets. Navigate to **Settings > Secrets and variables > Actions > New repository secret**:

| Secret Key | Description |
| --- | --- |
| `GH_TOKEN` | A GitHub Personal Access Token (Classic) with `read:user` scope. Essential to bypass the 60 requests/hour unauthenticated rate limit. |
| `TELEGRAM_BOT_TOKEN` | The HTTP API token obtained from [@BotFather](https://t.me/BotFather) upon creating your Telegram bot. |
| `TELEGRAM_CHAT_ID` | Your personal Telegram user ID (or Group ID) where the digest will be dispatched. |

### 3. Deployment

Once the code is pushed and secrets are configured, the deployment is entirely automated.

The workflow is located at `.github/workflows/tracker.yml`. By default, it is scheduled to run daily at `23:59 UTC`:

```yaml
on:
  schedule:
    - cron: '59 23 * * *'
  workflow_dispatch: # Allows manual trigger

```

### 4. Manual Trigger (Testing)

To verify the integration:

1. Navigate to the **Actions** tab in your repository.
2. Select **Daily GitHub Tracker Bot** from the left sidebar.
3. Click **Run workflow**.
4. You should receive the HTML-formatted digest in your Telegram app within seconds.

## 📂 Project Structure

```text
github-trends-aggregator/
├── .github/
│   └── workflows/
│       └── tracker.yml      # CI/CD and Cron configuration
├── src/
│   └── aggregator.ts        # Core aggregation and dispatch logic
├── package.json             # Minimal dependencies (tsx)
└── README.md

```

## 🛡 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).


```