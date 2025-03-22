document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    // Check if there's a stored theme preference
    if (localStorage.getItem("theme") === "light") {
        body.classList.remove("dark-theme");
        body.classList.add("light-theme");
        themeToggle.checked = true;
    }

    // Toggle theme on checkbox change
    themeToggle.addEventListener("change", function () {
        if (this.checked) {
            body.classList.remove("dark-theme");
            body.classList.add("light-theme");
            localStorage.setItem("theme", "light");
        } else {
            body.classList.remove("light-theme");
            body.classList.add("dark-theme");
            localStorage.setItem("theme", "dark");
        }
    });

    // Profile picture animation on hover
    const profilePic = document.querySelector(".profile-pic");
    profilePic.addEventListener("mouseover", () => {
        profilePic.style.transform = "rotate(360deg)";
        profilePic.style.transition = "transform 1s ease-in-out";
    });

    profilePic.addEventListener("mouseleave", () => {
        profilePic.style.transform = "rotate(0deg)";
    });
});