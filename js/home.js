function showDecision() {

    const button = document.querySelector("#decision .btn-primary-custom");

    const originalText = button.innerHTML;

    button.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Analyzing Machine...
    `;

    button.disabled = true;

    setTimeout(() => {

        button.innerHTML = `
            <i class="bi bi-check-circle me-2"></i>
            Decision Ready
        `;

        button.disabled = false;

        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2500);

    }, 1500);
}
