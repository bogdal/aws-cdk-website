import { App, Stack, StackProps } from "@aws-cdk/core";

import { SinglePageApplication } from "./src";

class WebsiteStack extends Stack {
  constructor(parent: App, name: string, props: StackProps) {
    super(parent, name, props);

    new SinglePageApplication(this, "SPA", {
      bucketName: this.node.tryGetContext("bucket_name"),
      enableSSR: this.node.tryGetContext("enable_ssr"),
      ssrServiceUrl: this.node.tryGetContext("ssr_service_url")
    });
  }
}

const app = new App();

new WebsiteStack(app, "Website", { env: { region: "us-east-1" } });

app.synth();
