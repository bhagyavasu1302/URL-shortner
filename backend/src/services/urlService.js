import { Click } from "../models/Click.js";
import { Url } from "../models/Url.js";
import { ApiError } from "../utils/apiError.js";
import { generateShortCode } from "../utils/shortCode.js";

export async function createUrl({ owner, originalUrl, customAlias, expiresAt }) {
  const attempts = customAlias ? 1 : 5;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await Url.create({
        owner,
        originalUrl,
        shortCode: customAlias ?? generateShortCode(7),
        expiresAt: expiresAt ?? null,
      });
    } catch (error) {
      if (error?.code !== 11000) throw error;
      if (customAlias) return null;
    }
  }

  throw new ApiError(
    503,
    "CODE_ALLOCATION_FAILED",
    "Could not allocate a unique short code; please try again",
  );
}

export async function buildAnalytics(urlId, days) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [totalClicks, daily, browsers, referrers, recent] = await Promise.all([
    Click.countDocuments({ url: urlId }),
    Click.aggregate([
      { $match: { url: urlId, clickedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$clickedAt" } },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Click.aggregate([
      { $match: { url: urlId, clickedAt: { $gte: since } } },
      { $group: { _id: "$browser", clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
      { $limit: 5 },
    ]),
    Click.aggregate([
      { $match: { url: urlId, clickedAt: { $gte: since } } },
      { $group: { _id: "$referrer", clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
      { $limit: 5 },
    ]),
    Click.find({ url: urlId }).sort({ clickedAt: -1 }).limit(10).lean(),
  ]);

  return {
    totalClicks,
    days,
    clicksPerDay: daily.map(({ _id, clicks }) => ({ date: _id, clicks })),
    topBrowsers: browsers.map(({ _id, clicks }) => ({ name: _id, clicks })),
    topReferrers: referrers.map(({ _id, clicks }) => ({ name: _id, clicks })),
    recentClicks: recent.map(({ clickedAt, browser, device, referrer }) => ({
      clickedAt,
      browser,
      device,
      referrer,
    })),
  };
}
