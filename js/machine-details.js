/* =========================================
   GET MACHINE ID FROM URL
========================================= */

const params =
    new URLSearchParams(window.location.search);

const machineId =
    params.get("id");


/* =========================================
   LOAD MACHINE
========================================= */

async function loadMachine() {

    /* -------------------------------------
       MACHINE ID CHECK
    ------------------------------------- */

    if (!machineId) {

        document.getElementById(
            "machineName"
        ).textContent = "Machine Not Found";

        return;
    }


    /* =====================================
       CONVERT M-017 → 17
    ===================================== */

    const numericId =
        machineId.replace("M-", "");


    try {

        /* =================================
           GET COMPLETE MACHINE DATA
        ================================= */

        const response =
            await fetch(
                `http://localhost/SMDE_fixed/SMDE/backend/api/machine-details.php?machineID=${numericId}`,
                { credentials: "include" }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }


        const machine =
            await response.json();


        /* =================================
           CHECK BACKEND ERROR
        ================================= */

        if (machine.error) {

            throw new Error(
                machine.error
            );
        }


        /* =================================
           BASIC INFORMATION
        ================================= */

        document.getElementById(
            "machineId"
        ).textContent =
            `MACHINE ID · ${machineId}`;


        document.getElementById(
            "machineName"
        ).textContent =
            `Machine ${machine.machine.machineID}`;


        document.getElementById(
            "machineModel"
        ).textContent =
            machine.machine.model;


        document.getElementById(
            "machineAge"
        ).textContent =
            `${machine.machine.age} years`;


        /* =================================
           MAINTENANCE
        ================================= */

        if (machine.maintenance) {

            const latestMaintenance =
                machine.maintenance.latest;


            /* -----------------------------
               MAINTENANCE COUNT
            ----------------------------- */

            document.getElementById(
                "maintenanceCount"
            ).textContent =
                machine.maintenance.count ?? 0;


            /* -----------------------------
               LAST MAINTENANCE
            ----------------------------- */

            if (latestMaintenance) {

                const maintenanceDate =
                    latestMaintenance.datetime;

                const maintenanceComponent =
                    latestMaintenance.component;


                document.getElementById(
                    "lastMaintenance"
                ).textContent =
                    `${maintenanceComponent} · ${maintenanceDate}`;


                document.getElementById(
                    "maintenanceDate"
                ).textContent =
                    `${maintenanceComponent} · ${maintenanceDate}`;

            } else {

                document.getElementById(
                    "lastMaintenance"
                ).textContent =
                    "No records";


                document.getElementById(
                    "maintenanceDate"
                ).textContent =
                    "No records";
            }
        }


        /* =================================
           ERROR HISTORY
        ================================= */

        if (machine.errors) {

            const latestError =
                machine.errors.latest;


            /* -----------------------------
               ERROR COUNT
            ----------------------------- */

            document.getElementById(
                "errorCount"
            ).textContent =
                machine.errors.count ?? 0;


            /* -----------------------------
               LAST ERROR
            ----------------------------- */

            if (latestError) {

                document.getElementById(
                    "latestError"
                ).textContent =
                    `${latestError.errorID} · ${latestError.datetime}`;

            } else {

                document.getElementById(
                    "latestError"
                ).textContent =
                    "No records";
            }
        }


        /* =================================
           FAILURE HISTORY
        ================================= */

        if (machine.failures) {

            const latestFailure =
                machine.failures.latest;


            /* -----------------------------
               FAILURE COUNT
            ----------------------------- */

            document.getElementById(
                "failureCount"
            ).textContent =
                machine.failures.count ?? 0;


            /* -----------------------------
               LAST FAILURE
            ----------------------------- */

            if (latestFailure) {

                document.getElementById(
                    "latestFailure"
                ).textContent =
                    `${latestFailure.component} · ${latestFailure.datetime}`;

            } else {

                document.getElementById(
                    "latestFailure"
                ).textContent =
                    "No records";
            }
        }


        /* =================================
           TELEMETRY
        ================================= */

        if (machine.telemetry) {

            const telemetry =
                machine.telemetry;


            /* =============================
               VOLTAGE
            ============================= */

            document.getElementById(
                "voltage"
            ).textContent =
                Number(
                    telemetry.volt
                ).toFixed(2);


            /* =============================
               ROTATION
            ============================= */

            document.getElementById(
                "rotation"
            ).textContent =
                Number(
                    telemetry.rotate
                ).toFixed(2);


            /* =============================
               PRESSURE
            ============================= */

            document.getElementById(
                "pressure"
            ).textContent =
                Number(
                    telemetry.pressure
                ).toFixed(2);


            /* =============================
               VIBRATION
            ============================= */

            document.getElementById(
                "vibration"
            ).textContent =
                Number(
                    telemetry.vibration
                ).toFixed(2);


            /* =================================
               HEALTH CARD SENSOR VALUES
            ================================= */

            const healthValues =
                document.querySelectorAll(
                    ".health-info .health-row strong"
                );


            if (healthValues.length >= 4) {

                healthValues[0].textContent =
                    Number(
                        telemetry.volt
                    ).toFixed(2);

                healthValues[1].textContent =
                    Number(
                        telemetry.rotate
                    ).toFixed(2);

                healthValues[2].textContent =
                    Number(
                        telemetry.pressure
                    ).toFixed(2);

                healthValues[3].textContent =
                    Number(
                        telemetry.vibration
                    ).toFixed(2);
            }


            /* =================================
               TELEMETRY PROGRESS
            ================================= */

            updateProgressBars(
                telemetry
            );


            /* =================================
               HEALTH SCORE
            ================================= */

            const healthScore =
                calculateHealthScore(
                    telemetry
                );


            const healthScoreElement =
                document.getElementById(
                    "healthScore"
                );


            if (healthScoreElement) {

                healthScoreElement.textContent =
                    `${healthScore}%`;
            }
        }


        /* =================================
           CURRENT STATUS
        ================================= */

        document.getElementById(
            "machineStatus"
        ).textContent =
            "Monitoring";


        document.getElementById(
            "currentStatus"
        ).textContent =
            "Monitoring";


        /* =================================
           CONSOLE
        ================================= */

        console.log(
            `${machineId} loaded successfully`,
            machine
        );


    } catch (error) {

        console.error(
            "Failed to load machine:",
            error
        );


        document.getElementById(
            "machineName"
        ).textContent =
            "Failed to Load Machine";
    }
}


/* =========================================
   CALCULATE HEALTH SCORE
========================================= */

function calculateHealthScore(telemetry) {

    const voltage =
        Number(telemetry.volt);

    const rotation =
        Number(telemetry.rotate);

    const pressure =
        Number(telemetry.pressure);

    const vibration =
        Number(telemetry.vibration);


    /* -------------------------------------
       SENSOR HEALTH
    ------------------------------------- */

    const voltageHealth =
        Math.max(
            0,
            100 - (voltage / 250) * 100
        );


    const rotationHealth =
        Math.max(
            0,
            100 - (rotation / 600) * 100
        );


    const pressureHealth =
        Math.max(
            0,
            100 - (pressure / 150) * 100
        );


    const vibrationHealth =
        Math.max(
            0,
            100 - (vibration / 100) * 100
        );


    /* -------------------------------------
       AVERAGE
    ------------------------------------- */

    const score =
        (
            voltageHealth +
            rotationHealth +
            pressureHealth +
            vibrationHealth
        ) / 4;


    return Math.round(
        Math.min(
            100,
            score
        )
    );
}


/* =========================================
   TELEMETRY PROGRESS BARS
========================================= */

function updateProgressBars(telemetry) {

    const voltage =
        Number(telemetry.volt);

    const rotation =
        Number(telemetry.rotate);

    const pressure =
        Number(telemetry.pressure);

    const vibration =
        Number(telemetry.vibration);


    /* -------------------------------------
       PROGRESS CALCULATION
    ------------------------------------- */

    const voltagePercent =
        Math.min(
            (voltage / 250) * 100,
            100
        );


    const rotationPercent =
        Math.min(
            (rotation / 600) * 100,
            100
        );


    const pressurePercent =
        Math.min(
            (pressure / 150) * 100,
            100
        );


    const vibrationPercent =
        Math.min(
            (vibration / 100) * 100,
            100
        );


    /* -------------------------------------
       UPDATE BARS
    ------------------------------------- */

    document.getElementById(
        "voltageProgress"
    ).style.width =
        `${voltagePercent}%`;


    document.getElementById(
        "rotationProgress"
    ).style.width =
        `${rotationPercent}%`;


    document.getElementById(
        "pressureProgress"
    ).style.width =
        `${pressurePercent}%`;


    document.getElementById(
        "vibrationProgress"
    ).style.width =
        `${vibrationPercent}%`;
}


/* =========================================
   RUN PREDICTION
========================================= */

function goToPrediction() {

    if (!machineId) {

        alert(
            "Machine ID not found."
        );

        return;
    }


    window.location.href =
        `prediction.html?machine=${machineId}`;
}


/* =========================================
   MAINTENANCE HISTORY
========================================= */

function viewMaintenanceHistory() {

    window.location.href =
        `history.html?machine=${machineId}`;
}


/* =========================================
   LOAD PAGE
========================================= */

loadMachine();
