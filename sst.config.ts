/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "logistic",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const vpc = new sst.aws.Vpc("MyVpc", { bastion: true });
    const rds = new sst.aws.Postgres("MyPostgres", { vpc });

    const DATABASE_URL = $interpolate`postgresql://${rds.username}:${rds.password}@${rds.host}:${rds.port}/${rds.database}`;

    new sst.x.DevCommand("Prisma", {
      environment: { DATABASE_URL },
      dev: {
        autostart: false,
        command: "npx prisma studio",
      },
    });

    const cluster = new sst.aws.Cluster("MyCluster", { vpc });

    new sst.aws.Service("MyService", {
      cluster,
      link: [rds],
      environment: { DATABASE_URL },
      loadBalancer: {
        ports: [{ listen: "80/http" }],
      },
      dev: {
        command: "node --watch index.mjs",
      },
    });
  },

});
