document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // GET USER ID
    // =====================================================

    const userID =
        localStorage.getItem("smde_user_id");


    // =====================================================
    // ELEMENTS
    // =====================================================

    const list =
        document.getElementById("notificationsList");

    const emptyState =
        document.getElementById("emptyNotifications");

    const tabs =
        document.querySelectorAll(".notif-tab");

    const markAllReadBtn =
        document.getElementById("markAllReadBtn");


    // =====================================================
    // ICONS
    // =====================================================

    const icons = {

        high:
            "bi-exclamation-octagon",

        medium:
            "bi-exclamation-triangle"

    };


    // =====================================================
    // NOTIFICATIONS DATA
    // =====================================================

    let notifications = [];

    let currentFilter = "all";


    // =====================================================
    // LOAD NOTIFICATIONS
    // =====================================================

    async function loadNotifications() {

        if (!userID) {

            list.innerHTML = "";

            emptyState.classList.remove("d-none");

            return;
        }


        try {

            const response =
                await fetch(
                    `http://localhost/SMDE_fixed/SMDE/backend/api/notifications.php?user_id=${userID}`,
                    { credentials: "include" }
                );


            const data =
                await response.json();


            if (data.error) {

                console.error(
                    data.error
                );

                notifications = [];

            }
            else {

                notifications = data;

            }


            render();

        }
        catch (error) {

            console.error(
                "Failed to load notifications:",
                error
            );

            notifications = [];

            render();

        }

    }


    // =====================================================
    // RENDER
    // =====================================================

    function render() {

        let filtered =
            notifications;


        // -------------------------------------------------
        // FILTER
        // -------------------------------------------------

        if (currentFilter === "unread") {

            filtered =
                notifications.filter(
                    n => !n.read
                );

        }
        else if (currentFilter === "high") {

            filtered =
                notifications.filter(
                    n =>
                        n.severity === "high"
                );

        }


        // -------------------------------------------------
        // CLEAR LIST
        // -------------------------------------------------

        list.innerHTML = "";


        // -------------------------------------------------
        // EMPTY STATE
        // -------------------------------------------------

        if (filtered.length === 0) {

            emptyState.classList.remove(
                "d-none"
            );

            return;

        }


        emptyState.classList.add(
            "d-none"
        );


        // -------------------------------------------------
        // CREATE NOTIFICATIONS
        // -------------------------------------------------

        filtered.forEach(function (n) {

            const item =
                document.createElement("div");


            item.className =
                "notif-item" +
                (
                    n.read
                        ? ""
                        : " unread"
                );


            item.innerHTML = `

                <div class="notif-icon ${n.severity}">
                    <i class="bi ${icons[n.severity]}"></i>
                </div>

                <div class="notif-body">

                    <strong>
                        ${n.title}
                    </strong>

                    <p>
                        ${n.message}
                    </p>

                    <span class="notif-time">
                        ${n.time}
                    </span>

                </div>

                ${
                    n.read
                        ? ""
                        : '<span class="notif-dot"></span>'
                }

            `;


            // -------------------------------------------------
            // MARK ONE AS READ
            // -------------------------------------------------

            item.addEventListener(
                "click",
                async function () {

                    if (n.read) {
                        return;
                    }


                    try {

                        const response =
                            await fetch(
                                "http://localhost/SMDE_fixed/SMDE/backend/api/notifications.php",
                                {
                                    method: "POST",

                                    credentials: "include",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({

                                            action:
                                                "read",

                                            user_id:
                                                Number(
                                                    userID
                                                ),

                                            notification_id:
                                                n.id

                                        })
                                }
                            );


                        const data =
                            await response.json();


                        if (data.success) {

                            n.read = true;

                            render();

                        }

                    }
                    catch (error) {

                        console.error(
                            "Failed to mark notification as read:",
                            error
                        );

                    }

                }
            );


            list.appendChild(item);

        });

    }


    // =====================================================
    // TABS
    // =====================================================

    tabs.forEach(function (tab) {

        tab.addEventListener(
            "click",
            function () {

                tabs.forEach(
                    t =>
                        t.classList.remove(
                            "active"
                        )
                );


                tab.classList.add(
                    "active"
                );


                currentFilter =
                    tab.dataset.filter;


                render();

            }
        );

    });


    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    markAllReadBtn.addEventListener(
        "click",
        async function () {

            if (!userID) {
                return;
            }


            try {

                const response =
                    await fetch(
                        "http://localhost/SMDE_fixed/SMDE/backend/api/notifications.php",
                        {
                            method: "POST",

                            credentials: "include",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    action:
                                        "mark_all_read",

                                    user_id:
                                        Number(
                                            userID
                                        )

                                })
                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    notifications =
                        notifications.map(
                            n => ({
                                ...n,
                                read: true
                            })
                        );


                    render();

                }

            }
            catch (error) {

                console.error(
                    "Failed to mark all notifications as read:",
                    error
                );

            }

        }
    );


    // =====================================================
    // START
    // =====================================================

    loadNotifications();

});
