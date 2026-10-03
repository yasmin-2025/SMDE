function togglePassword() {

    const password = document.getElementById("password");
    const icon = document.getElementById("eyeIcon");

    if (password.type === "password") {

        password.type = "text";

        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");

    } else {

        password.type = "password";

        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");

    }
}


// ================= LOGIN =================

document
    .getElementById("loginForm")
    .addEventListener("submit", function(e) {

        e.preventDefault();


        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("loginMessage");


        // Clear old message

        message.innerHTML = "";

        message.classList.remove(
            "success-message",
            "error-message"
        );


        // ================= SEND DATA =================

        const formData = new FormData();

        formData.append("email", email);
        formData.append("password", password);


        fetch("../backend/api/login.php", {

            method: "POST",

            credentials: "include",

            body: formData

        })

        .then(response => response.json())

        .then(data => {

            if (data.success) {

                message.innerHTML = `
                    <i class="bi bi-check-circle"></i>
                    ${data.message}
                `;

                message.classList.add("success-message");


                // ================= SAVE USER ID =================

                localStorage.setItem(
                    "smde_user_id",
                    data.user.id
                );


                // Go to Dashboard

                setTimeout(() => {

                    window.location.href = "dashboard.html";

                }, 1000);


            } else {

                message.innerHTML = `
                    <i class="bi bi-exclamation-circle"></i>
                    ${data.message}
                `;

                message.classList.add("error-message");

            }

        })

        .catch(error => {

            console.error(error);

            message.innerHTML = `
                <i class="bi bi-exclamation-circle"></i>
                Something went wrong. Please try again.
            `;

            message.classList.add("error-message");

        });

    });

