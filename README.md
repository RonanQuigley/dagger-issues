# Dagger-Issues

There are two primary issues:

1. The absence of `withCache` feature (refer to https://github.com/dagger/dagger/issues/5635) results in slow reinstallation of node modules. The process is approximately 17 times slower due to this missing feature in Dagger.

2. The process of Dagger copying data from one container to another is significantly slow. It takes around 20 seconds in this reproduction, but the time can easily escalate to minutes if you're dealing with 1GB+ of node modules.

These issues wouldn't be as noticeable in a Golang project because you typically ship a single binary. However, with Node.js, you're required to ship the entire node modules directory.

You could fix the copy issue by zipping the node modules directory and then copying that. However, this approach just shifts the performance woes to compressing zipped files.
