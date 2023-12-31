const router = require("express").Router();
const { Sighting, Fruit, Location, Profile } = require("../../models");

router.post("/", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      // TODO: Conceive de-duplication logic, add de-duplication logic to Location model, move Location POST to its own api route.
      const locationData = await Location.create({
        name: req.body.locationName,
        city: req.body.locationCity,
        state: req.body.locationState,
      });
      const sightingData = await Sighting.create({
        fruit_id: req.body.fruitId,
        profile_id: req.session.profile_id,
        location_id: locationData.id,
      });
      res.status(200).json({ sightingData });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  } else {
    res
      .status(400)
      .send({ message: "You must be logged in to add a sighting!" });
  }
});

//Get an individual sighting
router.get("/:id", async (req, res) => {
  try {
    const sightingData = await Sighting.findByPk(req.params.id, {
      include: [
        {
          model: Fruit,
          attributes: ["name"],
        },
        {
          model: Location,
          attributes: ["name", "city", "state"],
        },
      ],
    });
    const sighting = sightingData.get({ plain: true });
    res.render("sighting-details", {
      fruitName: sighting.fruit.name,
      timestamp: sighting.createdAt,
      locationName: sighting.location.name,
      city: sighting.location.city,
      state: sighting.location.state,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
