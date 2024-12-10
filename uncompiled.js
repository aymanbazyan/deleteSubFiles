const fs = require("fs");
const ytpl = require("ytpl");
const ytdl = require("@distube/ytdl-core"); // CommonJS
const path = require("path");

const { PLAYLIST_URL, OUTPUT_DIR, QUALITY, ADD_INDEX, DELETE_STR } = fs
  .readFileSync("./config.txt", { encoding: "utf-8" })
  .split("\n")
  .filter((line) => line?.trim() && !line?.startsWith("#"))
  .reduce((acc, line) => {
    const [key, value] = line?.replaceAll("\r", "")?.split(" = ");
    acc[key] = value;
    return acc;
  }, {});

async function downloadPlaylist(
  playlistUrl,
  outputDir,
  quality,
  addIndex,
  deleteStr
) {
  try {
    if (!ytpl.validateID(playlistUrl)) {
      throw new Error("Invalid playlist URL");
    }

    console.log("Getting playlist...");
    const playlist = await ytpl(playlistUrl);
    console.log(`Downloading playlist: ${playlist.title}`);
    // console.log(playlist);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const [i, video] of playlist.items.entries()) {
      const videoUrl = video.shortUrl;
      let videoTitle = video.title.replaceAll(/[\\/:*?"<>|]/g, ""); // Sanitize filename
      if (deleteStr?.trim()) videoTitle = videoTitle.replaceAll(deleteStr, "");

      const outputPath = path.join(
        outputDir,
        `${eval(addIndex?.toLowerCase()) ? `${i + 1} ` : ""}${videoTitle}.mp4`
      );

      console.log(`Downloading: ${videoTitle}`);
      const videoStream = ytdl(videoUrl, {
        quality,
        requestOptions: {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        },
      });

      videoStream.pipe(fs.createWriteStream(outputPath));

      await new Promise((resolve, reject) => {
        videoStream.on("end", resolve);
        videoStream.on("error", reject);
      });
    }

    console.log("Download completed!");
  } catch (err) {
    console.log(err);
  }
}

downloadPlaylist(PLAYLIST_URL, OUTPUT_DIR, QUALITY, ADD_INDEX, DELETE_STR).then(
  () => {
    console.log("Press C + CTRL to exit.");
    process.stdin.resume(); // Keeps the event loop active
  }
);
