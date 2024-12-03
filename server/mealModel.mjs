import mongoose from "mongoose";

const Schema = mongoose.Schema;

let MealSchema = new Schema({
    mealPlan: { type: Number, required: true},
    day: { type: String, required: true },
    recipe: {type: String, required: true},
    userID: { type: Schema.Types.ObjectId, ref: "User"}
});


export default mongoose.model('Meal', MealSchema);