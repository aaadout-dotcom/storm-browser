/*
 * Storm release config, the ONLY place you need to edit when you ship a build.
 * Every download button and checksum on the site reads from here.
 * (Also update updates/latest.json so the in-app auto-updater sees the release.)
 */
window.STORM_RELEASE = {
  version: "1.1.0",
  date: "2026-11-18",
  downloadUrl: "https://github.com/aaadout-dotcom/storm-browser/releases/download/v1.1.0/Storm.exe",
  fileName: "Storm.exe",
  sizeLabel: "79 MB",            // e.g. "92 MB", leave empty to hide

  sha256: "2f2c8bd8e43d6fd48b02b3bf3babbcbe4bc3280b0ccfded347e9d07efa3ccd7f"
};

/* Paid add-ons checkout. Buttons link to <base>/rainshield, <base>/mirage, <base>/rainprotection. */
window.STORM_BUY_BASE = "https://storm-sync.stormbrowser.workers.dev/v1/buy";
