module.exports = {
    emailTemplate(screenings) {
        const htmlTemplate = compileTemplate(screenings);

        return htmlTemplate.toString.replace(/\s\s+/g, '');
    }
}
function seedTemplateScreenings(screenings) {
    let html = [];
    screenings.forEach(screening => {
        html.push(`
            <h1>${screening.name}</h1>
            <h3>${screening.title}</h3>
            <a href="${screening.link}">Buy tickets here</a>
            ${seedShowtimes(screening)}`.replace(/\s\s+/g, ''));
    })
    return html.toString().replace(',', '');
};
function seedShowtimes(screening) {
    let showtimes = [];
    screening.showtime.forEach(time => {
        showtimes.push(`<li><p>${time}</p></li>`);
    })
    return showtimes.toString().replace(',', '');
};    
function compileTemplate() {
    `<html>
        <body>
            ${seedTemplateScreenings(screenings)}
            <p>Unsubscribe or snooze <a href='http://${req.headers.host}/users/pause'>here</a></p>
        </body>
    </html>`
}