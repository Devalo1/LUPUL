import type { Plugin } from "vite";
import type { OutputChunk } from "rollup";

export function debugLoggingPlugin(): Plugin {
  return {
    name: "debug-logging",
    generateBundle(options, bundle) {
      // eslint-disable-next-line no-console
      console.log("\n🔍 [DEBUG] Analyzing generated bundle...");
      // eslint-disable-next-line no-console
      console.log("📁 Output directory:", options.dir || "dist");

      const chunks = Object.entries(bundle).filter(
        ([, chunk]) => chunk.type === "chunk"
      );
      const assets = Object.entries(bundle).filter(
        ([, chunk]) => chunk.type === "asset"
      );

      // eslint-disable-next-line no-console
      console.log(
        `\n📦 Generated ${chunks.length} chunks and ${assets.length} assets`
      );

      // Log toate chunk-urile
      chunks.forEach(([fileName, chunk]) => {
        const chunkData = chunk as OutputChunk;
        // eslint-disable-next-line no-console
        console.log(`\n🧩 Chunk: ${fileName}`);
        // eslint-disable-next-line no-console
        console.log(`   Type: ${chunkData.type}`);
        // eslint-disable-next-line no-console
        console.log(`   Is Entry: ${chunkData.isEntry}`);
        // eslint-disable-next-line no-console
        console.log(`   Is Dynamic Entry: ${chunkData.isDynamicEntry}`);
        if (chunkData.facadeModuleId) {
          // eslint-disable-next-line no-console
          console.log(`   Facade Module: ${chunkData.facadeModuleId}`);
        }
        if (chunkData.imports.length > 0) {
          // eslint-disable-next-line no-console
          console.log(`   Imports: ${chunkData.imports.join(", ")}`);
        }
        if (chunkData.dynamicImports.length > 0) {
          // eslint-disable-next-line no-console
          console.log(
            `   Dynamic Imports: ${chunkData.dynamicImports.join(", ")}`
          );
        }
      });

      // Verifică specific modulele Emotion
      const emotionChunks = chunks.filter(([fileName]) =>
        fileName.includes("emotion")
      );
      if (emotionChunks.length > 0) {
        // eslint-disable-next-line no-console
        console.log("\n❤️ Emotion chunks found:");
        emotionChunks.forEach(([fileName, chunk]) => {
          // eslint-disable-next-line no-console
          console.log(`   - ${fileName} (${chunk.type})`);
        });
      } else {
        // eslint-disable-next-line no-console
        console.log("\n⚠️ No Emotion chunks found!");
      }

      // Log asset-urile
      if (assets.length > 0) {
        // eslint-disable-next-line no-console
        console.log("\n📄 Assets:");
        assets.forEach(([fileName, asset]) => {
          // eslint-disable-next-line no-console
          console.log(`   - ${fileName} (${asset.type})`);
        });
      }
    },
    writeBundle(options, _bundle) {
      // eslint-disable-next-line no-console
      console.log("\n✅ [DEBUG] Bundle written to disk");
      // eslint-disable-next-line no-console
      console.log("📍 Output dir:", options.dir);

      // Simplu log fără verificare pe disk pentru a evita erorile cu require("fs")
      // eslint-disable-next-line no-console
      console.log(
        "💾 Check the dist/assets folder manually to verify Emotion files"
      );
    },
  };
}
