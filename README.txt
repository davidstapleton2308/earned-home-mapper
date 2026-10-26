Earned Home Mapper V3 - private-first offline-data capture.
Host this folder on an HTTPS static host (e.g. Netlify Drop). The application code is publicly accessible if hosted on a public URL, but app content is stored in IndexedDB locally and does not intentionally upload media to the host.
Capture photos, videos, and optional microphone narrations. Browser dictation may be used via iOS keyboard. No automated video transcription or image recognition is included; data is for review/export to ChatGPT.
Export room ZIP after each room. Archives are uncompressed (larger files), checked with CRC32, and capped at 120 MB for safety. They can be restored using the Backup tab. Files and metadata are saved on the current browser origin. If the hosting URL changes, import a backup to restore.
Do not map private papers, passwords, keys, alarm codes or identifiable third-party belongings.
