// const url = "http://localhost:5002";
const url =
  process.env.NODE_ENV === "production" ? "" : `http://127.0.0.1:5002`;

// function to call request to flask ai api and get back grouping results
export async function groupModel(uid) {
  const targetUrl = url + "/flask/group";
  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ uid: uid }),
    });

    const data = await response.json();
    if (data.uid == uid) {
      //leave as double equals due to type conversion
      return data.data;
    }
  } catch (e) {
    console.log(`API Error:\n${e}`);
  }
}

// function to call request to flask ai api and get back shap grouping results that provide grouping explainations
export async function groupShap(uid) {
  const targetUrl = url + "/flask/group_shap";
  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ uid: uid }),
    });

    const data = await response.json();
    return data.expl;
  } catch (e) {
    console.log(`API Error:\n${e}`);
  }
}

// function to call request to flask ai api and get back patient forecasting results
export async function forecastModel(uid, dataCategory) {
  const targetUrl = url + "/flask/forecast";
  console.log("WORKING");
  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ uid: uid, data: dataCategory }),
    });

    const responseJson = await response.json();
    if (responseJson.uid == uid) {
      //leave as double equals due to type conversion
      return responseJson.data;
    }
  } catch (e) {
    console.log(`Error!\n${e}`);
  }
}

// function to call request to flask ai api and get back public data grouping results if one wants to experiment with different datasets
export async function forecastPublicModel(uid, dataCategory) {
  const targetUrl = url + "/flask/forecast_public";
  console.log("WORKING");
  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ uid: uid, data: dataCategory }),
    });

    const responseJson = await response.json();
    if (responseJson.uid == uid) {
      //leave as double equals due to type conversion
      return responseJson.data;
    }
  } catch (e) {
    console.log(`Error!\n${e}`);
  }
}
