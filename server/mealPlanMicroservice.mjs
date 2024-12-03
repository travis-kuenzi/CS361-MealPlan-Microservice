import express from 'express';
import mongoose from 'mongoose';
import { default as MealPlan } from "./mealPlanModel.mjs";
import { default as credentials } from "./dbCredentials.mjs";

// Connect to MongoDB
const connection_string = credentials.connection_string;
mongoose
    .connect(connection_string, {})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

const app = express();
app.use(express.json());


// eventually I would like to scale up to allow for multiple recipes in one meal... side dishes, dessert, etc!
app.post("/updateMealPlan", async(req, res) => {
    const { data } = req.body;

    // right now we just replace any existing entry, in the future we should verify with user!
    const existingMealPlan = await MealPlan.findOneAndUpdate(
        { weekOf: data.weekOf, userID: data.userID },
        { $set: { [data.day]: data.recipe }} // dynamically set the day field
    );

    if (existingMealPlan) {
        return res.json({
            recipe: data.recipe,
            message: `Replaced the meal for ${data.day}`
        });
    }
    else {
        const newMealPlan = new MealPlan({ 
            weekOf: data.weekOf,
            userID: data.userID,
            [data.day]: data.recipe
        });
        await newMealPlan.save();
        return res.json({
            recipe: data.recipe,
            message: `Added meal for ${data.day}`,
        });
    }
});

app.get("/getMealPlan/:weekOf/:userID", async(req, res) => {
    const { weekOf, userID } = req.params;

    const mealPlan = await MealPlan.findOne({ weekOf, userID });

    if (mealPlan) {
        return res.json({
            sunday: mealPlan.sunday,
            tuesday: mealPlan.tuesday,
            wednesday: mealPlan.wednesday,
            thursday: mealPlan.thursday,
            friday: mealPlan.friday,
            saturday: mealPlan.saturday,
            exists: true,
            message: "Found Meal Plan."
        })
    } else {
        return res.json({
            exists: false,
            message: "Meal Plan does not exist.!"
        })
    }
})


// Start the HTTP server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`HTTP microservice running on http://localhost:${PORT}`);
});