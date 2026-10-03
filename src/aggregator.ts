const GITHUB_TOKEN = process.env.GH_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TARGET_USERNAME = 'Behzad1408'; 

const today = new Date();
const CURRENT_DATE_ISO = today.toISOString().split('T')[0];

const yesterdayDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const YESTERDAY_ISO = yesterdayDate.toISOString().split('T')[0];

const lastWeekDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
const LAST_WEEK_ISO = lastWeekDate.toISOString().split('T')[0];

async function queryGithubApi(endpoint: string) {
    const response = await fetch(`https://api.github.com${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Trends-Aggregator'
        }
    });
    
    if (!response.ok) {
        throw new Error(`GitHub API Exception: ${response.status} on ${endpoint}`);
    }
    return response.json();
}

async function dispatchTelegramAlert(reportPayload: string) {
    const endpoint = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: reportPayload,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        })
    });
    
    if (!response.ok) {
        console.error('Failed to dispatch alert to Telegram:', await response.text());
    }
}

async function generateTrendsDigest() {
    try {
        console.log(`[INIT] Aggregating GitHub trends for ${CURRENT_DATE_ISO}...`);
        let digestBuffer = `📊 <b>GitHub Trends Digest (${CURRENT_DATE_ISO})</b>\n\n`;

        // --- 1. Network Activity (People you are FOLLOWING) ---
        digestBuffer += `🌟 <b>Following Network Stars:</b>\n`;
        const networkConnections = await queryGithubApi(`/users/${TARGET_USERNAME}/following?per_page=100`);
        
        const activityPromises = networkConnections.map(async (connection: any) => {
            const rawEvents = await queryGithubApi(`/users/${connection.login}/events/public`);
            const recentWatchEvents = rawEvents.filter((event: any) => {
                return event.type === 'WatchEvent' && event.created_at.startsWith(CURRENT_DATE_ISO);
            });
            return { 
                username: connection.login, 
                starredRepos: recentWatchEvents.map((e: any) => e.repo.name) 
            };
        });

        const networkActivity = await Promise.all(activityPromises);
        let foundNewStars = false;

        networkActivity.forEach(activity => {
            // حذف نام‌های تکراری در صورتی که یک نفر به یک پروژه چندبار اکشن داده باشد
            const uniqueRepos = [...new Set(activity.starredRepos)];
            
            if (uniqueRepos.length > 0) {
                foundNewStars = true;
                digestBuffer += `👤 <b>${activity.username}</b>\n`;
                uniqueRepos.forEach((repoName: unknown) => {
                    digestBuffer += `  ▫️ <a href="https://github.com/${repoName}">${repoName}</a>\n`;
                });
            }
        });

        if (!foundNewStars) {
            digestBuffer += `  ▫️ <i>No new stars from your network today.</i>\n`;
        }
        digestBuffer += `\n`;

        // --- 2. Daily Global Trends ---
        digestBuffer += `🔥 <b>Daily Global Trending:</b>\n`;
        const dailyTrendingRepos = await queryGithubApi(`/search/repositories?q=created:>${YESTERDAY_ISO}&sort=stars&order=desc&per_page=3`);
        dailyTrendingRepos.items.forEach((repo: any) => {
            digestBuffer += `  ▫️ <a href="${repo.html_url}">${repo.full_name}</a> (⭐ ${repo.stargazers_count})\n`;
        });
        digestBuffer += `\n`;

        // --- 3. Weekly Global Trends ---
        digestBuffer += `🏆 <b>Weekly Global Trending:</b>\n`;
        const weeklyTrendingRepos = await queryGithubApi(`/search/repositories?q=created:>${LAST_WEEK_ISO}&sort=stars&order=desc&per_page=3`);
        weeklyTrendingRepos.items.forEach((repo: any) => {
            digestBuffer += `  ▫️ <a href="${repo.html_url}">${repo.full_name}</a> (⭐ ${repo.stargazers_count})\n`;
        });

        // --- Dispatch ---
        await dispatchTelegramAlert(digestBuffer);
        console.log("[SUCCESS] Digest generated and dispatched successfully.");

    } catch (error) {
        console.error('[FATAL] Exception during aggregation:', error);
        await dispatchTelegramAlert(`⚠️ <b>Aggregator Exception:</b>\n<pre>${error}</pre>`);
    }
}

// Execute routine
generateTrendsDigest();