import express from 'express';
import mongoose from 'mongoose';
import moment from 'moment';
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


function weekOf(date = new Date()) {
    // Calculate the Monday of the given week
    return moment(date).startOf('isoWeek').format('YYYY-MM-DD');
}


// eventually I would like to scale up to allow for multiple recipes in one meal... side dishes, dessert, etc!
app.post("/updateMealPlan", async(req, res) => {
    const { data } = req.body;

    const date = data.date ? new Date(data.date) : new Date();
    const currentWeekOf = weekOf(date);
    
    // right now we just replace any existing entry, in the future we should verify with user!
    const existingMealPlan = await MealPlan.findOneAndUpdate(
        { weekOf: currentWeekOf, userID: data.userID },
        { $set: { [`days.${data.day}`]: data.recipe }} // dynamically set the day field inside the 'days' object
    );
    

    if (existingMealPlan) {
        return res.json({
            recipe: data.recipe,
            message: `Replaced the meal for ${data.day}`
        });
    }
    else {
        const newMealPlan = new MealPlan({ 
            weekOf: currentWeekOf,
            userID: data.userID,
            [`days.${data.day}`]: data.recipe
        });
        await newMealPlan.save();
        return res.json({
            recipe: data.recipe,
            message: `Added meal for ${data.day}`,
        });
    }
});

app.get("/getMealPlan/:userID/:date", async(req, res) => {
    const { userID } = req.params;

    // Validate userID
    if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).json({ error: "Invalid userID format" });
    }

    // Use query parameter `date` if provided, otherwise default to today
    const date = req.params.date ? new Date(req.params.date) : new Date();
    date.setHours(0, 0, 0, 0); // sets the time to midnight
    const currentWeekOf = weekOf(date);

    console.log(`Trying to find meal plan with userID: ${userID}, weekOf: ${currentWeekOf}\n`);

    try {
        const mealPlan = await MealPlan.findOne({ weekOf: currentWeekOf, userID: userID });

        if (mealPlan) {
            return res.json(mealPlan);
        } else {
            return res.status(404).json({
                exists: false,
                message: "Meal Plan does not exist.!"
            })
        }
    } catch {
        console.error("Error fetching meal plan:");
        res.status(500).json({ error: "Internal server error" });
    }
});


// Start the HTTP server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`HTTP microservice running on http://localhost:${PORT}`);
});