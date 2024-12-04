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
        return res.status(404).json({
            message: "Couldn't find meal plan!"
        });
    }
});

app.get("/getMealPlan/:userID/:date", async(req, res) => {
    console.log("Running getMealPlan route\n");    // DEBUGGING
    console.log(`Microservice recieved: ${req.params.userID}, ${req.params.date}\n`)    // DEBUGGING
    
    const { userID, date } = req.params;

    // Validate userID
    if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).json({ error: "Invalid userID format" });
    }

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0); // sets the time to midnight
    console.log(`Created new date object: ${ dateObj }`);    // DEBUGGING

    const currentWeekOf = weekOf(date);
    console.log(`Which is the week of: ${ currentWeekOf }`);    // DEBUGGING


    console.log(`Trying to find meal plan with userID: ${userID}, and weekOf: ${currentWeekOf}\n`);

    try {
        const mealPlan = await MealPlan.findOne({ weekOf: currentWeekOf, userID: userID });

        if (mealPlan) {
            return res.json({
                mealPlan: mealPlan,
                message: "Successfully found meal plan!",
                existed: true
            });
        } else {
            const newMealPlan = new MealPlan({ 
                weekOf: currentWeekOf,
                userID: userID,
            });
            await newMealPlan.save();
            return res.json({
                mealPlan: newMealPlan,
                message: "Created new meal plan!",
                existed: false
            })
        }
    } catch {
        console.error("Error fetching meal plan:");
        return res.status(500).json({ error: "Internal server error" });
    }
});


// Start the HTTP server
const PORT = 3002;
app.listen(PORT, (err) => {
    if (err) {
      console.error(`Failed to start server: ${err.message}`);
      process.exit(1); // Exit the process if the server fails to start
    } else {
      console.log(`HTTP microservice running on http://localhost:${PORT}`);
    }
});
  
