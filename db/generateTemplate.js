function emailTemplate(screenings) {
    const htmlTemplate = seedTemplateScreenings(screenings);

    return htmlTemplate;
};

function textTemplate(screenings) {
    let text = [];

    screenings.forEach(screening => {
        text.push(`
            ${screening.name.toUpperCase()}, 
            ${screening.title}, 
            ${screening.link}, 
            ${contentShowtimes(screening)} ---`.replace(/\s\s+/g, ' '))
    });
    text.push(`Unsubscribe or snooze alerts here: http://torontoscreenings.herokuapp.com/users/verify-edit`);

    return text.toString();
};

function twitterTemplate(screenings) {
    let content = [];

    screenings.forEach((screening, i) => {
        if (i > 0) {
            content.push(`
                ${screening.title}, 
                ${contentShowtimes(screening)},
                ${screening.link}`.replace(/\s\s+/g, ' ')
            )
        }
        if(i == 0) {
            content.push(`${screening.name.toUpperCase()}`)
        }
    })

    return content.toString();
};

function seedTemplateScreenings(screenings) {
    let html = [];

    screenings.forEach(screening => {
        html.push(`
            <h1>${screening.name}</h1>
            <h3>${screening.title}</h3>
            <a href="${screening.link}">Buy tickets here</a>
            ${seedShowtimes(screening)}`.replace(/\s\s+/g, ''));
    });
    html.push(`<p>Unsubscribe or snooze <a href='http://torontoscreenings.herokuapp.com/users/verify-edit'>here</a></p>`);

    return html.toString().replace(/,/g, "");
};

function seedShowtimes(screening) {
    let showtimes = [];
    
    screening.showtime.forEach(time => {
        showtimes.push(`<li><p>${time}</p></li>`);
    })
    return showtimes.toString().replace(/,/g, "");
};  

function contentShowtimes(screening) {
    let showtimes = [];

    screening.showtime.forEach(time => {
        showtimes.push(`${time}`);
    })
    return showtimes.toString();
}

module.exports = { 
    emailTemplate, 
    textTemplate,
    twitterTemplate
}