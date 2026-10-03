
document.addEventListener("DOMContentLoaded", function () {


    // =====================================================
    // GET DATA FROM URL
    // =====================================================

    const params =
        new URLSearchParams(window.location.search);


    const id =
        params.get("id");

    const machine =
        params.get("machine");

    const mode =
        params.get("mode");

    const date =
        params.get("date");

    const time =
        params.get("time");

    const voltage =
        params.get("voltage");

    const rotation =
        params.get("rotation");

    const pressure =
        params.get("pressure");

    const vibration =
        params.get("vibration");

    const probability =
        parseFloat(
            params.get("probability")
        );

    const risk =
        params.get("risk");

    const status =
        params.get("status");


    // =====================================================
    // CHECK IF RECORD EXISTS
    // =====================================================

    if (
        !machine ||
        isNaN(probability) ||
        !risk
    ) {

        document.getElementById(
            "resultMachineTitle"
        ).textContent =
            "No Record Selected";


        document.getElementById(
            "resultSubtitle"
        ).textContent =
            "Open this page from Prediction or Prediction History to see a specific record.";


        document.getElementById(
            "resultCard"
        ).classList.add("d-none");


        document
            .querySelector(".custom-card")
            .classList.add("d-none");


        return;

    }


    // =====================================================
    // HEADER
    // =====================================================

    if (mode === "manual") {

        document.getElementById(
            "resultMachineTitle"
        ).textContent =
            "Manual Test";

    }

    else {

        document.getElementById(
            "resultMachineTitle"
        ).textContent =
            `Machine ${machine}`;

    }


    document.getElementById(
        "resultSubtitle"
    ).textContent =
        `Prediction recorded on ${date} at ${time}.`;


    // =====================================================
    // RESULT ELEMENTS
    // =====================================================

    const resultIcon =
        document.getElementById(
            "resultIcon"
        );


    const resultTitle =
        document.getElementById(
            "resultTitle"
        );


    const resultMessage =
        document.getElementById(
            "resultMessage"
        );


    const probabilityEl =
        document.getElementById(
            "probability"
        );


    const riskInfoIcon =
        document.getElementById(
            "riskInfoIcon"
        );


    const riskExplanation =
        document.getElementById(
            "riskExplanation"
        );


    const recommendationText =
        document.getElementById(
            "recommendationText"
        );


    // =====================================================
    // SHOW PROBABILITY
    // =====================================================

    probabilityEl.textContent =
        `${probability.toFixed(1)}%`;


    // =====================================================
    // DETERMINE RESULT
    // =====================================================

    if (risk === "low") {


        // ICON

        resultIcon.innerHTML =
            `<i class="bi bi-check-lg"></i>`;


        resultIcon.style.color =
            "#48d597";


        resultIcon.style.background =
            "rgba(72,213,151,0.1)";


        // TITLE

        resultTitle.textContent =
            "Machine Operating Normally";


        // MESSAGE

        resultMessage.textContent =
            "The model predicted a low probability of failure. No immediate action is needed.";


        // PROBABILITY COLOR

        probabilityEl.style.color =
            "#48d597";


        // INFO ICON

        riskInfoIcon.innerHTML =
            `<i class="bi bi-shield-check"></i>`;


        // EXPLANATION

        riskExplanation.textContent =
            "A low risk score means the machine's sensor readings were within normal operating ranges at the time of the prediction.";


        // RECOMMENDATION

        recommendationText.textContent =
            "Continue routine monitoring. No maintenance action required.";

    }


    else if (risk === "medium") {


        // ICON

        resultIcon.innerHTML =
            `<i class="bi bi-exclamation-triangle"></i>`;


        resultIcon.style.color =
            "#ffc107";


        resultIcon.style.background =
            "rgba(255,193,7,0.1)";


        // TITLE

        resultTitle.textContent =
            "Machine Needs Attention";


        // MESSAGE

        resultMessage.textContent =
            "The model detected early signs of abnormal behavior. A closer inspection is recommended.";


        // PROBABILITY COLOR

        probabilityEl.style.color =
            "#ffc107";


        // INFO ICON

        riskInfoIcon.innerHTML =
            `<i class="bi bi-exclamation-triangle"></i>`;


        // EXPLANATION

        riskExplanation.textContent =
            "A medium risk score means some sensor readings were outside typical ranges, which can be an early indicator of abnormal machine behavior.";


        // RECOMMENDATION

        recommendationText.textContent =
            "Schedule an inspection within the next few days to confirm machine condition.";

    }


    else if (risk === "high") {


        // ICON

        resultIcon.innerHTML =
            `<i class="bi bi-exclamation-octagon"></i>`;


        resultIcon.style.color =
            "#ff6b6b";


        resultIcon.style.background =
            "rgba(255,107,107,0.1)";


        // TITLE

        resultTitle.textContent =
            "Potential Machine Failure Detected";


        // MESSAGE

        resultMessage.textContent =
            "The model detected abnormal operating conditions consistent with a high failure risk.";


        // PROBABILITY COLOR

        probabilityEl.style.color =
            "#ff6b6b";


        // INFO ICON

        riskInfoIcon.innerHTML =
            `<i class="bi bi-exclamation-octagon"></i>`;


        // EXPLANATION

        riskExplanation.textContent =
            "A high risk score means multiple sensor readings strongly deviated from normal operating ranges.";


        // RECOMMENDATION

        recommendationText.textContent =
            "Schedule urgent maintenance inspection within the next 24 hours.";

    }


    // =====================================================
    // RECORD DETAILS
    // =====================================================

    document.getElementById(
        "detailMachine"
    ).textContent =
        machine;


    // =====================================================
    // PREDICTION MODE
    // =====================================================

    document.getElementById(
        "detailMode"
    ).textContent =
        mode === "existing"
            ? "Existing Machine"
            : "Manual Test";


    // =====================================================
    // DATE & TIME
    // =====================================================

    document.getElementById(
        "detailDate"
    ).textContent =
        `${date} · ${time}`;


    // =====================================================
    // SENSOR VALUES
    // =====================================================

    document.getElementById(
        "detailVoltage"
    ).textContent =
        voltage;


    document.getElementById(
        "detailRotation"
    ).textContent =
        rotation;


    document.getElementById(
        "detailPressure"
    ).textContent =
        pressure;


    document.getElementById(
        "detailVibration"
    ).textContent =
        vibration;


    // =====================================================
    // RISK
    // =====================================================

    document.getElementById(
        "detailRisk"
    ).textContent =
        risk.charAt(0).toUpperCase()
        + risk.slice(1);


    // =====================================================
    // STATUS
    // =====================================================

    document.getElementById(
        "detailStatus"
    ).textContent =
        status;


    // =====================================================
    // RUN PREDICTION AGAIN
    // =====================================================

    if (mode === "existing") {

        document.getElementById(
            "rerunLink"
        ).href =
            `prediction.html?machine=${encodeURIComponent(machine)}`;

    }

    else {

        document.getElementById(
            "rerunLink"
        ).href =
            "prediction.html";

    }

});