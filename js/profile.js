document.addEventListener("DOMContentLoaded", function () {

    const editProfileBtn =
        document.getElementById("editProfileBtn");

    const saveProfileBtn =
        document.getElementById("saveProfileBtn");

    const changePasswordBtn =
        document.getElementById("changePasswordBtn");


    const editProfileModalEl =
        document.getElementById("editProfileModal");


    const fullNameDisplay =
        document.getElementById("fullName");

    const emailDisplay =
        document.getElementById("email");


    const editName =
        document.getElementById("editName");

    const editEmail =
        document.getElementById("editEmail");


    const profileAvatar =
        document.querySelector(".profile-avatar");


    // ==========================================
    // FORMAT DATE
    // ==========================================

    function formatDate(dateString) {

        if (!dateString) {
            return "Not available";
        }

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return "Not available";
        }

        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

    }


    // ==========================================
    // FORMAT TIME
    // ==========================================

    function formatTime(dateString) {

        if (!dateString) {
            return "Not available";
        }

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return "Not available";
        }

        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });

    }


    // ==========================================
    // FIND PROFILE INFO BY LABEL
    // ==========================================

    function setProfileInfo(labelText, value) {

        const elements =
            document.querySelectorAll("*");


        for (const element of elements) {

            if (
                element.children.length === 0 &&
                element.textContent.trim() === labelText
            ) {

                const parent =
                    element.parentElement;


                if (!parent) {
                    continue;
                }


                const valueElement =
                    parent.querySelector(
                        "span:last-child"
                    );


                if (
                    valueElement &&
                    valueElement !== element
                ) {

                    valueElement.textContent =
                        value;

                    return;
                }

            }

        }

    }


    // ==========================================
    // LOAD PROFILE
    // ==========================================

    fetch("../backend/api/profile.php", { credentials: "include" })

        .then(response => response.json())

        .then(data => {

            if (!data.success) {

                console.log(data.message);

                window.location.href =
                    "login.html";

                return;

            }


            const user = data.user;


            // ==========================================
            // DISPLAY USER DATA
            // ==========================================

            fullNameDisplay.textContent =
                user.name;

            emailDisplay.textContent =
                user.email;


            // ==========================================
            // PROFILE HEADER
            // ==========================================

            const profileName =
                document.querySelector(
                    ".profile-main-info h2"
                );


            if (profileName) {

                profileName.textContent =
                    user.name;

            }


            // ==========================================
            // AVATAR
            // ==========================================

            if (
                profileAvatar &&
                user.name
            ) {

                profileAvatar.textContent =
                    user.name
                        .charAt(0)
                        .toUpperCase();

            }


            // ==========================================
            // ACCOUNT CREATED
            // DATE ONLY
            // ==========================================

            setProfileInfo(
                "Account Created",
                formatDate(user.created_at)
            );


            // ==========================================
            // LAST LOGIN
            // TIME ONLY
            // ==========================================

            setProfileInfo(
                "Last Login",
                formatTime(user.last_login)
            );


            // ==========================================
            // EDIT MODAL DEFAULT VALUES
            // ==========================================

            editName.value =
                user.name;

            editEmail.value =
                user.email;

        })


        .catch(error => {

            console.error(
                "Profile error:",
                error
            );

        });


    // ==========================================
    // EDIT PROFILE MODAL
    // ==========================================

    let editProfileModal = null;


    if (editProfileModalEl) {

        editProfileModal =
            new bootstrap.Modal(
                editProfileModalEl
            );

    }


    if (
        editProfileBtn &&
        editProfileModal
    ) {

        editProfileBtn.addEventListener(
            "click",
            function () {


                editName.value =
                    fullNameDisplay
                        .textContent
                        .trim();


                editEmail.value =
                    emailDisplay
                        .textContent
                        .trim();


                editProfileModal.show();

            }
        );

    }


    // ==========================================
    // SAVE PROFILE
    // ==========================================

    if (saveProfileBtn) {

        saveProfileBtn.addEventListener(
            "click",
            function () {


                const name =
                    editName.value.trim();


                const email =
                    editEmail.value.trim();


                // ==========================================
                // VALIDATION
                // ==========================================

                if (name === "") {

                    alert(
                        "Please enter your name."
                    );

                    return;

                }


                if (email === "") {

                    alert(
                        "Please enter your email."
                    );

                    return;

                }


                // ==========================================
                // SEND DATA TO PHP
                // ==========================================

                const formData =
                    new FormData();


                formData.append(
                    "name",
                    name
                );


                formData.append(
                    "email",
                    email
                );


                fetch(
                    "../backend/api/update_profile.php",
                    {
                        method: "POST",
                        credentials: "include",
                        body: formData
                    }
                )


                .then(response =>
                    response.json()
                )


                .then(data => {


                    // ==========================================
                    // CHECK RESPONSE
                    // ==========================================

                    if (!data.success) {

                        alert(
                            data.message
                        );

                        return;

                    }


                    // ==========================================
                    // UPDATE PAGE
                    // ==========================================

                    fullNameDisplay.textContent =
                        name;


                    emailDisplay.textContent =
                        email;


                    // ==========================================
                    // UPDATE PROFILE HEADER
                    // ==========================================

                    const profileName =
                        document.querySelector(
                            ".profile-main-info h2"
                        );


                    if (profileName) {

                        profileName.textContent =
                            name;

                    }


                    // ==========================================
                    // UPDATE AVATAR
                    // ==========================================

                    if (
                        profileAvatar &&
                        name
                    ) {

                        profileAvatar.textContent =
                            name
                                .charAt(0)
                                .toUpperCase();

                    }


                    // ==========================================
                    // UPDATE EDIT FIELDS
                    // ==========================================

                    editName.value =
                        name;


                    editEmail.value =
                        email;


                    // ==========================================
                    // CLOSE MODAL
                    // ==========================================

                    if (editProfileModal) {

                        editProfileModal.hide();

                    }


                    // ==========================================
                    // SUCCESS MESSAGE
                    // ==========================================

                    alert(
                        "Profile updated successfully."
                    );

                })


                .catch(error => {

                    console.error(
                        "Update profile error:",
                        error
                    );


                    alert(
                        "Something went wrong. Please try again."
                    );

                });

            }
        );

    }


    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    if (changePasswordBtn) {

        changePasswordBtn.addEventListener(
            "click",
            function () {

                alert(
                    "Password change will be available soon."
                );

            }
        );

    }

});
