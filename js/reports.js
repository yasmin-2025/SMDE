document.addEventListener("DOMContentLoaded", async function () {
    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    const userID =
        localStorage.getItem("smde_user_id");


    if (!userID) {

        console.error(
            "User session not found."
        );

        return;
    }


    // =====================================================
    // LOAD PREDICTIONS FROM MYSQL
    // =====================================================

    let predictions = [];


    try {

        const response = await fetch(
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


        if (data.error) {

            throw new Error(
                data.error
            );

        }


        predictions = data;


        console.log(
            "Reports predictions:",
            predictions
        );

    }


    catch (error) {

        console.error(
            "Failed to load reports:",
            error
        );

        return;

    }


    // =====================================================
    // SUMMARY ELEMENTS
    // =====================================================

    const totalPredictions =
        document.getElementById(
            "totalPredictions"
        );

    const averageRisk =
        document.getElementById(
            "averageRisk"
        );

    const mostAtRisk =
        document.getElementById(
            "mostAtRisk"
        );

    const normalPercentage =
        document.getElementById(
            "normalPercentage"
        );


    // =====================================================
    // TOTAL PREDICTIONS
    // =====================================================

    const total =
        predictions.length;


    if (totalPredictions) {

        totalPredictions.textContent =
            total;

    }


    // =====================================================
    // AVERAGE FAILURE PROBABILITY
    // =====================================================

    let average =
        0;


    if (total > 0) {

        const sum =
            predictions.reduce(
                function (totalValue, item) {

                    return totalValue +
                        Number(
                            item.probability || 0
                        );

                },
                0
            );


        average =
            sum / total;

    }


    if (averageRisk) {

        averageRisk.textContent =
            `${average.toFixed(1)}%`;

    }


    // =====================================================
    // MOST AT-RISK MACHINE
    // =====================================================

    let highestRisk =
        null;


    if (total > 0) {

        highestRisk =
            predictions.reduce(
                function (highest, item) {

                    if (!highest) {

                        return item;

                    }


                    return Number(
                        item.probability || 0
                    ) >

                    Number(
                        highest.probability || 0
                    )

                        ? item
                        : highest;

                },
                null
            );

    }


    if (mostAtRisk) {

        mostAtRisk.textContent =
            highestRisk
                ? highestRisk.machine
                : "—";

    }


    // =====================================================
    // NORMAL RESULTS
    // =====================================================

    const normalCount =
        predictions.filter(
            item => item.risk === "low"
        ).length;


    const normalPercent =
        total > 0

            ? (normalCount / total) * 100

            : 0;


    if (normalPercentage) {

        normalPercentage.textContent =
            `${normalPercent.toFixed(0)}%`;

    }


    // =====================================================
    // CHART DEFAULTS
    // =====================================================

    Chart.defaults.color =
        "#8093aa";


    Chart.defaults.font.family =
        "Segoe UI, sans-serif";


    const gridColor =
        "rgba(255,255,255,0.06)";


    // =====================================================
    // TREND CHART
    // =====================================================

    const trendCanvas =
        document.getElementById(
            "trendChart"
        );


    if (trendCanvas) {

        const trendData =
            predictions
                .slice(0, 7)
                .reverse();


        new Chart(
            trendCanvas,
            {

                type: "line",

                data: {

                    labels:
                        trendData.map(
                            item =>
                                item.date || "-"
                        ),

                    datasets: [

                        {

                            label:
                                "Failure Probability (%)",

                            data:
                                trendData.map(
                                    item =>
                                        Number(
                                            item.probability || 0
                                        )
                                ),

                            borderColor:
                                "#168cff",

                            backgroundColor:
                                "rgba(22,140,255,0.15)",

                            tension:
                                0.35,

                            fill:
                                true,

                            pointBackgroundColor:
                                "#168cff"

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            grid: {
                                color:
                                    gridColor
                            }

                        },

                        y: {

                            grid: {
                                color:
                                    gridColor
                            },

                            beginAtZero:
                                true,

                            max:
                                100

                        }

                    }

                }

            }

        );

    }


    // =====================================================
    // RISK DISTRIBUTION
    // =====================================================

    const riskCanvas =
        document.getElementById(
            "riskChart"
        );


    if (riskCanvas) {

        const low =
            predictions.filter(
                item => item.risk === "low"
            ).length;


        const medium =
            predictions.filter(
                item => item.risk === "medium"
            ).length;


        const high =
            predictions.filter(
                item => item.risk === "high"
            ).length;


        new Chart(
            riskCanvas,
            {

                type: "doughnut",

                data: {

                    labels: [
                        "Low",
                        "Medium",
                        "High"
                    ],

                    datasets: [

                        {

                            data: [
                                low,
                                medium,
                                high
                            ],

                            backgroundColor: [
                                "#48d597",
                                "#ffad42",
                                "#ff4d67"
                            ],

                            borderWidth:
                                0

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }

        );

    }


    // =====================================================
    // PREDICTIONS PER MACHINE
    // =====================================================

    const machineCanvas =
        document.getElementById(
            "machineChart"
        );


    if (machineCanvas) {

        const machineCounts =
            {};


        predictions.forEach(
            function (item) {

                const machine =
                    item.mode === "manual"
                        ? "Manual Test"
                        : item.machine;


                machineCounts[machine] =
                    (
                        machineCounts[machine] ||
                        0
                    ) + 1;

            }
        );


        new Chart(
            machineCanvas,
            {

                type: "bar",

                data: {

                    labels:
                        Object.keys(
                            machineCounts
                        ),

                    datasets: [

                        {

                            label:
                                "Predictions",

                            data:
                                Object.values(
                                    machineCounts
                                ),

                            backgroundColor:
                                "#168cff",

                            borderRadius:
                                6,

                            maxBarThickness:
                                45

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            grid: {
                                display: false
                            }

                        },

                        y: {

                            grid: {

                                color:
                                    gridColor

                            },

                            beginAtZero:
                                true,

                            ticks: {

                                precision:
                                    0

                            }

                        }

                    }

                }

            }

        );

    }

});