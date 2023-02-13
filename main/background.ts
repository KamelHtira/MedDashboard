import { app } from "electron";
import serve from "electron-serve";
import { ipcMain } from "electron";
import { createWindow } from "./helpers";


const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("mainWin", {
    width: 1400,
    height: 700,
    center: true,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./login.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/login`);

    // handle download event
    ipcMain.on("download", (event, { payload }) => {
      console.log(payload.url);
      fetch(payload.url, {
        method: "POST",
        body: JSON.stringify(payload.data),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((json) => {
          mainWindow.webContents.downloadURL(json.download_url);
        })
        .catch((error) => {
          console.error(error);
        });
    });
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});
