async function loadDashboard() {

    try {

       const response = await fetch(
         "http://localhost/SMDE_fixed/SMDE/backend/api/dashboard.php",
          { credentials: "include" }
        );

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        console.log("Dashboard data:", data);


        // =========================================
        // DATASET OVERVIEW
        // =========================================

        const totalMachines =
            document.getElementById("totalMachines");

        if (totalMachines) {

            totalMachines.textContent =
                Number(data.totalMachines).toLocaleString();

        }


        const totalTelemetry =
            document.getElementById("totalTelemetry");

        if (totalTelemetry) {

            totalTelemetry.textContent =
                Number(data.totalTelemetry).toLocaleString();

        }


        const totalErrors =
            document.getElementById("totalErrors");

        if (totalErrors) {

            totalErrors.textContent =
                Number(data.totalErrors).toLocaleString();

        }


        const totalMaintenance =
            document.getElementById("totalMaintenance");

        if (totalMaintenance) {

            totalMaintenance.textContent =
                Number(data.totalMaintenance).toLocaleString();

        }


        // =========================================
        // EVENTS OVERVIEW
        // =========================================

        const eventErrors =
            document.getElementById("eventErrors");

        if (eventErrors) {

            eventErrors.textContent =
                Number(data.totalErrors).toLocaleString();

        }


        const eventMaintenance =
            document.getElementById("eventMaintenance");

        if (eventMaintenance) {

            eventMaintenance.textContent =
                Number(data.totalMaintenance).toLocaleString();

        }


        const totalFailures =
            document.getElementById("totalFailures");

        if (totalFailures) {

            totalFailures.textContent =
                Number(data.totalFailures).toLocaleString();

        }


        // =========================================
        // MACHINE MODELS
        // =========================================

        const modelCards =
            document.querySelectorAll(
                ".model-data-card h5"
            );


        if (data.models) {

            data.models.forEach(
                (model, index) => {

                    if (modelCards[index]) {

                        modelCards[index].textContent =
                            model;

                    }

                }
            );

        }


        // =========================================
        // RECENT PREDICTIONS
        // =========================================

        const tableBody =
            document.getElementById(
                "recentPredictionsBody"
            );


        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = "";


        // =========================================
        // NO PREDICTIONS
        // =========================================

        if (
            !data.recentPredictions ||
            data.recentPredictions.length === 0
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        class="text-center"
                    >
                        No predictions yet
                    </td>
                </tr>
            `;

            return;
        }


        // =========================================
        // ADD RECENT PREDICTIONS
        // =========================================

        data.recentPredictions.forEach(
            prediction => {

                const machine =
                    `M-${String(
                        prediction.machineID
                    ).padStart(3, "0")}`;


                const probability =
                    (
                        Number(
                            prediction.probability
                        ) * 100
                    ).toFixed(1);


                const row =
                    document.createElement("tr");


                row.innerHTML = `
                    <td>
                        ${machine}
                    </td>

                    <td>
                        ${prediction.created_at}
                    </td>

                    <td>
                        ${probability}%
                    </td>

                    <td>
                        <span
                            class="risk-badge risk-${prediction.risk.toLowerCase()}"
                        >
                            ${prediction.risk}
                        </span>
                    </td>
                `;


                tableBody.appendChild(row);

            }
        );

    }


    catch (error) {

        console.error(
            "Failed to load dashboard:",
            error
        );

    }

}


// =========================================
// START DASHBOARD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    loadDashboard
);