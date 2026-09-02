# BGS Chat Asset Escrow Release Guide

The source ZIP is prepared for FiveM Asset Escrow. The Cfx Portal performs the actual encryption after upload.

## Protection scope

Protected by the Portal:

- `client/main.lua`
- `server/main.lua`

Intentionally left accessible through `escrow_ignore`:

- `config.lua` so server owners can configure the resource.
- `html/index.html`, `html/style.css`, and `html/app.js` because FiveM Asset Escrow does not currently support NUI encryption.

The manifest and documentation remain readable as normal resource metadata and support files.

## Upload to the Cfx Portal

1. Sign in to the Cfx Portal using the account that will own the asset.
2. Open **Assets** and choose **Create an asset**.
3. Select a script/resource asset and name it **BGS Chat**.
4. Upload the complete release ZIP without changing its internal folder structure.
5. Wait for Portal processing and confirm the asset finishes successfully.
6. Download the processed copy to a server owned by the creator and perform one final live test.

## Connect it to Tebex

1. Open the BGS Chat package in Tebex.
2. Configure the package delivery content.
3. Select **FiveM Asset**.
4. Choose **BGS Chat** from the asset list.
5. Save and publish the package.

FiveM escrowed assets must be distributed through a Tebex package. Do not upload the unprocessed source ZIP as a normal downloadable file for customers.

## Updating the release

1. Keep the resource folder name `bgs_chat`.
2. Update and test the source locally.
3. Increase the version in `fxmanifest.lua` and `CHANGELOG.md`.
4. Build a fresh ZIP.
5. Open the existing asset under **Created Assets** in the Cfx Portal.
6. Use **Re-Upload** so customers retain entitlement to the same asset.
7. Test the newly processed copy before announcing the update.

## Important limitation

Asset Escrow currently supports Lua and selected streamed model formats, but not NUI. The permission checks, channel routing, filtering, cooldowns, proximity calculations, and framework/job validation remain in the protected Lua files. The visible interface files remain readable because the game must load them as NUI.
