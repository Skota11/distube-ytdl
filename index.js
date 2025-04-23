import { serve } from "@hono/node-server";
import { Hono } from "hono";
import ytdl from "@distube/ytdl-core";

const app = new Hono();

app.get("/", async (c) => {
  const videoId = c.req.query("v");
  const quality = c.req.query("quality") || "highestaudio";

  if (!videoId) {
    return c.json({ error: "Video ID is required" }, 400);
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const info = await ytdl.getInfo(videoUrl);
  const format = ytdl.chooseFormat(info.formats, { quality: quality });

  return c.json({
    title: info.videoDetails.title,
    downloadUrl: format.url,
    thumbnail: info.videoDetails.thumbnails[0].url,
  });
});
app.get("/track", async (c) => {
  const videoId = c.req.query("v");

  if (!videoId) {
    return c.json({ error: "Video ID is required" }, 400);
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const info = await ytdl.getInfo(videoUrl);

  const engagementPanel = info.response.engagementPanels.find((d) => {
    return (
      d.engagementPanelSectionListRenderer.panelIdentifier ==
      "engagement-panel-structured-description"
    );
  });
  const songs =
    engagementPanel.engagementPanelSectionListRenderer.content.structuredDescriptionContentRenderer.items.find(
      (d) => {
        return d.horizontalCardListRenderer !== undefined;
      }
    );
  if (songs) {
    return c.json({
      song: true,
      title:
        songs.horizontalCardListRenderer.cards[0].videoAttributeViewModel.title,
      artist:
        songs.horizontalCardListRenderer.cards[0].videoAttributeViewModel
          .subtitle,
      thumbnail:
        songs.horizontalCardListRenderer.cards[0].videoAttributeViewModel.image
          .sources[0].url,
    });
  } else {
    return c.json({ song: false });
  }
});

serve({
  fetch: app.fetch,
  port: 10000,
});
