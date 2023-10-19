import { connect } from "@dagger.io/dagger";

connect(
  async (client) => {
    const nodeCache = client.cacheVolume("node");
    const berryCache = client.cacheVolume("berry-cache");
    const source = client
      .pipeline("dagger-merge-op-copy-thing", {
        description: "this demonstrates the merge op/copy performance issues"
      })
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
      )
      .withMountedCache("/root/.yarn/berry/cache", berryCache)
      .withEnvVariable("BUST", Math.random().toString())
      .withExec("yarn install");

    await client
      .container()
      .from("node:20-slim")
      .withEntrypoint(["/bin/bash", "-c"])
      .withDirectory("/src/node_modules", source.directory("/src/node_modules"))
      .withExec("ls -la")
      .sync();
  },
  { LogOutput: process.stdout }
);
