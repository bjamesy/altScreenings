const cheerio   = require('cheerio')
    , request   = require('request')
    // puppeteer scraping - because browser loading the asyncronous javascript that  
    // loads our calendar data after the html template and therefore doesnt picked up by cheerio 
    , puppeteer = require('puppeteer');
const { 
    seedScreening,
    seedTheatre
} = require('../db/seedQueries');
const { seedErrorHandler } = require('../middleware');

async function getRoyal(i) {
    let url = 'http://theroyal.to/'

    request(url, (err, res, html) => {
        if(!err && res.statusCode == 200) {
            const $ = cheerio.load(html);
            
            let screenings = [];
            let showtime = [];

            $('.time_title_wrapper').each((i, el) => { 
                let time = $(el)
                    .find('.showtime')
                    .text()
                    .replace(/\s\s+/g, '');
                showtime.push(time);
                
                let title = $(el)
                    .find('.now_playing_title')
                    .children('a')
                    .text()
                    .replace(/\s\s+/g, '');

                let link = $(el)
                    .find('.now_playing_title')
                    .children('a')
                    .attr('href')
                    .replace(/\s\s+/g, '');
                    
                screenings.push({
                    showtime,
                    title,
                    link
                })
            });    

            if(screenings.length && screenings.length > 0) {
                seedScreening(screenings, "the Royal Theatre", url);
            } else {
                seedTheatre("the Royal Theatre", url);
            }        
        } else {
            seedErrorHandler(err, "the Royal Theatre", getRoyal, i);
            return console.log("getRoyal completed scraping");
        }
    });
};
async function getParadise(i) {
    let url = 'http://paradiseonbloor.com/calendar';

    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        let screenings = await page.evaluate(() => {
            let screening = [];
            let showtime = [];

            let today = document.querySelector('.current-day');
            let shows = today.querySelectorAll('.film');

            Array.from(shows).forEach(el => {
                let linkDirectory = el.querySelector('.event-link').getAttribute("href");
                let linkUrl = "https://paradiseonbloor.com";
                let link = linkUrl + linkDirectory;

                let time = el.querySelector('.event-info');
                showtime.push(time.querySelector('.list').innerText);

                let title = el.querySelector('h3[class="event-title"] > a').innerText;

                screening.push({
                    title, 
                    link,
                    showtime
                })
                showtime = [];
            })

            return screening;
        });
        if(screenings.length && screenings.length > 0 ) {
            seedScreening(screenings, "Paradise Theatre", url);
        } else {
            seedTheatre("Paradise Theatre", url);
        } 

        await browser.close();       
    } catch(err) {
        seedErrorHandler(err, "Paradise", getParadise, i);
        return console.log("getParadise completed scraping");
    }
};
async function getRevue(i) {
    let url = 'https://revuecinema.ca/';

    request(url, (err, res, html) => {
        if(!err && res.statusCode == 200) {
            const $ = cheerio.load(html);

            let screenings = [];

            $('.wpt_listing').each((i, el) => {
                $(el).find('.wp_theatre_event').each((i, elem) => {
                    let showtime = [];
                    
                    let link = $(elem)
                        .find('.wp_theatre_event_title')
                        .children('a')
                        .attr('href')
                        .replace(/\s\s+/g, '');

                    let title = $(elem)
                        .find('.wp_theatre_event_title')
                        .children('a')
                        .text()
                        .replace(/\s\s+/g, '');

                    let time = $(elem)
                        .find('.wp_theatre_event_starttime')
                        .text()
                        .replace(/\s\s+/g, '');
                    showtime.push(time)

                    screenings.push({
                        title, 
                        link,
                        showtime
                    })
                });
            });
            if(screenings.length && screenings.length > 0) { 
                seedScreening(screenings, "Revue Theatre", url);
            } else {
                seedTheatre("Revue Theatre", url);
            }
        } else {
            seedErrorHandler(err, "Revue Theatre", getRevue, i);
            return console.log("getRevue completed scraping");
        }
    })          
};
async function getHotDocs(i) {
    let url = 'http://hotdocscinema.ca/';

    request(url, (err, res, html) => {
        if(!err && res.statusCode == 200) {
            const $ = cheerio.load(html);

            let screenings = [];
            let showtime = [];

            $('tr').each((i, el) => {
                if (i > 4) return false;

                let time = $(el)
                    .children('td')
                    .first()
                    .text()
                    .replace("More", '');
                showtime.push(time);    
                
                let links = $(el)
                    .find('td')
                    .children('a')
                    .attr('href');

                let link;
                if(links) {
                    link = links.replace(/\s\s+/g, '');
                }

                let title = $(el)
                    .children('td')
                    .last()
                    .text()
                    .replace(/\s\s+/g, '');
            
                screenings.push({
                    title, 
                    link,
                    showtime
                })
                showtime = [];
            });
            if(screenings.length && screenings.length > 0) {
                seedScreening(screenings, 'HotDocs Theatre', url);
            } else {
                seedTheatre("HotDocs Theatre", url);
            }
        } else {
            seedErrorHandler(err, "HotDocs Theatre", getHotDocs, i);
            return console.log("getHotDocs completed scraping");
        }
    })          
};
async function getRegent(i) {
    let url1 = 'https://www.google.com/search?sxsrf=ACYBGNQPcNkDwCjnzSLbYFtAn7NAPlb7nA%3A1581342561585&ei=YV9BXpieI5GRggeDjpiYDg&q=the+regent+theatre+toronto&oq=the+regent+theatre+toronto&gs_l=psy-ab.3..35i39j0i7i30j0i5i30l2.10400.11006..11157...0.3..0.95.488.6......0....1..gws-wiz.......0i71j0i8i7i30j0i8i7i10i30j0i7i5i30j35i304i39.bJ5GMS0FSPk&ved=0ahUKEwjY0pqNkMfnAhWRiOAKHQMHBuMQ4dUDCAs&uact=5';
    let url = "http://regenttoronto.com/";

    (async () => {
        try{
            const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
            const page = await browser.newPage();
            await page.goto(url1, { waitUntil: 'networkidle2' });

            let screenings = await page.evaluate(() => {
                let screening = [];

                let today = document.querySelector('div[data-date="Today"]');

                if(today) {
                    let film = today.querySelectorAll('.lr_c_fcb');
                
                    Array.from(film).forEach(el => {
                        let showtime = [];

                        let title = el.querySelector('.vk_bk').innerText;
                        showtime.push(el.querySelector('.lr_c_stnl').innerText);

                        screening.push({
                            title,
                            showtime
                        })
                        showtime = [];
                    });

                    return screening;    
                }
            })
            if(screenings && screenings.length > 0) {
                seedScreening(screenings, "Regent Theatre", url);
            } else {
                seedTheatre("Regent Theatre", url);
            }

            await browser.close();    
        } catch(err) {
            seedErrorHandler(err, "Regent Theatre", getRegent, i);
            return console.log("getRegent completed scraping");
        }
    })();
};
async function getTiff(i) {
    let url = 'https://www.tiff.net/calendar';
    // puppeteer scraping - because browser loading the asyncronous javascript that  
    // loads our calendar data after the html template and therefore not being picked up by cheerio 
    (async () => {
        try {
            const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });

            let screenings = await page.evaluate(() => {
                let screening = [];
                let showtime = [];

                let today = document.querySelector('div[class="0"]');

                if(today) {
                    let film = today.querySelectorAll('li');

                    Array.from(film).forEach(el => {
                        let title = el.querySelector('.style__cardTitle___2lyRW').innerText;
                        let linkDiv = el.querySelector('.style__cardScheduleItems___13OLU > div');
                        let links = linkDiv.querySelector('.style__link___140bA').getAttribute("href");
                        let urLink = 'https://www.tiff.net';
                        let link = urLink + links;
                        // multiple showtimes so have to grab nodelist prior to loooping through 
                        let times = el.querySelectorAll('.style__screeningButton___22uMG');
                        Array.from(times).forEach(el => { 
                            showtime.push(el.innerText);
                        });
    
                        if(title !== "!Toronto" && title !== "Film Reference Library Public Hours") {
                            screening.push({
                                title, 
                                link,
                                showtime
                            })
                        }
                        showtime = [];
                    });               
                }

                return screening;    
            });
            if(screenings.length && screenings.length > 0) {
                seedScreening(screenings, "Tiff Bell Lightbox", url);
            } else {
                seedTheatre("Tiff Bell Lightbox", url);
            }

            await browser.close();        
        } catch(err) {
            seedErrorHandler(err, "Tiff Bell Lightbox", getTiff, i);
            return console.log("getTiff completed scraping");
        }
    })();
};
async function getCinesphere(i) {
    let url = "http://ontarioplace.com/en/cinesphere/";

    request(url, (err, res, html) => {
        if(!err && res.statusCode == 200) {
            const $ = cheerio.load(html);

            let screenings = [];
            let showtime = [];

            let film = $('.cineNowPlaying');
            let films = $(film).find('.tixLinks');

            if(films.length) {
                let title = $(film)
                    .find('.listpostLink')
                    .children('a')
                    .attr('title')
                    .replace(/\s\s+/g, '');

                $(films).find('a').each((i, el) => {
                    let time = $(el)
                        .find('.btn')
                        .text()
                        .replace(/\s\s+/g, '');
                    showtime.push(time);    
                });

                let link = $(film)
                    .find('.listpostLink')
                    .children('a')
                    .attr('href')
                    .replace(/\s\s+/g, '');

                screenings.push({
                    title,
                    showtime,
                    link
                })
                showtime = [];
            }
            
            if(screenings && screenings.length > 0) {
                seedScreening(screenings, "Cinesphere Theatre", url);
            } else {
                seedTheatre("Cinesphere Theatre", url);
            }
        } else {
            seedErrorHandler(err, "Cinisphere Theatre", getCinesphere, i);
            return console.log("getCinesphere completed scraping");
        }
    })
};  

module.exports = { 
    getRegent, 
    getRevue, 
    getRoyal, 
    getTiff, 
    getParadise, 
    getCinesphere, 
    getHotDocs 
};