// StudyHub — Contact page interactions
// 1) FAQ accordion   2) Contact form submit feedback

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- FAQ accordion ---------- */
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        question.addEventListener("click", () => {
            const isOpen = item.classList.contains("open");

            // close every other item (true accordion behaviour)
            faqItems.forEach((other) => {
                other.classList.remove("open");
                other.querySelector(".faq-answer").style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add("open");
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // open the first FAQ by default
    if (faqItems.length) {
        faqItems[0].querySelector(".faq-question").click();
    }

    /* ---------- Contact form ---------- */
    const form = document.querySelector(".contact-form form");
    const status = document.querySelector(".form-status");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = form.querySelector('input[type="text"]').value.trim();
            const email = form.querySelector('input[type="email"]').value.trim();

            if (!name || !email) return;

            status.textContent = `Thanks, ${name.split(" ")[0]} — we've received your message and will reply within 24 hours.`;
            status.classList.add("show", "success");

            form.reset();

            setTimeout(() => status.classList.remove("show"), 6000);
        });
    }
});