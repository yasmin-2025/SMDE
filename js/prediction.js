const predictBtn = document.getElementById("predictBtn");
const resetBtn = document.getElementById("resetBtn");

const predictionMode = document.getElementById("predictionMode");
const machineSelect = document.getElementById("machineSelect");

const existingMachineSection =
    document.getElementById("existingMachineSection");

const manualTestSection =
    document.getElementById("manualTestSection");


// =====================================================
// GENERATE 100 MACHINES
// =====================================================

for (let i = 1; i <= 100; i++) {

    const machineId =
        `M-${String(i).padStart(3, "0")}`;

    const option =
        document.createElement("option");

    option.value = machineId;

    option.textContent =
        `${machineId} — Machine ${i}`;

    machineSelect.appendChild(option);
}


// =====================================================
// PRE-FILL MACHINE FROM URL
// =====================================================

const urlParams =
    new URLSearchParams(window.location.search);

const preselectedMachine =
    urlParams.get("machine");

if (preselectedMachine) {

    machineSelect.value =
        preselectedMachine;

}


// =====================================================
// INPUTS
// =====================================================

const voltageInput =
    document.getElementById("voltage");

const rotationInput =
    document.getElementById("rotation");

const pressureInput =
    document.getElementById("pressure");

const vibrationInput =
    document.getElementById("vibration");


const inputs = [

    voltageInput,
    rotationInput,
    pressureInput,
    vibrationInput

];


// =====================================================
// LOAD EXISTING MACHINE DATA
// =====================================================

async function loadMachineData(machineID) {

    inputs.forEach(input => {

        input.value = "";

    });


    try {

        const response = await fetch(
            `http://localhost/SMDE_fixed/SMDE/backend/api/machine.php?machineID=${encodeURIComponent(machineID)}`,
            { credentials: "include" }
        );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "MACHINE DATA:",
            data
        );


        if (data.error) {

            throw new Error(
                data.error
            );

        }


        if (!data.telemetry) {

            throw new Error(
                "Telemetry data not found."
            );

        }


        voltageInput.value =
            Number(data.telemetry.volt).toFixed(2);

        rotationInput.value =
            Number(data.telemetry.rotate).toFixed(2);

        pressureInput.value =
            Number(data.telemetry.pressure).toFixed(2);

        vibrationInput.value =
            Number(data.telemetry.vibration).toFixed(2);


        inputs.forEach(input => {

            input.readOnly = true;

        });


        console.log(
            "Machine telemetry loaded successfully."
        );

    }


    catch (error) {

        console.error(
            "Machine API Error:",
            error
        );


        alert(
            "Could not load machine data."
        );


        inputs.forEach(input => {

            input.value = "";

            input.readOnly = false;

        });

    }

}


// =====================================================
// MODE CHANGE
// =====================================================

predictionMode.addEventListener(
    "change",
    function () {

        const mode =
            predictionMode.value;


        machineSelect.classList.remove(
            "is-invalid"
        );


        existingMachineSection.classList.add(
            "d-none"
        );

        manualTestSection.classList.add(
            "d-none"
        );


        if (mode === "existing") {

            existingMachineSection.classList.remove(
                "d-none"
            );

            machineSelect.required = true;


            inputs.forEach(input => {

                input.readOnly = true;

                input.value = "";

            });

        }


        else if (mode === "manual") {

            manualTestSection.classList.remove(
                "d-none"
            );

            machineSelect.required = false;

            machineSelect.value = "";


            inputs.forEach(input => {

                input.readOnly = false;

            });

        }


        else {

            machineSelect.required = false;

            machineSelect.value = "";


            inputs.forEach(input => {

                input.readOnly = false;

                input.value = "";

            });

        }

    }
);


// =====================================================
// MACHINE SELECTION
// =====================================================

async function handleMachineSelection() {

    machineSelect.classList.remove(
        "is-invalid"
    );


    const machineID =
        machineSelect.value;


    if (!machineID) {

        inputs.forEach(input => {

            input.value = "";

        });

        return;

    }


    await loadMachineData(machineID);

}


// =====================================================
// MACHINE CHANGE EVENT
// =====================================================

machineSelect.addEventListener(
    "change",
    handleMachineSelection
);


// =====================================================
// PREDICT
// =====================================================

predictBtn.addEventListener(
    "click",
    async function () {

        let valid = true;

        const mode =
            predictionMode.value;


        // =================================================
        // MODE VALIDATION
        // =================================================

        if (mode === "") {

            alert(
                "Please select a prediction mode."
            );

            return;

        }


        // =================================================
        // INPUT VALIDATION
        // =================================================

        inputs.forEach(input => {

            if (input.value === "") {

                input.classList.add(
                    "is-invalid"
                );

                valid = false;

            }

            else {

                input.classList.remove(
                    "is-invalid"
                );

            }

        });


        // =================================================
        // MACHINE VALIDATION
        // =================================================

        if (
            mode === "existing" &&
            machineSelect.value === ""
        ) {

            machineSelect.classList.add(
                "is-invalid"
            );

            valid = false;

        }

        else {

            machineSelect.classList.remove(
                "is-invalid"
            );

        }


        if (!valid) {

            alert(
                "Please complete all required fields."
            );

            return;

        }


        // =================================================
        // GET MACHINE
        // =================================================

        let machine =
            "Manual Test";


        let machineID = null;


        if (mode === "existing") {

            machine =
                machineSelect.value;

            machineID =
                machineSelect.value.replace("M-", "");

        }


        // =================================================
        // GET SENSOR VALUES
        // =================================================

        const voltage =
            Number(voltageInput.value);

        const rotation =
            Number(rotationInput.value);

        const pressure =
            Number(pressureInput.value);

        const vibration =
            Number(vibrationInput.value);


        // =================================================
        // GET LOGGED-IN USER
        // =================================================

        const userID =
            localStorage.getItem("smde_user_id");


        if (!userID) {

            alert(
                "User session not found. Please login again."
            );

            return;

        }


        // =================================================
        // CALL PHP → PYTHON → ML
        // =================================================

        let prediction;

        let predictionProbability;


        try {

            const response = await fetch(
                "http://localhost/SMDE_fixed/SMDE/backend/api/predict.php",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        volt: voltage,

                        rotate: rotation,

                        pressure: pressure,

                        vibration: vibration,

                        user_id: Number(userID),

                        machineID:
                            machineID
                                ? Number(machineID)
                                : 0,

                        mode:
                            mode === "existing"
                                ? "Existing Machine"
                                : "Manual Test"

                    })

                }
            );


            if (!response.ok) {

                throw new Error(
                    `Server returned ${response.status}`
                );

            }


            const result =
                await response.json();


            console.log(
                "ML RESULT:",
                result
            );


            if (result.error) {

                throw new Error(
                    result.error
                );

            }


            prediction =
                result.prediction;

            predictionProbability =
                result.probability * 100;

        }


        catch (error) {

            console.error(
                "Prediction API Error:",
                error
            );


            alert(
                "Could not connect to the Prediction API."
            );


            return;

        }


        // =================================================
        // DETERMINE RISK
        // =================================================

        let risk;

        let status;


        if (predictionProbability < 30) {

            risk = "low";

            status = "Normal";

        }

        else if (predictionProbability < 70) {

            risk = "medium";

            status = "Needs Attention";

        }

        else {

            risk = "high";

            status = "Critical";

        }


        // =================================================
        // DATE & TIME
        // =================================================

        const now =
            new Date();


        const date =
            now.toLocaleDateString();


        const time =
            now.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );


        // =================================================
        // CREATE RECORD
        // =================================================

        const record = {

            id: Date.now(),

            mode: mode,

            machine: machine,

            voltage: voltage,

            rotation: rotation,

            pressure: pressure,

            vibration: vibration,

            prediction: prediction,

            probability: predictionProbability,

            risk: risk,

            status: status,

            date: date,

            time: time

        };


        // =================================================
        // KEEP OLD HISTORY FOR NOW
        // =================================================

        saveRecordToHistory(record);


        // =================================================
        // RESULT PAGE URL
        // =================================================

        const resultURL =
            `./result.html?` +

            `id=${encodeURIComponent(record.id)}` +

            `&mode=${encodeURIComponent(record.mode)}` +

            `&machine=${encodeURIComponent(record.machine)}` +

            `&voltage=${encodeURIComponent(record.voltage)}` +

            `&rotation=${encodeURIComponent(record.rotation)}` +

            `&pressure=${encodeURIComponent(record.pressure)}` +

            `&vibration=${encodeURIComponent(record.vibration)}` +

            `&prediction=${encodeURIComponent(record.prediction)}` +

            `&probability=${encodeURIComponent(record.probability)}` +

            `&risk=${encodeURIComponent(record.risk)}` +

            `&status=${encodeURIComponent(record.status)}` +

            `&date=${encodeURIComponent(record.date)}` +

            `&time=${encodeURIComponent(record.time)}`;


        console.log(
            "Going to result page..."
        );


        window.location.href =
            resultURL;

    }
);


// =====================================================
// SAVE RECORD TO HISTORY
// =====================================================

function saveRecordToHistory(record) {

    const STORAGE_KEY =
        "smde_predictions";


    let saved;


    try {

        saved =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                )
            ) || [];

    }


    catch (error) {

        saved = [];

    }


    saved.unshift(record);


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(saved)
    );

}


// =====================================================
// RESET
// =====================================================

resetBtn.addEventListener(
    "click",
    function () {

        inputs.forEach(input => {

            input.value = "";

            input.readOnly = false;

            input.classList.remove(
                "is-invalid"
            );

        });


        machineSelect.value = "";

        machineSelect.classList.remove(
            "is-invalid"
        );


        predictionMode.value = "";


        existingMachineSection.classList.add(
            "d-none"
        );


        manualTestSection.classList.add(
            "d-none"
        );

    }
);


// =====================================================
// REMOVE INVALID STATE
// =====================================================

inputs.forEach(input => {

    input.addEventListener(
        "input",
        function () {

            input.classList.remove(
                "is-invalid"
            );

        }
    );

});


machineSelect.addEventListener(
    "change",
    function () {

        machineSelect.classList.remove(
            "is-invalid"
        );

    }
);
