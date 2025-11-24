
function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

const primes = [];
for (let i = 2; i <= 100; i++) {
    if (isPrime(i)) primes.push(i);
}

const display = document.getElementById("display");
const startBtn = document.getElementById("start-btn");

startBtn.addEventListener("click", () => {
    startBtn.disabled = true;

    let index = 0;

    const timer = setInterval(() => {
        if (index >= primes.length) {
            clearInterval(timer);
            startBtn.disabled = false;
            return;
        }

        display.classList.remove("fade-in");
        display.classList.add("fade-out");

        setTimeout(() => {
            display.textContent = primes[index];

            display.classList.remove("fade-out");
            display.classList.add("fade-in");

            index++;
        }, 200);
    }, 1000);
});




