const Express = require("express");
const Service = require("../lib");
const entities = require("./entities");

const app = new Express();

Service.create({
  // add entries using
  // Shorthand property names (ES2015)
  entities
})
  .then(service => {
    // create Express routes

    // creates an inspect route
    // only use this in NON Production
    // environments.
    app.use("/api/inspect", service.inspector());

    // create api routes
    app.get("/api/hello-world", service.mapTo("reducer:HelloWorld"));
    app.get("/api/person/:personId", service.mapTo("entry:getPerson"));

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
