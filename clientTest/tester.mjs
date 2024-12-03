import express from 'express';

const app = express();
app.use(express.json());

const mealData = {
    data: {
        date: "2024-02-12",
        userID: '674e155690558860cca17ecd',
        day: "tuesday",
        recipe: "FakeSpoonacularRecipeIDNumber2"
    }
};

async function createMeal(mealData) {
    const url = 'http://localhost:3002/updateMealPlan';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // what is this???
        },
        body: JSON.stringify(mealData) // convert the JavaScript object to a JSON string
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        console.log(`Message from microservice: ${ data.message }`);
    } catch (error) {
        console.error('Error making the request:', error);
    }
}

const mealPlanData = {
    data: {
        date: "2024-02-12",
        userID: '674e155690558860cca17ecd'
    }
};

async function getMealPlan (mealPlanData) {
    const date = mealPlanData.data.date;
    const userID = mealPlanData.data.userID;
    
    const url = `http://localhost:3002/getMealPlan/${userID}/${date}`;
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },

    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        console.log(data);
    } catch (error) {
        console.error('Error making the request:', error);
    }
}


async function createAndFetchMealPlan(mealData, mealPlanData) {
    await createMeal(mealData); // Wait for meal creation to complete
    await getMealPlan(mealPlanData); // Then fetch the meal plan
}

// Call the combined function
createAndFetchMealPlan(mealData, mealPlanData);
