# 🎵 Soprano

A music app that lets you search and download songs directly to your phone using yt-dlp.

---

## Requirements

- Internet connection for downloading the songs
- After that playback is completely offline

---

## Part 1 — Server Setup (Termux)

The app requires a local server running on a phone. This is what handles searching and downloading songs.

### Steps

1. Install **Termux** from the [Play Store](https://play.google.com/store/apps/details?id=com.termux)
2. Open Termux and run the following command:

```bash
curl -s https://raw.githubusercontent.com/ClimateOP/soprano-server/main/setup.sh | bash
```

3. Wait for the setup to complete — it will install all dependencies and start the server automatically.

4. The server will also auto-start every time you open Termux.

5. You can close the Termux session anytime you want by pressing exit through notifications

---

## Part 2 — App Installation (APK)

1. Go to the [Releases](https://github.com/ClimateOP/soprano/releases) page
2. Download the latest `app-release.apk`
3. Open the downloaded file on your Android phone
4. If prompted, enable **"Install from unknown sources"** in your Android settings
5. Complete the installation

---

## How It Works

The app and the server must be running on the **same phone**. The app automatically detects the device's IP address and connects to the local server — no manual configuration needed.

---

## Troubleshooting

**App can't connect to server**

- Make sure Termux is open and the server is running
- Try closing and reopening Termux

**"Install from unknown sources" prompt**

- Click on Settings → Enable "Allow from this source"
- Or else, Go to Settings → Security → Unknown source installations → Enable your browser
