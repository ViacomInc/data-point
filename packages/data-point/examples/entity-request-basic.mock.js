const nock = require("nock");

module.exports = () => {
  nock("https://swapi.co")
    .get("/api/people/1/")
    .reply(200, {
      name: "Luke Skywalker",
      height: "172",
      mass: "77",
      hair_color: "blond",
      skin_color: "fair",
      eye_color: "blue",
      birth_year: "19BBY",
      gender: "male"
    });
};
