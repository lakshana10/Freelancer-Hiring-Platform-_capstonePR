/* =====================================================
   FreelanceHub auth helper.
   Include this script BEFORE any other script on every page:
       <script src="../js/auth.js"></script>

   It does three things:
   1. Attaches "Authorization: Bearer <token>" (stored at login
      in localStorage under "authToken") to backend API calls.
   2. Normalizes the API host: pages opened locally talk to the
      local backend (localhost:8080); deployed pages talk to the
      Render backend. No per-file URL edits needed.
   3. On a 401 for a logged-in session, clears the session and
      sends the user back to login.html.
   ===================================================== */
(function () {
    var TOKEN_KEY = "authToken";
    var RENDER_HOST = "freelancer-backend-9cw6.onrender.com";
    var LOCAL_API = "localhost:8080";

    function isLocalPage() {
        var host = window.location.hostname || "";
        return host === "localhost"
            || host === "127.0.0.1"
            || host === "";
    }

    function isApiUrl(url) {
        return url.indexOf(RENDER_HOST) !== -1
            || url.indexOf("localhost:8080") !== -1
            || url.indexOf("127.0.0.1:8080") !== -1;
    }

    function normalizeUrl(url) {
        if (typeof url !== "string" || !isApiUrl(url)) {
            return url;
        }

        if (isLocalPage()) {
            return url
                .replace("https://" + RENDER_HOST,
                    "http://" + LOCAL_API)
                .replace("http://" + RENDER_HOST,
                    "http://" + LOCAL_API)
                .replace("http://127.0.0.1:8080",
                    "http://" + LOCAL_API);
        }

        return url
            .replace("http://localhost:8080",
                "https://" + RENDER_HOST)
            .replace("http://127.0.0.1:8080",
                "https://" + RENDER_HOST);
    }

    function isAuthEndpoint(url) {
        return /\/api\/(users\/(login|signup)|otp\/)/.test(url);
    }

    function getToken() {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch (e) {
            return null;
        }
    }

    window.Auth = {
        getToken: getToken,
        setToken: function (token) {
            try {
                if (token) {
                    localStorage.setItem(TOKEN_KEY, token);
                }
            } catch (e) {
                /* storage unavailable */
            }
        },
        clear: function () {
            try {
                localStorage.removeItem(TOKEN_KEY);
            } catch (e) {
                /* storage unavailable */
            }
        }
    };

    function withAuthHeaders(headers) {
        var result = new Headers(headers || {});
        var token = getToken();

        if (token && !result.has("Authorization")) {
            result.set("Authorization", "Bearer " + token);
        }

        return result;
    }

    function handleUnauthorized(response, url) {
        if (response.status !== 401
                || !getToken()
                || isAuthEndpoint(url)) {
            return;
        }

        var page = "";
        try {
            var parts = window.location.pathname.split("/");
            page = parts[parts.length - 1] || "";
        } catch (e) {
            page = "";
        }

        var loggedIn = null;
        try {
            loggedIn = localStorage.getItem("loggedInUser");
        } catch (e) {
            loggedIn = null;
        }

        if (loggedIn
                && page !== "login.html"
                && page !== "signup.html") {
            try {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem("loggedInUser");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userRole");
            } catch (e) {
                /* storage unavailable */
            }

            window.location.href = "login.html";
        }
    }

    var originalFetch = window.fetch.bind(window);

    window.fetch = function (input, init) {
        var url = (typeof input === "string")
            ? input
            : (input && input.url) || "";
        var target = normalizeUrl(url);

        init = init || {};

        var needsAuth = isApiUrl(target)
            && !isAuthEndpoint(target)
            && !!getToken();

        var promise;

        if (typeof input === "string") {
            if (needsAuth) {
                init.headers = withAuthHeaders(init.headers);
            }

            promise = originalFetch(target, init);
        } else if (target !== url || needsAuth) {
            input = new Request(target, {
                method: input.method,
                headers: withAuthHeaders(input.headers),
                body: input.body,
                mode: input.mode,
                credentials: input.credentials,
                cache: input.cache,
                redirect: input.redirect,
                referrer: input.referrer,
                integrity: input.integrity
            });

            promise = originalFetch(input);
        } else {
            promise = originalFetch(input, init);
        }

        return promise.then(function (response) {
            handleUnauthorized(response, target);
            return response;
        });
    };
})();
