export function getRemainingTime(endDate) {
    const total = Date.parse(endDate) - Date.parse(new Date());
    
    if (total <= 0) {
        return { total, text: "Terminé", isFinished: true };
    }

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    let text = "";
    if (days > 0) text += `${days}j `;
    text += `${hours}h ${minutes}m ${seconds}s`;

    return { total, text, isFinished: false };
}