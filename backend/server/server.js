const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const csvParser = require("csv-parser");
const { ConnectingAirportsOutlined } = require("@mui/icons-material");

require("dotenv").config();

// creates an ExpressJS app api to communicate the db data to the frontend
const app = express();
const port = process.env.PORT || 5001;
const STRAPI_API_URL = "localhost:1337";


console.log("server is running on port " + port);

app.use(cors());
app.use(express.json());
app.use(express.json());

let dailyActivity = [];
let dailySleep = [];
let hourlyActivity = [];
let ap_data = [];
let libre_data = [];

const db = require("./db");

async function fetchAPData() {
  try {
    // Query for Fitbit daily data
    const fitbit_ul_result = await db.query(`
      SELECT
        fddul.id AS link_id,
        fddul.fitbit_daily_data_id,
        fddul.user_id,
        fddul.fitbit_daily_data_order,
        fdd.sleep_target,
        fdd.sleep_value,
        fdd.steps,
        fdd.calories_target,
        fdd.calories_value,
        fdd.intensity,
        fdd.min_heart_rate,
        fdd.max_heart_rate,
        fdd.created_at AS data_created_at,
        fdd.updated_at AS data_updated_at,
        fdd.created_by_id AS data_created_by_id,
        fdd.updated_by_id AS data_updated_by_id
      FROM
        fitbit_daily_datas_user_links AS fddul
      INNER JOIN
        fitbit_daily_datas AS fdd
      ON
        fddul.fitbit_daily_data_id = fdd.id;
    `);

    const fitbit_rows = fitbit_ul_result.rows;

    // Set WHO step goal as fallback
    const stepGoalValue = 10000;
    for (let i = 0; i < fitbit_rows.length; i++) {
      fitbit_rows[i].daily_step_goal = stepGoalValue;
    }

    // Query for Garmin daily data
    const garmin_ul_result = await db.query(`
      SELECT
        gdul.id AS link_id,
        gdul.garmin_daily_data_id,
        gdul.user_id,
        gdul.garmin_daily_data_order,
        gdd.sleep_target,
        gdd.sleep_value,
        gdd.steps,
        gdd.calories_target,
        gdd.calories_value,
        gdd.intensity,
        gdd.min_heart_rate,
        gdd.max_heart_rate,
        gdd.daily_step_goal,
        gdd.created_at AS data_created_at,
        gdd.updated_at AS data_updated_at,
        gdd.created_by_id AS data_created_by_id,
        gdd.updated_by_id AS data_updated_by_id
      FROM
        garmin_daily_datas_user_links AS gdul
      INNER JOIN
        garmin_daily_datas AS gdd
      ON
        gdul.garmin_daily_data_id = gdd.id;
    `);

    const garmin_rows = garmin_ul_result.rows;

    // Query for Libre daily data
    const libre_ul_result = await db.query(`
      SELECT
        ldul.id AS link_id,
        ldul.user_id,
        ldd.id AS libre_data_id,
        ldd.glucose_value,
        ldd.glucose_unit,
        ldd.glucose_type,
        ldd.glucose_timestamp,
        ldd.created_at AS data_created_at,
        ldd.updated_at AS data_updated_at
      FROM
        libre_daily_datas_user_links AS ldul
      INNER JOIN
        libre_daily_datas AS ldd
      ON
        ldul.libre_daily_data_id = ldd.id;
    `);

    console.log("[INFO] Data successfully loaded");

    libre_data = libre_ul_result.rows;
    ap_data = fitbit_rows.concat(garmin_rows);

  } catch (error) {
    console.error("[ERROR] Error connecting to the database or fetching data", error);
  }
}

app.get("/api/clinicians/:id/up_users", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT up_users.id, up_users.username 
      FROM up_users 
      JOIN up_users_clinician_links 
        ON up_users.id = up_users_clinician_links.user_id 
      JOIN clinicians 
        ON clinicians.id = up_users_clinician_links.clinician_id 
      WHERE clinicians.id = $1
    `, [id]);

    console.log("Query result:", result.rows);

    res.json(result.rows);
  } catch (e) {
    console.error('Error getting the users', e);
    res.status(500).json({ error: "Error getting the users of a clinician" })
  }
});

app.get("/api/up_users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      select up_users.id, up_users.username, garmin_daily_datas.id, garmin_daily_datas.sleep_value, garmin_daily_datas.sleep_target, garmin_daily_datas.steps, garmin_daily_datas.calories_value, garmin_daily_datas.calories_target, garmin_daily_datas.intensity, garmin_daily_datas.min_heart_rate, garmin_daily_datas.max_heart_rate from garmin_daily_datas 
join garmin_daily_datas_user_links on garmin_daily_datas.id = garmin_daily_datas_user_links.garmin_daily_data_id 
join up_users on up_users.id = garmin_daily_datas_user_links.user_id where up_users.id = $1
    `;

    const result = await db.query(query, [id]);
    console.log("Query result:", result.rows);

    res.json(result.rows);
  } catch (e) {
    console.error('Error getting the users', e);
    res.status(500).json({ error: "Error getting the users of a clinician" })
  }
});

app.get("/api/survey", async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT ON (question) id, question, is_reaction_question
FROM public.components_survey_answers
ORDER BY question, id ASC;
    `;

    const result = await db.query(query);
    console.log("Query result:", result.rows);

    res.json(result.rows);
  } catch (e) {
    console.error('Error getting the questions', e);
    res.status(500).json({ error: "Error getting the questions" })
  }
});

app.get("/api/patients/:patientId/:questionId/answers", async (req, res) => {
  const patientId = req.params.patientId;
  const question_id = req.params.questionId;

  try {
    const result = await db.query(`
      SELECT 
    csa.question,
    caa.answer
FROM 
    public.components_answer_answers caa
JOIN 
    public.components_survey_answers csa ON caa.question_id = csa.id
JOIN 
    public.answers_user_links aul ON caa.id = aul.answer_id
WHERE 
    aul.user_id = $1 and csa.id = $2
ORDER BY csa.id desc 
    `, [patientId, question_id]);

    console.log("Query result: " + result.rows);

    res.json(result.rows)
  } catch (e) {
    console.error("Error getting the answers: ", e)
    res.status(500).json({ error: "Error getting the users of a clinician" })
  }
});

app.get("/api/patients/:patientId/answers_14_days", async (req, res) => {
  const patientId = req.params.patientId;

  try {
    const result = await db.query(`
    SELECT 
    aul.user_id,
    csa.id,
    csa.question,
    caa.answer,
    csa.response_limit
FROM 
    public.components_answer_answers caa
JOIN 
    public.components_survey_answers csa ON caa.question_id = csa.id
JOIN 
    public.answers_user_links aul ON caa.id = aul.answer_id
JOIN 
    public.answers a ON caa.id = a.id
WHERE 
    aul.user_id = $1
ORDER BY 
    csa.id ASC
    `, [patientId]);

    console.log("Query result 14 dias: " + result.rows);

    res.json(result.rows)
  } catch (e) {
    console.error("Error getting the last 14 answers: ", e)
    res.status(500).json({ error: "Error getting the last 14 answers" })
  }
});

app.get("/api/patients/:patientId/:surveyId/answers_14_days", async (req, res) => {
  const patientId = req.params.patientId;
  const surveyId = req.params.surveyId;

  try {
    const result = await db.query(`
      SELECT
	  csal.survey_id,
	  s.title,
    csa.id,
    csa.question,
    caa.answer
FROM 
    public.components_answer_answers caa
JOIN 
    public.components_survey_answers csa ON caa.question_id = csa.id
JOIN 
    public.answers_user_links aul ON caa.id = aul.answer_id
JOIN 
    public.answers a ON caa.id = a.id
JOIN
	public.component_survey_answer_link csal on csal.question_id = csa.id
JOIN
	public.surveys s on s.id = csal.survey_id
WHERE 
    aul.user_id = $1 AND csal.survey_id = $2
ORDER BY 
    csa.id ASC
    `, [patientId, surveyId]);

    console.log("Query result 14 dias: " + result.rows);

    res.json(result.rows)
  } catch (e) {
    console.error("Error getting the last 14 answers: ", e)
    res.status(500).json({ error: "Error getting the last 14 answers" })
  }
});

app.get("/api/question_options/:patientId", async (req, res) => {
  const patientId = req.params.patientId;

  try {
    const result = await db.query(`
      SELECT DISTINCT ON (caa.answer)
    csa.id,
    csa.question,
    caa.answer
FROM 
    public.components_answer_answers caa
JOIN 
    public.components_survey_answers csa ON caa.question_id = csa.id
JOIN 
    public.answers_user_links aul ON caa.id = aul.answer_id
INNER JOIN components_survey_options cso on cso.label = caa.answer
WHERE 
    aul.user_id = $1 and caa.answer = cso.label
ORDER BY caa.answer asc 
      `, [patientId]);
    res.json(result.rows)
  } catch (e) {
    console.error("Error getting the questions", e);
    res.status(500).json({ error: "Error getting the questions" })
  }
});

app.get("/api/question_checkboxes/:patientId", async (req, res) => {
  const patientId = req.params.patientId;

  try {
    const result = await db.query(`
SELECT DISTINCT ON (csa.question)
    csa.id,
    csa.question,
    caa.answer
FROM 
    public.components_answer_answers caa
JOIN 
    public.components_survey_answers csa ON caa.question_id = csa.id
JOIN 
    public.answers_user_links aul ON caa.id = aul.answer_id
INNER JOIN components_survey_checkboxes csc on csc.question = csa.question
WHERE 
    aul.user_id = $1 and csa.question = csc.question
ORDER BY csa.question asc  
      `, [patientId]);
    res.json(result.rows)
  } catch (e) {
    console.error("Error getting the questions", e);
    res.status(500).json({ error: "Error getting the questions" })
  }
});

app.get("/api/question_answers/:questionId", async (req, res) => {
  const questionId = req.params.questionId;

  try {
    const result = await db.query(`
      select csal.answer_id, caa.answer
from component_survey_answer_link csal
join components_answer_answers caa on csal.answer_id = caa.id
where csal.question_id = $1
      `, [questionId]);
    res.json(result.rows)
  } catch (e) {
    console.error("Error getting the questions", e);
    res.status(500).json({ error: "Error getting the questions" })
  }
});

app.get("/api/badgeData/:id/up_users", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT up_users.id, up_users.full_name, up_users.email, groups_users_links.group_id, groups.title, up_users.photo
      FROM up_users 
      JOIN up_users_clinician_links 
        ON up_users.id = up_users_clinician_links.user_id 
      JOIN clinicians 
        ON clinicians.id = up_users_clinician_links.clinician_id 
		  JOIN groups_users_links
		    ON up_users.id = groups_users_links.user_id
      JOIN groups
        ON groups.id = groups_users_links.group_id
      WHERE up_users.id = $1
    `, [id]);

    console.log("Query result:", result.rows);

    res.json(result.rows);
  } catch (e) {
    console.error('Error getting the users', e);
    res.status(500).json({ error: "Error getting the users of a clinician" })
  }
});




// queries the database for app user ids and refetches all user data
app.get("/api/ap_user_ids", async (req, res) => {
  // fetch the database data here, can move this to a refresh button functionality in future if wanted
  await fetchAPData();

  const unique_ids = [...new Set(ap_data.map((item) => item.user_id))];
  res.json(unique_ids);
});

// queries the database for the patient's daily data values
app.get("/api/daily_data", (req, res) => {
  const userId = req.query.id;
  const s_date = new Date(req.query.s_date);
  const e_date = new Date(req.query.e_date);
  const dateArray = [];
  console.log("Getting daily data from start: " + s_date + " to end: " + e_date);

  let currentDate = new Date(s_date);
  while (currentDate <= e_date) {
    dateArray.push(new Date(currentDate.setHours(0, 0, 0, 0))); // Normalize dates to midnight
    currentDate.setDate(currentDate.getDate() + 1);
  }

  let steps = [];
  let activeMins = [];
  let calories = [];
  let low_hr = [];
  let high_hr = [];
  let sleep = [];
  let glucoseValues = [];

  dateArray.forEach(function (date) {

    // Fetch Fitbit and Garmin data
    const foundStats = ap_data.find(function (stats) {
      if (stats.user_id == userId) {
        const statsDate = new Date(stats.data_created_at);
        statsDate.setHours(0, 0, 0, 0);
        return date.getTime() === statsDate.getTime();
      }
      return false;
    });

    // Fetch Libre data
    const foundLibreStats = libre_data.filter(function (libreStats) {
      if (libreStats.user_id == userId) {
        const libreDate = new Date(libreStats.glucose_timestamp)
          .toISOString()
          .split("T")[0];
        const currentDate = date.toISOString().split("T")[0];
        console.log('Libre date: ' + libreDate + ' current date: ' + currentDate);
        return libreDate === currentDate;
      }
      return false;
    });

    // Populate daily data
    if (foundStats || foundLibreStats.length > 0) {
      steps.push(parseInt(foundStats?.steps) || 0);
      activeMins.push(parseInt(foundStats?.intensity) || 0);
      calories.push(parseInt(foundStats?.calories_value) || 0);
      low_hr.push(parseInt(foundStats?.min_heart_rate) || 0);
      high_hr.push(parseInt(foundStats?.max_heart_rate) || 0);
      sleep.push(parseInt(foundStats?.sleep_value) || 0);

      if (foundLibreStats.length > 0) {
        const averageGlucose = (
          foundLibreStats.reduce((sum, stat) => sum + parseFloat(stat.glucose_value), 0) /
          foundLibreStats.length
        ).toFixed(2);
        glucoseValues.push(parseFloat(averageGlucose));
      } else {
        glucoseValues.push(0);
      }
    } else {
      steps.push(0);
      activeMins.push(0);
      calories.push(0);
      low_hr.push(0);
      high_hr.push(0);
      sleep.push(0);
      glucoseValues.push(0);
    }
  });

  const correct_stats = {
    steps: steps,
    activeMins: activeMins,
    calories: calories,
    sleep: sleep,
    low_hr: low_hr,
    high_hr: high_hr,
    glucoseValues: glucoseValues, // Simple list of values
  };

  console.log("[DEBUG] Daily Data:", JSON.stringify(correct_stats, null, 2));
  res.json(correct_stats);
});




// queries the database to gather patient goals to display on the dashboard and to use in the recommendation generation
app.get("/api/targets", (req, res) => {
  const userId = parseInt(req.query.id);
  let tgt_cal;
  let tgt_sleep;
  let tgt_step;
  const user_data = ap_data.filter((item) => item.user_id === userId);
  const sortedArray = user_data.sort(
    (a, b) => new Date(b.data_created_at) - new Date(a.data_created_at)
  );

  if (sortedArray.length > 0) {
    tgt_cal = parseInt(sortedArray[0].calories_target);
    tgt_sleep = parseInt(sortedArray[0].sleep_target);
    tgt_step = parseInt(sortedArray[0].daily_step_goal) || 10000;
  } else {
    tgt_cal = 2250;
    tgt_sleep = 420;
  }

  const targets = {
    step_tgt: tgt_step,
    cal_tgt: tgt_cal,
    sleep_tgt: tgt_sleep,
  };
  res.json(targets);
});

// queries the database for heart rate values and gets an average over the last 30 days to use in the heart rate target zone recommendations
app.get("/api/ht_month_av", (req, res) => {
  const user_id = parseInt(req.query.id);
  const user_data = ap_data.filter((item) => item.user_id === user_id);
  const sortedArray = user_data.sort(
    (a, b) => new Date(b.data_created_at) - new Date(a.data_created_at)
  );

  const maxHeartRates = sortedArray
    .map((row) => parseInt(row.max_heart_rate))
    .filter(Number)
    .slice(0, 30);

  const sum = maxHeartRates.reduce((acc, val) => acc + val, 0);
  const maxHRAverage =
    maxHeartRates.length > 0 ? sum / maxHeartRates.length : 0;

  res.json({ average: maxHRAverage });
});

// queries the database to gather all the patient data for exporting
app.get("/api/all_ap_user_data", (req, res) => {
  const user_id = parseInt(req.query.id);
  const user_data = ap_data.filter((item) => item.user_id === user_id);
  // sort in ascending order of dates
  const sortedArray = user_data.sort(
    (a, b) => new Date(a.data_created_at) - new Date(b.data_created_at)
  );

  res.json(sortedArray);
});

// queries the database for the fitbit daily values
app.get("/api/fitbit_daily", (req, res) => {
  const userId = req.query.id;
  const s_date = new Date(req.query.s_date);
  const e_date = new Date(req.query.e_date);
  const dateArray = [];
  let currentDate = new Date(s_date);
  while (currentDate <= e_date) {
    dateArray.push(new Date(currentDate.setHours(0, 0, 0, 0)));
    currentDate.setDate(currentDate.getDate() + 1); //need to check for timezone changes- see 26-29th march
  }
  const all_stats = dailyActivity;
  let steps = [];
  let activeMins = [];
  let calories = [];

  dateArray.forEach(function (date) {
    const foundStats = all_stats.find(function (stats) {
      if (stats.Id == userId) {
        const [month, day, year] = stats.ActivityDate.split("/");
        const this_date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        return date.setHours(0, 0, 0, 0) === this_date.setHours(0, 0, 0, 0);
      }
      return false;
    });

    if (foundStats) {
      steps.push(foundStats.TotalSteps);
      const veryActive = foundStats.VeryActiveMinutes
        ? parseInt(foundStats.VeryActiveMinutes)
        : 0;
      const fairlyActive = foundStats.FairlyActiveMinutes
        ? parseInt(foundStats.FairlyActiveMinutes)
        : 0;
      const lightlyActive = foundStats.LightlyActiveMinutes
        ? parseInt(foundStats.LightlyActiveMinutes)
        : 0;
      activeMins.push(veryActive + fairlyActive + lightlyActive);
      calories.push(foundStats.Calories);
    } else {
      steps.push(0);
      activeMins.push(0);
      calories.push(0);
    }
  });

  const sleep_stats = dailySleep;
  let sleep = [];
  dateArray.forEach(function (date) {
    const foundStats = sleep_stats.find(function (stats) {
      if (stats.Id == userId) {
        const this_date = new Date(stats.SleepDay);
        return date.setHours(0, 0, 0, 0) === this_date.setHours(0, 0, 0, 0);
      }
      return false;
    });

    if (foundStats) {
      sleep.push(foundStats.TotalMinutesAsleep);
    } else {
      sleep.push(0);
    }
  });

  const correct_stats = {
    steps: steps,
    activeMins: activeMins,
    calories: calories,
    sleep: sleep,
  };
  res.json(correct_stats);
});

// use if wanting to implement hourly sleep on public datasets
app.get("/api/fitbit_hourly", (req, res) => {
  const userId = req.query.id;
  const start_date = new Date(req.query.s_date);
  const end_date = new Date(req.query.e_date);
  const calories = [];
  const intensity = [];
  const steps = [];

  const all_stats = hourlyActivity;
  all_stats.forEach(function (stats, index) {
    if (stats.Id === userId) {
      const this_date = new Date(stats.ActivityHour);
      if (
        this_date.setHours(0, 0, 0, 0) >= start_date.setHours(0, 0, 0, 0) &&
        this_date.setHours(0, 0, 0, 0) <= end_date.setHours(0, 0, 0, 0)
      ) {
        steps.push(stats.StepTotal);
        intensity.push(stats.TotalIntensity);
        calories.push(stats.Calories);
      }
    }
  });
  const correct_stats = {
    steps: steps,
    intensity: intensity,
    calories: calories,
  };
  console.log(correct_stats);
  res.json(correct_stats);
});

app.get("/api/user_ids", (req, res) => {
  const unique_ids = [...new Set(dailyActivity.map((item) => item.Id))];
  console.log(unique_ids);
  res.json(unique_ids);
});

app.get("/api/institutions", async (req, res) => {
  try {
    const institution_rows = await db.query(`SELECT id, name FROM institutions`);
    console.log("Query result:", institution_rows.rows);

    res.json(institution_rows.rows);
  } catch (error) {
    console.error("Error fetching institutions:", error);
    res.status(500).send("Server error while fetching institutions");
  }
});


app.post("/api/signup", async (req, res) => {
  const { firstName, lastName, institution } = req.body;

  try {
    const existingClinician = await db.query(
      `SELECT id FROM clinicians WHERE first_name = $1 AND last_name = $2`,
      [firstName, lastName]
    );

    if (existingClinician.rows.length > 0) {
      return res.status(400).send("Clinician already exists.");
    }

    const existingInstitution = await db.query(
      `SELECT id FROM institutions WHERE name = $1`,
      [institution]
    );

    if (existingInstitution.rows.length === 0) {
      return res.status(400).send("Institution does not exist.");
    }

    const institutionId = existingInstitution.rows[0].id;

    console.log("Strapi API Token:", process.env.STRAPI_API_TOKEN);
    const strapiResponse = await axios.post(
      `${STRAPI_API_URL}/api/clinicians`,
      {
        data: {
          first_name: firstName,
          last_name: lastName,
          institution: institutionId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    const clinicianId = strapiResponse.data.data.id;

    console.log(`Sending: ${JSON.stringify({
      success: true,
      message: "Signup successful.",
      clinicianId,
      firstName,
      lastName,
    })}`);

    res.status(201).send({
      success: true,
      message: "Signup successful.",
      clinicianId,
      firstName,
      lastName,
    });
  } catch (error) {
    console.error("Error during signup:", error.response?.data || error);
    res.status(500).send("Server error during signup.");
  }
});

app.post("/api/login", async (req, res) => {
  const { firstName, lastName, institution } = req.body;

  try {
    const clinician = await db.query(
      `SELECT id FROM clinicians WHERE first_name = $1 AND last_name = $2`,
      [firstName, lastName]
    );

    if (clinician.rows.length === 0) {
      return res.status(400).send("Invalid credentials.");
    }

    const clinicianId = clinician.rows[0].id;

    const institutionEntry = await db.query(
      `SELECT id FROM institutions WHERE name = $1`,
      [institution]
    );

    if (institutionEntry.rows.length === 0) {
      return res.status(400).send("Invalid credentials.");
    }

    const institutionId = institutionEntry.rows[0].id;

    const link = await db.query(
      `SELECT * FROM clinicians_institution_links WHERE clinician_id = $1 AND institution_id = $2`,
      [clinicianId, institutionId]
    );

    if (link.rows.length > 0) {
      console.log(`Sending: ${JSON.stringify({ success: true, clinicianId, firstName, lastName })}`);

      res.status(200).send({
        success: true,
        clinicianId,
        firstName,
        lastName,
      });
    } else {
      res.status(400).send("Invalid credentials.");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Server error during login.");
  }
});

app.post("/api/clinician-user-ids", async (req, res) => {
  const { clinicianId } = req.body;

  if (!clinicianId) {
    return res.status(400).send("Clinician ID is required.");
  }

  try {
    const result = await db.query(
      `SELECT user_id FROM up_users_clinician_links WHERE clinician_id = $1`,
      [clinicianId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("No users found for the specified clinician.");
    }

    const userIds = result.rows.map((row) => row.user_id);

    res.status(200).json(userIds);
  } catch (error) {
    console.error("Error fetching users for clinician:", error);
    res.status(500).send("Server error while fetching users.");
  }
});

app.post("/api/clinician-user-details", async (req, res) => {
  const { clinicianId } = req.body;

  if (!clinicianId) {
    return res.status(400).send("Clinician ID is required.");
  }

  try {
    const result = await db.query(
      `SELECT 
         uu.id AS user_id,
         uu.full_name AS user_name,
         inst.name AS clinic_name,
         cl.first_name || ' ' || cl.last_name AS clinician_name
       FROM 
         up_users_clinician_links ucl
       INNER JOIN 
         up_users uu ON ucl.user_id = uu.id
       INNER JOIN 
         clinicians cl ON ucl.clinician_id = cl.id
       INNER JOIN 
         clinicians_institution_links cil ON cl.id = cil.clinician_id
       INNER JOIN 
         institutions inst ON cil.institution_id = inst.id
       WHERE 
         ucl.clinician_id = $1`,
      [clinicianId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("No users found for the specified clinician.");
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching user details for clinician:", error);
    res.status(500).send("Server error while fetching user details.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post("/api/search-user", async (req, res) => {
  const { email } = req.body;

  console.log("[INFO] Received request to search user by email:", email);

  if (!email) {
    console.log("[ERROR] No email provided in the request body.");
    return res.status(400).send("Email is required.");
  }

  try {
    console.log("[INFO] Sending request to Strapi API to search for user...");
    const response = await axios.get(
      `${STRAPI_API_URL}/api/users`,
      {
        params: { filters: { email: { $eq: email } } },
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    console.log(
      "[INFO] Response received from Strapi API:",
      JSON.stringify(response.data, null, 2)
    );

    if (Array.isArray(response.data) && response.data.length > 0) {
      const user = response.data[0];
      console.log("[INFO] User found:", JSON.stringify(user, null, 2));
      res.status(200).json({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      });
    } else {
      console.log("[INFO] No user found with the provided email:", email);
      res.status(404).send("No user found with the provided email.");
    }
  } catch (error) {
    console.error(
      "[ERROR] Error while searching for user:",
      error.response?.data || error.message
    );
    res.status(500).send("Server error while searching for user.");
  }
});

app.post("/api/add-user", async (req, res) => {
  const { clinicianId, userId } = req.body;

  if (!clinicianId || !userId) {
    console.log("[ERROR] Missing clinicianId or userId in request body.");
    return res.status(400).send("Both clinicianId and userId are required.");
  }

  try {
    console.log(`[INFO] Checking if user ${userId} is already assigned to clinician ${clinicianId}...`);

    const userResponse = await axios.get(
      `${STRAPI_API_URL}/api/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    const user = userResponse.data;

    if (user.clinician === clinicianId) {
      console.log("[INFO] User is already assigned to the clinician.");
      return res.status(400).json({
        success: false,
        message: "This user has already been added.",
      });
    }

    console.log(`[INFO] Assigning clinician ${clinicianId} to user ${userId}...`);

    const response = await axios.put(
      `${STRAPI_API_URL}/api/users/${userId}`,
      {
        clinician: clinicianId,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    console.log("[INFO] User successfully assigned to clinician:", response.data);
    res.status(200).json({ success: true, message: "User successfully assigned to clinician." });
  } catch (error) {
    console.error("[ERROR] Error assigning user to clinician:", error.response?.data || error.message);
    res.status(500).send("Server error while assigning user to clinician.");
  }
});