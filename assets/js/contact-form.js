(function () {
    "use strict";

    var form = document.getElementById("contact-form");
    if (!form) {
        return;
    }

    var submitBtn = document.getElementById("contact-submit");
    var statusBox = document.getElementById("message-form");
    var message = document.getElementById("con_message");
    var count = document.getElementById("message-count");
    var nextField = document.getElementById("contact-next");
    var subjectField = document.getElementById("contact-mail-subject");
    var replyField = document.getElementById("contact-replyto");
    var nameField = document.getElementById("contact-full-name");

    if (message && count) {
        message.addEventListener("input", function () {
            count.textContent = message.value.length + "/1000";
        });
    }

    if (/[?&]sent=1(?:&|$)/.test(window.location.search)) {
        setStatus("Thank you. Your message has been sent. We typically reply within 24 hours on business days.", "success");
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        if (statusBox && statusBox.scrollIntoView) {
            statusBox.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }

    form.addEventListener("submit", function (event) {
        var honey = form.querySelector("[name='_honey']");
        if (honey && honey.value) {
            event.preventDefault();
            return;
        }

        if (!form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
            setStatus("Please complete the required fields before sending.", "error");
            return;
        }

        var fullName = (value("first_name") + " " + value("last_name")).trim();
        var email = value("email_address");
        var subject = value("contact_subject") || "New enquiry";

        if (nameField) {
            nameField.value = fullName;
        }
        if (replyField) {
            replyField.value = email;
        }
        if (subjectField) {
            subjectField.value = "AlephCode contact: " + subject;
        }
        if (nextField) {
            nextField.value = window.location.origin + window.location.pathname + "?sent=1";
        }

        if (submitBtn) {
            submitBtn.setAttribute("aria-busy", "true");
            submitBtn.innerHTML = "Sending… <i class=\"mdi mdi-loading mdi-spin\" aria-hidden=\"true\"></i>";
        }
        setStatus("Opening the security check…", "info");
    });

    function value(id) {
        var field = document.getElementById(id);
        return field ? String(field.value || "").trim() : "";
    }

    function setStatus(text, type) {
        if (!statusBox) {
            return;
        }
        statusBox.className = "contact-status is-" + type;
        statusBox.setAttribute("role", type === "error" || type === "warning" ? "alert" : "status");
        statusBox.textContent = text;
    }
}());
