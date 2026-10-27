"use strict";

(function () {
    function getClient() {
        const config = window.SKILL2EARN_SUPABASE_CONFIG;
        if (!config || typeof config.getClient !== "function") {
            throw new Error("Supabase client is unavailable.");
        }
        return config.getClient();
    }

    function field(form, name) {
        return form.querySelector('[name="' + name + '"]');
    }

    function value(form, name) {
        const input = field(form, name);
        return input ? String(input.value || "").trim() : "";
    }

    function showMessage(form, text, isError) {
        let output = form.querySelector("[data-auth-message]");
        if (!output) {
            output = document.createElement("div");
            output.dataset.authMessage = "";
            output.setAttribute("role", "status");
            output.setAttribute("aria-live", "polite");
            output.style.cssText = "margin-top:16px;padding:12px;border-radius:8px;white-space:pre-wrap;";
            form.appendChild(output);
        }
        output.textContent = text;
        output.style.background = isError ? "#49232b" : "#123526";
        output.style.color = isError ? "#fecaca" : "#bbf7d0";
    }

    function redirect(role) {
        if (role === "student") {
            window.location.href = "dashboard.html";
        } else if (role === "employer") {
            window.location.href = "dashboard.html";
        } else if (role === "admin") {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "../index.html";
        }
    }

    function friendlyError(error) {
        const text = String(error?.message || error || "Unknown error");
        if (text.toLowerCase().includes("rate limit")) {
            return "Too many attempts were made. Please wait a few minutes, then try again.";
        }
        if (text.toLowerCase().includes("user already registered")) {
            return "This email already has an account. Please log in.";
        }
        if (text.toLowerCase().includes("invalid login credentials")) {
            return "The email or password is incorrect.";
        }
        if (text.toLowerCase().includes("email not confirmed")) {
            return "Please confirm your email before logging in.";
        }
        return text;
    }

    async function register(form) {
        const client = getClient();
        const role = form.dataset.role;
        const fullName = value(form, "full_name") || value(form, "fullName");
        const email = value(form, "email").toLowerCase();
        const password = value(form, "password");
        const school = value(form, "school");
        const course = value(form, "course");
        const companyName = value(form, "company_name") || (role === "employer" ? value(form, "fullName") : "");

        if (!["student", "employer"].includes(role)) {
            throw new Error("Invalid registration role.");
        }
        if (!fullName || !email || !password) {
            throw new Error("Please fill in all required fields.");
        }
        if (password.length < 8) {
            throw new Error("Password must contain at least 8 characters.");
        }
        const confirmPassword = value(form, "confirmPassword");
        if (confirmPassword && password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }
        if (role === "student" &&
            !email.endsWith("@tip.edu.ph") &&
            !email.endsWith("@edu.ph")) {
            throw new Error("Use your school email. It must end in @tip.edu.ph or @edu.ph.");
        }
        if (role === "employer" && !companyName) {
            throw new Error("Enter your company or full name.");
        }

        const {data,error} = await client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role,
                    school,
                    course,
                    company_name: companyName
                }
            }
        });
        if (error) throw error;
        if (!data.user) throw new Error("Registration did not return a user.");

        if (data.session) {
            showMessage(form, "Registration successful. Redirecting...", false);
            setTimeout(() => redirect(role), 1000);
        } else {
            showMessage(
                form,
                "Almost done! We sent a confirmation link to your email. Open it to activate your account, then log in. Check your spam folder if you don't see it.",
                false
            );
        }
    }

    async function login(form) {
        const client = getClient();
        const email = value(form, "email").toLowerCase();
        const password = value(form, "password");
        const expectedRole = form.dataset.role;

        if (!email || !password) {
            throw new Error("Enter your email and password.");
        }

        const {data,error} = await client.auth.signInWithPassword({email,password});
        if (error) throw error;
        if (!data.user) throw new Error("No authenticated user was returned.");

        const {data:profile,error:profileError} = await client
            .from("profiles").select("role").eq("id",data.user.id).maybeSingle();

        if (profileError) {
            await client.auth.signOut();
            throw new Error("We couldn't load your profile: " + profileError.message);
        }
        if (!profile || !profile.role) {
            await client.auth.signOut();
            throw new Error("We couldn't find your profile. Please contact support.");
        }

        const role = String(profile.role).toLowerCase();
        if (role !== expectedRole) {
            await client.auth.signOut();
            throw new Error("This account is a different type. Use the login page for your account type (student, employer or admin).");
        }

        showMessage(form,"Login successful. Redirecting...",false);
        setTimeout(() => redirect(role),700);
    }

    document.addEventListener("submit",async event=>{
        const form=event.target.closest("form[data-auth]");
        if(!form)return;
        event.preventDefault();
        const button=form.querySelector('[type="submit"]');
        if(button){button.disabled=true;button.dataset.original=button.textContent;button.textContent="Please wait...";}
        try{
            if(form.dataset.auth==="register")await register(form);
            else if(form.dataset.auth==="login")await login(form);
            else throw new Error("Unsupported authentication action.");
        }catch(error){showMessage(form,friendlyError(error),true);}
        finally{if(button){button.disabled=false;if(button.dataset.original)button.textContent=button.dataset.original;}}
    });

    document.addEventListener("click",async event=>{
        const button=event.target.closest('[data-auth="logout"]');
        if(!button)return;
        event.preventDefault();
        button.disabled=true;
        try{
            const {error}=await getClient().auth.signOut();
            if(error)throw error;
            window.location.href=button.dataset.redirect||"../index.html";
        }catch(error){window.alert(friendlyError(error));button.disabled=false;}
    });
})();