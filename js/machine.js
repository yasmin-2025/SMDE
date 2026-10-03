/* =========================
   MACHINE DATA
========================= */

const machineIds = [
    "M-017",
    "M-024",
    "M-063",
    "M-078",
    "M-091",
    "M-100"
];

const machineItems =
    document.querySelectorAll(".machine-item");


/* =========================
   LOAD MACHINE DATA
========================= */

async function loadMachines() {

    const machinePromises = machineIds.map(
        async (machineId, i) => {

            const machineCard = machineItems[i];

            if (!machineCard) return;

            const numericId =
                machineId.replace("M-", "");

            try {

                /* =========================
                   GET MACHINE DATA
                ========================= */

                const response = await fetch(
                    `http://localhost/SMDE_fixed/SMDE/backend/api/machine.php?machineID=${numericId}`,
                    { credentials: "include" }
                );

                if (!response.ok) {
                    throw new Error(
                        `HTTP Error: ${response.status}`
                    );
                }

                const data = await response.json();

                if (data.error) {
                    console.error(
                        `${machineId}: ${data.error}`
                    );
                    return;
                }


                /* =========================
                   MACHINE INFO
                ========================= */

                const infoValues =
                    machineCard.querySelectorAll(
                        ".health-row strong"
                    );

                if (infoValues.length >= 2) {

                    infoValues[0].textContent =
                        data.age;

                    infoValues[1].textContent =
                        data.model;
                }


                /* =========================
                   TELEMETRY
                ========================= */

                if (data.telemetry) {

                    const sensorValues =
                        machineCard.querySelectorAll(
                            ".mini-sensor strong"
                        );

                    if (sensorValues.length >= 4) {

                        sensorValues[0].textContent =
                            Number(
                                data.telemetry.volt
                            ).toFixed(2);

                        sensorValues[1].textContent =
                            Number(
                                data.telemetry.rotate
                            ).toFixed(2);

                        sensorValues[2].textContent =
                            Number(
                                data.telemetry.pressure
                            ).toFixed(2);

                        sensorValues[3].textContent =
                            Number(
                                data.telemetry.vibration
                            ).toFixed(2);
                    }


                    /* =========================
                       ML PREDICTION
                    ========================= */

                    const predictionResponse =
                        await fetch(
                            "http://localhost/SMDE_fixed/SMDE/backend/api/predict.php",
                            {
                                method: "POST",

                                credentials: "include",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    volt:
                                        data.telemetry.volt,

                                    rotate:
                                        data.telemetry.rotate,

                                    pressure:
                                        data.telemetry.pressure,

                                    vibration:
                                        data.telemetry.vibration
                                })
                            }
                        );


                    if (!predictionResponse.ok) {

                        throw new Error(
                            `Prediction HTTP Error: ${predictionResponse.status}`
                        );
                    }


                    const prediction =
                        await predictionResponse.json();


                    console.log(
                        `${machineId} prediction:`,
                        prediction
                    );


                    /* =========================
                       RISK CALCULATION
                    ========================= */

                    const probability =
                        Number(
                            prediction.probability
                        ) * 100;


                    let riskText;
                    let statusText;
                    let riskClass;


                    if (probability < 30) {

                        riskText =
                            `${probability.toFixed(1)}%`;

                        statusText =
                            "Normal";

                        riskClass =
                            "risk-normal";

                    } else if (probability < 70) {

                        riskText =
                            `${probability.toFixed(1)}%`;

                        statusText =
                            "Needs Attention";

                        riskClass =
                            "risk-warning";

                    } else {

                        riskText =
                            `${probability.toFixed(1)}%`;

                        statusText =
                            "Critical";

                        riskClass =
                            "risk-critical";
                    }


                    /* =========================
                       UPDATE RISK SECTION
                    ========================= */

                    const riskValue =
                        machineCard.querySelector(
                            ".risk-section strong"
                        );

                    const riskStatus =
                        machineCard.querySelector(
                            ".risk-section span"
                        );


                    if (riskValue) {

                        riskValue.textContent =
                            riskText;


                        riskValue.classList.remove(
                            "risk-normal",
                            "risk-warning",
                            "risk-critical"
                        );


                        riskValue.classList.add(
                            riskClass
                        );
                    }


                    if (riskStatus) {

                        riskStatus.textContent =
                            statusText;
                    }


                    /* =========================
                       UPDATE MACHINE STATUS
                    ========================= */

                    if (probability < 30) {

                        machineCard.dataset.status =
                            "normal";

                    } else if (probability < 70) {

                        machineCard.dataset.status =
                            "warning";

                    } else {

                        machineCard.dataset.status =
                            "critical";
                    }
                }


                /* =========================
                   MACHINE MODEL FOR SEARCH
                ========================= */

                machineCard.dataset.model =
                    data.model;


                console.log(
                    `${machineId} loaded successfully`,
                    data
                );


            } catch (error) {

                console.error(
                    `Failed to load ${machineId}:`,
                    error
                );
            }
        }
    );


    /* =========================
       WAIT FOR ALL MACHINES
    ========================= */

    await Promise.all(
        machinePromises
    );


    /* =========================
       UPDATE OVERVIEW CARDS
    ========================= */

    const normalCount =
        document.getElementById(
            "normalMachines"
        );

    const warningCount =
        document.getElementById(
            "warningMachines"
        );

    const criticalCount =
        document.getElementById(
            "criticalMachines"
        );


    let normal = 0;
    let warning = 0;
    let critical = 0;


    machineItems.forEach(machine => {

        const status =
            machine.dataset.status;


        if (status === "normal") {

            normal++;

        } else if (status === "warning") {

            warning++;

        } else if (status === "critical") {

            critical++;
        }

    });


    if (normalCount) {
        normalCount.textContent =
            normal;
    }

    if (warningCount) {
        warningCount.textContent =
            warning;
    }

    if (criticalCount) {
        criticalCount.textContent =
            critical;
    }
}


/* =========================
   MACHINE FILTER SYSTEM
========================= */

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );


let currentFilter = "all";


/* =========================
   FILTER BUTTONS
========================= */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            currentFilter =
                button.dataset.filter;


            filterMachines();
        }
    );

});


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    filterMachines
);


/* =========================
   FILTER MACHINES
========================= */

function filterMachines() {

    const searchValue =
        searchInput.value
            .toLowerCase()
            .trim();


    let visibleMachines = 0;


    machineItems.forEach(machine => {

        const status =
            machine.dataset.status
                .toLowerCase();


        const name =
            machine.dataset.name
                .toLowerCase();


        const model =
            machine.dataset.model
                ? machine.dataset.model
                    .toLowerCase()
                : "";


        const matchesFilter =
            currentFilter === "all" ||
            status === currentFilter;


        const matchesSearch =
            name.includes(searchValue) ||
            model.includes(searchValue);


        if (
            matchesFilter &&
            matchesSearch
        ) {

            machine.style.display =
                "";

            visibleMachines++;

        } else {

            machine.style.display =
                "none";
        }

    });


    if (visibleMachines === 0) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";
    }
}


/* =========================
   VIEW MACHINE DETAILS
========================= */

function viewMachine(machineId) {

    window.location.href =
        `machine-details.html?id=${machineId}`;
}


/* =========================
   START MACHINES PAGE
========================= */

async function startMachinesPage() {

    await loadMachines();

    filterMachines();
}


startMachinesPage();
