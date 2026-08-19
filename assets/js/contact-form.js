(function () {
    "use strict";

    var ENDPOINT = "https://formsubmit.co/ajax/info@alephcode.com";
    var form = document.getElementById("contact-form");
    if (!form) {
        return;
    }

    var submitBtn = document.getElementById("contact-submit");
    var statusBox = document.getElementById("message-form");
    var message = document.getElementById("con_message");
    var count = document.getElementById("message-count");
    var captchaHolder = document.getElementById("contact-recaptcha");
    var recaptchaWidgetId = null;
    var recaptchaReady = false;

    if (message && count) {
        message.addEventListener("input", function () {
            count.textContent = message.value.length + "/1000";
        });
    }

    window.onContactRecaptchaLoad = renderRecaptcha;
    if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
        renderRecaptcha();
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (form.querySelector("[name='_honey']") && form.querySelector("[name='_honey']").value) {
            return;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            setStatus("Please complete the required fields before sending.", "error");
            return;
        }

        if (!captchaToken()) {
            setStatus("Please complete the “I’m not a robot” check before sending.", "error");
            return;
        }

        var payload = {
            name: (value("first_name") + " " + value("last_name")).trim(),
            first_name: value("first_name"),
            last_name: value("last_name"),
            email: value("email_address"),
            phone: value("phone_no"),
            subject: value("contact_subject"),
            message: value("con_message"),
            _subject: "AlephCode contact: " + (value("contact_subject") || "New enquiry"),
            _template: "table",
            _captcha: "false",
            _replyto: value("email_address")
        };

        setBusy(true);
        setStatus("Sending your message…", "info");

        fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify(payload)
        }).then(function (response) {
            return response.json().catch(function () {
                return { success: response.ok };
            }).then(function (data) {
                return { ok: response.ok, data: data || {} };
            });
        }).then(function (result) {
            var data = result.data || {};
            var remoteMessage = String(data.message || data.error || "");

            if (isActivation(remoteMessage)) {
                setStatus("Your message reached the mail service, but this inbox needs a one-time activation. Open info@alephcode.com (and spam), click the FormSubmit “Activate Form” link, then send this message again.", "warning");
                return;
            }

            if (result.ok && data.success !== "false" && data.success !== false) {
                setStatus("Thank you. Your message has been sent. We typically reply within 24 hours on business days.", "success");
                form.reset();
                if (count) {
                    count.textContent = "0/1000";
                }
                resetCaptcha();
                return;
            }

            throw new Error(remoteMessage || "Send failed");
        }).catch(function (error) {
            var detail = error && error.message ? String(error.message) : "";
            if (isActivation(detail)) {
                setStatus("Your message reached the mail service, but this inbox needs a one-time activation. Open info@alephcode.com (and spam), click the FormSubmit “Activate Form” link, then send this message again.", "warning");
                return;
            }
            setStatus("We could not send the message just now. Email us at info@alephcode.com or call +94 766 606 816.", "error");
            resetCaptcha();
        }).then(function () {
            setBusy(false);
        });
    });

    function siteKey() {
        return captchaHolder ? String(captchaHolder.getAttribute("data-sitekey") || "").trim() : "";
    }

    function renderRecaptcha() {
        if (recaptchaReady || !captchaHolder || !window.grecaptcha || typeof window.grecaptcha.render !== "function") {
            return;
        }
        var key = siteKey();
        if (!key) {
            return;
        }
        recaptchaWidgetId = window.grecaptcha.render(captchaHolder, {
            sitekey: key,
            theme: "light"
        });
        recaptchaReady = true;
    }

    function captchaToken() {
        if (!window.grecaptcha || typeof window.grecaptcha.getResponse !== "function") {
            return "";
        }
        if (recaptchaWidgetId === null) {
            return window.grecaptcha.getResponse();
        }
        return window.grecaptcha.getResponse(recaptchaWidgetId);
    }

    function resetCaptcha() {
        if (!window.grecaptcha || typeof window.grecaptcha.reset !== "function") {
            return;
        }
        if (recaptchaWidgetId === null) {
            window.grecaptcha.reset();
            return;
        }
        window.grecaptcha.reset(recaptchaWidgetId);
    }

    function isActivation(text) {
        var msg = String(text || "").toLowerCase();
        return msg.indexOf("activation") !== -1
            || msg.indexOf("activate form") !== -1
            || msg.indexOf("actived") !== -1
            || msg.indexOf("own this email") !== -1
            || (msg.indexOf("confirm") !== -1 && msg.indexOf("inbox") !== -1);
    }

    function value(id) {
        var field = document.getElementById(id);
        return field ? String(field.value || "").trim() : "";
    }

    function setBusy(busy) {
        if (!submitBtn) {
            return;
        }
        submitBtn.disabled = busy;
        submitBtn.setAttribute("aria-busy", busy ? "true" : "false");
        submitBtn.innerHTML = busy
            ? "Sending… <i class=\"mdi mdi-loading mdi-spin\" aria-hidden=\"true\"></i>"
            : "Send Message <i class=\"mdi mdi-send\" aria-hidden=\"true\"></i>";
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
