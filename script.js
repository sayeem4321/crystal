// Server Status Logic
const serverIp = "play.crystalcraftbd.fun";

async function copyIp(btnElement) {
    const textToCopy = serverIp;

    try {
        await navigator.clipboard.writeText(textToCopy);
        showCopyFeedback();
    } catch (err) {
        console.warn('Clipboard API failed, trying fallback...', err);
        fallbackCopyTextToClipboard(textToCopy);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Ensure textarea is not visible but part of DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyFeedback();
        } else {
            console.error('Fallback: Copy command failed');
            alert("Failed to copy IP. Please manually copy: " + text);
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        alert("Failed to copy IP. Please manually copy: " + text);
    }

    document.body.removeChild(textArea);
}

function showCopyFeedback() {
    const buttons = document.querySelectorAll('.copy-btn, .code-block button');

    buttons.forEach(btn => {
        // Store original content if not already stored
        if (!btn.dataset.originalHtml) {
            btn.dataset.originalHtml = btn.innerHTML;
        }

        if (btn.classList.contains('copy-btn')) {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> IP Copied!';
            btn.style.background = '#22c55e';
            btn.style.color = '#000';
        } else {
            btn.innerHTML = '<i class="fa-solid fa-check"></i>';
            btn.style.color = '#22c55e';
        }

        setTimeout(() => {
            btn.innerHTML = btn.dataset.originalHtml;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    });
}

async function fetchServerStatus() {
    const playerElement = document.getElementById("player-count");
    const statusElement = document.getElementById("server-status");
    const navPlayerCount = document.getElementById("nav-player-count");
    const pingElement = document.getElementById("server-ping");

    // Guard clause if elements don't exist
    // We check individually inside to allow partial existence

    const startTime = Date.now();

    try {
        const response = await fetch(`https://api.mcsrvstat.us/2/${serverIp}`);
        const data = await response.json();
        const latency = Date.now() - startTime;

        if (data.online) {
            if (playerElement) playerElement.innerText = `${data.players.online} / ${data.players.max}`;
            if (statusElement) {
                statusElement.innerText = "Online";
                statusElement.style.color = "#00ff88";
            }
            if (navPlayerCount) navPlayerCount.innerText = data.players.online;

            // Use debug.ping if available (unlikely for V2), else fallback to fetch latency
            // mcsrvstat typically doesn't return ping MS in V2.
            if (pingElement) pingElement.innerText = `${latency}ms`;

        } else {
            if (playerElement) playerElement.innerText = "-";
            if (statusElement) {
                statusElement.innerText = "Offline";
                statusElement.style.color = "#ff4d4d";
            }
            if (navPlayerCount) navPlayerCount.innerText = "0";
            if (pingElement) pingElement.innerText = "-- ms";
        }
    } catch (error) {
        console.error("Error fetching server status:", error);
        if (playerElement) playerElement.innerText = "Unknown";
        if (statusElement) statusElement.innerText = "Unknown";
        if (pingElement) pingElement.innerText = "-- ms";
    }
}

// --- Live Player List Logic ---

async function fetchOnlinePlayers() {
    const listElement = document.getElementById('players-list');
    const loadingElement = document.getElementById('players-loading');
    const emptyElement = document.getElementById('players-empty');

    // Only proceed if elements exist
    if (!listElement || !loadingElement || !emptyElement) return;

    try {
        const response = await fetch(`https://api.mcsrvstat.us/2/${serverIp}`);
        const data = await response.json();

        loadingElement.style.display = 'none';

        if (data.online && data.players && data.players.list && data.players.list.length > 0) {
            emptyElement.style.display = 'none';
            listElement.style.display = 'flex';
            renderPlayerList(data.players.list, listElement);
        } else {
            listElement.style.display = 'none';
            emptyElement.style.display = 'block';

            if (!data.online) {
                emptyElement.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Server is currently offline.';
            } else {
                emptyElement.innerHTML = '<i class="fa-solid fa-ghost"></i> No players online right now.';
            }
        }
    } catch (error) {
        console.error("Error fetching online players:", error);
        loadingElement.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Failed to load player list.';
    }
}

function renderPlayerList(playerNames, container) {
    container.innerHTML = '';

    playerNames.forEach((username, index) => {
        const row = document.createElement('div');
        row.className = 'player-list-item';

        // Avatar URL (mc-heads) - using smaller size
        const avatarUrl = `https://mc-heads.net/avatar/${username}/32`;

        row.innerHTML = `
            <span class="player-number">#${index + 1}</span>
            <img src="${avatarUrl}" alt="${username}" class="player-avatar-xs">
            <span class="player-name-list">${username}</span>
        `;

        container.appendChild(row);
    });
}


// Event Listeners for Static Elements
document.addEventListener("DOMContentLoaded", () => {

    // Mobile Elements (Global Scope within DOMContentLoaded)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // --- Mobile Interaction Initialization ---
    // Combined and simplified for robustness
    function initMobileInteractions() {
        // Toggle Mobile Menu
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.onclick = (e) => {
                e.stopPropagation();
                navLinks.classList.toggle('active');

                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    // Simple toggle between bars and xmark
                    if (navLinks.classList.contains('active')) {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-xmark');
                    } else {
                        icon.classList.remove('fa-xmark');
                        icon.classList.add('fa-bars');
                    }
                }
            };
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks && navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !mobileMenuBtn.contains(e.target)) {

                navLinks.classList.remove('active');
                if (mobileMenuBtn) {
                    const icon = mobileMenuBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-xmark');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });
    }

    // Initialize immediate
    initMobileInteractions();

    // Reveal Navbar (Prevent Flicker)
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        setTimeout(() => {
            navbar.classList.add('visible');
        }, 10);
    }


    fetchServerStatus(); // Ensure server status is fetched
    setInterval(fetchServerStatus, 10000); // Refresh server status (and ping) every 10 seconds

    // Initial fetch and auto-refresh every 1 second
    fetchOnlinePlayers();
    setInterval(fetchOnlinePlayers, 1000);

    // --- Rank Modal Logic ---
    const rankButtons = document.querySelectorAll('.rank-details-btn');
    const closeButtons = document.querySelectorAll('.close-modal');

    rankButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const rank = btn.dataset.rank;
            const modal = document.getElementById(`modal-${rank}`);
            if (modal) {
                modal.style.display = 'block';
            }
        });
    });

    // Kit Preview Buttons
    const kitButtons = document.querySelectorAll('.kit-preview-btn');
    kitButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const kitRank = btn.dataset.kit;
            const modal = document.getElementById(`modal-kit-${kitRank}`);
            if (modal) {
                modal.style.display = 'block';
            }
        });
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.rank-modal').style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('rank-modal')) {
            event.target.style.display = 'none';
        }
    });
});
