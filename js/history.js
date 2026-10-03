document.addEventListener("DOMContentLoaded", function () {
    // ==========================================
    // ELEMENTS
    // ==========================================

    const totalPredictions =
        document.getElementById("totalPredictions");

    const normalPredictions =
        document.getElementById("normalPredictions");

    const mediumPredictions =
        document.getElementById("mediumPredictions");

    const highPredictions =
        document.getElementById("highPredictions");

    const historyTable =
        document.getElementById("historyTable");

    const recordsCount =
        document.getElementById("recordsCount");

    const emptyState =
        document.getElementById("emptyState");

    const searchInput =
        document.getElementById("searchInput");

    const riskFilter =
        document.getElementById("riskFilter");

    const resetFilters =
        document.getElementById("resetFilters");


    // ==========================================
    // USER ID
    // ==========================================

    const userID =
        localStorage.getItem("smde_user_id");


    if (!userID) {

        alert(
            "User session not found. Please login again."
        );

        return;

    }


    // ==========================================
    // LOAD PREDICTIONS FROM MYSQL
    // ==========================================

    async function loadPredictions() {

        try {

            const response =
                await fetch(
                    `http://localhost/SMDE_fixed/SMDE/backend/api/history.php?user_id=${encodeURIComponent(userID)}`,
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
                "History data:",
                data
            );


            if (data.error) {

                throw new Error(
                    data.error
                );

            }


            predictions = data;


            updateSummary(predictions);

            displayPredictions(predictions);


        }

        catch (error) {

            console.error(
                "History API Error:",
                error
            );


            historyTable.innerHTML = "";


            emptyState.classList.remove(
                "d-none"
            );


            recordsCount.textContent =
                "0 Records";

        }

    }


    let predictions = [];


    // ==========================================
    // UPDATE SUMMARY
    // ==========================================

    function updateSummary(data) {

        const total =
            data.length;


        const normal =
            data.filter(
                item =>
                    item.risk === "low"
            ).length;


        const medium =
            data.filter(
                item =>
                    item.risk === "medium"
            ).length;


        const high =
            data.filter(
                item =>
                    item.risk === "high"
            ).length;


        totalPredictions.textContent =
            total;

        normalPredictions.textContent =
            normal;

        mediumPredictions.textContent =
            medium;

        highPredictions.textContent =
            high;

    }


    // ==========================================
    // DISPLAY TABLE
    // ==========================================

    function displayPredictions(data) {

        historyTable.innerHTML = "";


        if (data.length === 0) {

            emptyState.classList.remove(
                "d-none"
            );

            recordsCount.textContent =
                "0 Records";

            return;

        }


        emptyState.classList.add(
            "d-none"
        );


        recordsCount.textContent =
            `${data.length} Records`;


        data.forEach(function (item) {

            const row =
                document.createElement("tr");


            const machineNumber =
                item.machine || "Manual Test";


            row.innerHTML = `

                <td>

                    <div class="machine-cell">

                        <div class="machine-mini-icon">

                            <i class="bi bi-cpu"></i>

                        </div>

                        <div>

                            <strong>
                                ${machineNumber}
                            </strong>

                            <small>
                                Machine
                            </small>

                        </div>

                    </div>

                </td>


                <td>

                    ${item.mode === "existing"
                        ? "Existing Machine"
                        : "Manual Test"}

                </td>


                <td>

                    ${item.date || "-"}

                    <br>

                    <small>
                        ${item.time || "-"}
                    </small>

                </td>


                <td>

                    <strong class="probability-text">

                        ${Number(
                            item.probability || 0
                        ).toFixed(2)}%

                    </strong>

                </td>


                <td>

                    <span
                        class="risk-badge risk-${item.risk}"
                    >

                        ${capitalize(
                            item.risk
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="status-badge status-${getStatusClass(item.status)}"
                    >

                        ${item.status || "-"}

                    </span>

                </td>


                <td>

                    <button
                        class="btn btn-sm btn-outline-light view-btn"
                        data-id="${item.id}"
                    >

                        <i class="bi bi-eye"></i>

                        View

                    </button>

                </td>

            `;


            historyTable.appendChild(row);

        });


        // ==========================================
        // VIEW BUTTON
        // ==========================================

        const viewButtons =
            document.querySelectorAll(
                ".view-btn"
            );


        viewButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        this.dataset.id;


                    const selectedRecord =
                        predictions.find(
                            item =>
                                String(item.id) ===
                                String(id)
                        );


                    if (!selectedRecord) {

                        return;

                    }


                    const resultURL =
    `./result.html?` +

    `id=${encodeURIComponent(selectedRecord.id)}` +

    `&mode=${encodeURIComponent(selectedRecord.mode)}` +

    `&machine=${encodeURIComponent(selectedRecord.machine)}` +

    `&voltage=${encodeURIComponent(selectedRecord.voltage)}` +

    `&rotation=${encodeURIComponent(selectedRecord.rotation)}` +

    `&pressure=${encodeURIComponent(selectedRecord.pressure)}` +

    `&vibration=${encodeURIComponent(selectedRecord.vibration)}` +

    `&probability=${encodeURIComponent(selectedRecord.probability)}` +

    `&risk=${encodeURIComponent(selectedRecord.risk)}` +

    `&status=${encodeURIComponent(selectedRecord.status)}` +

    `&date=${encodeURIComponent(selectedRecord.date)}` +

    `&time=${encodeURIComponent(selectedRecord.time)}`;


        window.location.href =
            resultURL;

                }
            );

        });

    }


    // ==========================================
    // STATUS CLASS
    // ==========================================

    function getStatusClass(status) {

        if (status === "Normal") {

            return "normal";

        }

        if (status === "Needs Attention") {

            return "warning";

        }

        if (status === "Critical") {

            return "critical";

        }

        return "normal";

    }


    // ==========================================
    // CAPITALIZE
    // ==========================================

    function capitalize(text) {

        if (!text) {

            return "";

        }

        return text.charAt(0).toUpperCase() +
            text.slice(1);

    }


    // ==========================================
    // FILTER
    // ==========================================

    function filterPredictions() {

        const searchValue =
            searchInput.value
                .trim()
                .toLowerCase();


        const selectedRisk =
            riskFilter.value;


        const filtered =
            predictions.filter(
                function (item) {

                    const machine =
                        String(
                            item.machine || ""
                        ).toLowerCase();


                    const matchesSearch =
                        machine.includes(
                            searchValue
                        );


                    const matchesRisk =
                        selectedRisk === "all" ||
                        item.risk === selectedRisk;


                    return (
                        matchesSearch &&
                        matchesRisk
                    );

                }
            );


        updateSummary(filtered);

        displayPredictions(filtered);

    }


    // ==========================================
    // SEARCH
    // ==========================================

    searchInput.addEventListener(
        "input",
        filterPredictions
    );


    // ==========================================
    // RISK FILTER
    // ==========================================

    riskFilter.addEventListener(
        "change",
        filterPredictions
    );


    // ==========================================
    // RESET
    // ==========================================

    resetFilters.addEventListener(
        "click",
        function () {

            searchInput.value = "";

            riskFilter.value = "all";

            filterPredictions();

        }
    );


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    loadPredictions();

});
