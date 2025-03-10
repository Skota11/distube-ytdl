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

serve({
  fetch: app.fetch,
  port: 3001,
});
