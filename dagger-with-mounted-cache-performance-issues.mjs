import { connect } from "@dagger.io/dagger";

connect(
  async (client) => {
    const nodeCache = client.cacheVolume("node");
    const berryCache = client.cacheVolume("berry-cache");
    const source = client
      .container()
      .from("node:20-slim")
      .withEntrypoint(["/bin/bash", "-c"])
      .withExec("yarn set version stable")
      .withWorkdir("/src")
      .withDirectory(
        "/src",
        client.host().directory(".", {
          exclude: ["node_modules/", ".yarn/", "dagger.mjs", "*.tar.gz"]
        })
      );

    const cacheButPreseveNodeModules = source
      .withMountedCache("/root/.yarn/berry/cache", berryCache)
      .withEnvVariable("BUST", Math.random().toString());

    const cacheButLoseNodeModules = source
      .withMountedCache("/src/node_modules", nodeCache)
      .withEnvVariable("BUST", Math.random().toString());

    console.log("RUNNING CACHE BUT PRESERVE NODE MODULES");

    await cacheButPreseveNodeModules
      .withExec(
        "echo 'YARN INSTALL ------ BERRY DIRECTORY FOR CACHE AND PRESERVE NODE MODULES ON EXPORT:'"
      )
      .withExec("yarn install")
      .withExec(
        "echo 'BERRY DIRECTORY FOR CACHE AND PRESERVE NODE MODULES ON EXPORT:'"
      )
      .withExec("ls -la node_modules/")
      .export("./preserve-node-modules.tar.gz");

    console.log("RUNNING CACHE BUT LOSE MODULES");
    await cacheButLoseNodeModules
      .withExec(
        "echo 'YARN INSTALL ------ NODE MODULES DIRECTORY FOR CACHE BUT LOSE NODE MODULES ON EXPORT:'"
      )
      .withExec("yarn install")
      .withExec(
        "echo 'NODE MODULES DIRECTORY FOR CACHE BUT LOSE NODE MODULES ON EXPORT:'"
      )
      .withExec("ls -la node_modules/")
      .export("./lose-node-modules.tar.gz");
  },
  { LogOutput: process.stdout }
);
