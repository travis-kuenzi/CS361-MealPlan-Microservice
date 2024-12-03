import mongoose from "mongoose";

const Schema = mongoose.Schema;

let MealPlanSchema = new Schema({
    weekOf: { type: Date, required: true },
    userID: { type: Schema.Types.ObjectId, ref: "User" },
    days: {
        sunday: { type: String, default: null },
        monday: { type: String, default: null },
        tuesday: { type: String, default: null },
        wednesday: { type: String, default: null },
        thursday: { type: String, default: null },
        friday: { type: String, default: null },
        saturday: { type: String, default: null }
    }
});



export default mongoose.model('MealPlan', MealPlanSchema);