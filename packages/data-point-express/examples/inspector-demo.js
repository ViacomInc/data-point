const Express = require("express");
const Service = require("../lib");
const entities = require("./entities");

const app = new Express();

Service.create({ entities })
  .then(service => {
    // creates an inspect route
    // only use this in NON Production
    // environments.
    app.use("/api/inspect", service.inspector());

    app.listen(3000, err => {
      if (err) {
        throw err;
      }
      // eslint-disable-next-line no-console
      console.info(
        "Inspector available at",
        "http://localhost:3000/api/inspect"
      );
    });
  })
  .catch(error => {
    // eslint-disable-next-line no-console
    console.info("Failed to Create Service");
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
