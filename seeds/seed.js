const cheerio = require('cheerio')
    , request = require('request')
    , db      = require('../db/index')

module.exports = {
    getRoyal() {
        let url = 'http://theroyal.to/'
    
        request(url, (err, res, html) => {
            if(!err && res.statusCode == 200) {
                const $ = cheerio.load(html);
    
                $('.time_title_wrapper').each((i, el) => {
                    let screening = {};
    
                    let showtime = $(el)
                        .find('.showtime')
                        .text()
                        .replace(/\s\s+/g, '');
                        screening.showtime = showtime;
                    
                    let title = $(el)
                        .find('.now_playing_title')
                        .children('a')
                        .text()
                        .replace(/\s\s+/g, '');
                        screening.title = title;
    
                    let link = $(el)
                        .find('.now_playing_ticket')
                        .children('a')
                        .attr('href')
                        .replace(/\s\s+/g, '');
                        screening.link = link;
    
                    console.log(screening);
    
                    async function seedRoyal(screening) {
                        let sql = 'INSERT INTO screening (title, link, showtime, theatre) VALUES ($1, $2, $3, $4) returning *';
                        let params = [
                            screening.title,
                            screening.link,
                            screening.showtime,
                            "the Royal"
                        ];
                        
                        db
                            .query(sql, params)
                            .then(res => {
                                console.log(res.rows[0])
                            })
                            .catch(err => {
                                console.log('ERROR:', err)
                            });
                    } 
                    seedRoyal(screening);
                });
            }
        })    
    },
    getParadise() {
        let url = 'http://paradiseonbloor.com';
    
        request(url, (err, res, html) => {
            if(!err && res.statusCode == 200) {
                const $ = cheerio.load(html);

                    $('.showtimes_display').each((i, el) => {
                        $(el).find('.event-row').each((i, elem) => {
                            let screening = {};

                            let showtime = $(elem)
                                .find('.event-info')
                                .children('span')
                                .text()
                                .replace(/\s\s+/g, '');
                                screening.showtime = showtime;
                            console.log('SHOWTIME:', showtime);

                            let title = $(elem)
                                .find('.event-title')
                                .children('a')
                                .text()
                                .replace(/\s\s+/g, '');
                                screening.title = title;
                            console.log(title);

                            let link = $(elem)
                                .find('.event-links')
                                .children('.event-link buy-tickets')
                                .attr('href')
                                .replace(/\s\s+/g, '');
                                screening.link = link;
                            console.log(link);

                            console.log('SCREENING', screening);
                            seedParadise(screening);
                        })
                    });
    
                    async function seedParadise(screening) {
                        let sql = 'INSERT INTO screening (title, link, showtime, theatre) VALUES ($1, $2, $3, $4) returning *';
                        let params = [
                            screening.title,
                            screening.link,
                            screening.showtime,
                            "Paradise Theatre"
                        ];
                        
                        db
                            .query(sql, params)
                            .then(res => {
                                console.log(res.rows[0])
                            })
                            .catch(err => {
                                console.log('ERROR:', err)
                            });
                    }
            } else {
                console.log(res);
            }
        })          
    },
    getRevue() {
        let url = 'https://revuecinema.ca/';
    
        request(url, (err, res, html) => {
            if(!err && res.statusCode == 200) {
                const $ = cheerio.load(html);

                    $('.wpt_listing').each((i, el) => {
                        $(el).find('.wp_theatre_event').each((i, elem) => {
                            let screening = {};

                            let link = $(elem)
                                .find('.wp_theatre_event_title')
                                .children('a')
                                .attr('href')
                                .replace(/\s\s+/g, '');
                            screening.link = link;   

                            let title = $(elem)
                                .find('.wp_theatre_event_title')
                                .children('a')
                                .text()
                                .replace(/\s\s+/g, '');
                            screening.title = title; 

                            let showtime = $(elem)
                                .find('.wp_theatre_event_time')
                                .text()
                                .replace(/\s\s+/g, '');
                            screening.showtime = showtime;  

                            console.log('SCREENING', screening);
                            seedRevue(screening);
                        });
                    });
    
                    async function seedRevue(screening) {
                        let sql = 'INSERT INTO screening (title, link, showtime, theatre) VALUES ($1, $2, $3, $4) returning *';
                        let params = [
                            screening.title,
                            screening.link,
                            screening.showtime,
                            "Revue Theatre"
                        ];
                        
                        db
                            .query(sql, params)
                            .then(res => {
                                console.log('RESUULT: ', res.rows[0])
                            })
                            .catch(err => {
                                console.log('ERROR:', err)
                            });
                    }
            } else {
                console.log(res.statusCode);
            }
        })          
    },
    getHotDocs() {
        let url = 'http://hotdocscinema.ca/';
    
        request(url, (err, res, html) => {
            if(!err && res.statusCode == 200) {
                const $ = cheerio.load(html);

                let screening = {};

                $('tr').each((i, el) => {
                    if (i > 4) return false;

                    let showtime = $(el)
                        .children('td')
                        .first()
                        .text()
                        .replace("More", '');
                    screening.showtime = showtime;    
                    
                    let link = $(el)
                        .find('td')
                        .children('a')
                        .attr('href')
                        .replace(/\s\s+/g, '');
                    screening.link = link;    

                    let title = $(el)
                        .children('td')
                        .last()
                        .text()
                        .replace(/\s\s+/g, '');
                    screening.title = title;

                    seedHotdoc(screening);
                });

                async function seedHotdoc(screening) {
                    let sql = 'INSERT INTO screening (title, link, showtime, theatre) VALUES ($1, $2, $3, $4) returning *';
                    let params = [
                        screening.title,
                        screening.link,
                        screening.showtime,
                        "HotDocs Theatre"
                    ];
                    
                    db
                        .query(sql, params)
                        .then(res => {
                            console.log('RESULT: ', res.rows[0])
                        })
                        .catch(err => {
                            console.log('ERROR:', err)
                        });
                }
            }
        })          
    },
    getRegent() {
        let url = 'http://regenttoronto.com/';
    
        request(url, (err, res, html) => {
            if(!err && res.statusCode == 200) {
                const $ = cheerio.load(html);

                let screening = {};
                screening.showtime = [];

                $('.entry-content').each((i, el) => {
                    let title = $(el)
                        .find('#movieSynopsis')
                        .children('a')
                        .text()
                        .replace(/\s\s+/g, '');
                    screening.title = title;    

                    let showtime = $('#m_-7972583467647214213ydpa66b052eyiv2118296373ydpb6177469yiv3711678078ydp8a1e4473yiv5733607446ydp5c7a33e9yiv3975041694yui_3_16_0_ym19_1_1542128414330_8467')
                        .text();
                        // .replace('', '');
                    screening.showtime.push(showtime);

                    seedRegent(screening);
                })

                async function seedRegent(screening) {
                    let sql = 'INSERT INTO screening (title, link, showtime, theatre) VALUES ($1, $2, $3, $4) returning *';
                    let params = [
                        screening.title,
                        screening.link,
                        screening.showtime,
                        "Regent Theatre"
                    ];
                    
                    db
                        .query(sql, params)
                        .then(res => {
                            console.log('RESULT: ', res.rows[0])
                        })
                        .catch(err => {
                            console.log('ERROR:', err)
                        });
                }
            }
        })          
    },
    getTiff() {
        let url = 'https://www.tiff.net/';
    
        request(url, (err, res, html) => {
            if(!err && res.statusCode == 200) {
                const $ = cheerio.load(html);

                let screening = {};

                $('.row').each((i, el) => {
                    let title  = $(el)
                        .find('.style__itemTitle___108mZ')
                        .text()
                        .replace(/\s\s+/g, '');
                    console.log(title)
                })

                async function seedTiff(screening) {
                    let sql = 'INSERT INTO screening (title, link, showtime, theatre) VALUES ($1, $2, $3, $4) returning *';
                    let params = [
                        screening.title,
                        screening.link,
                        screening.showtime,
                        "Tiff Bell Lightbox"
                    ];
                    
                    db
                        .query(sql, params)
                        .then(res => {
                            console.log('RESULT: ', res.rows[0])
                        })
                        .catch(err => {
                            console.log('ERROR:', err)
                        });
                }
            }
        })          
    },
    getTiffy() {
        const phantom = require('phantom');
 
        (async function() {
            try {
                const instance = await phantom.create();
                const page = await instance.createPage();
    
                await page.on('onResourceRequested', function(requestData) {
                    console.info('Requesting', requestData.url);
                });
            
                const status = await page.open('https://www.tiff.net/calendar');
                const content = await page.property('content');
                const $ = cheerio.load(content);
    
                let hey = $('.style__date___3ugzP').text();
                console.log('BODY : ', hey);
                
                await instance.exit();    
            } catch (err) {
                console.log('ERROR : ', err);
            }
        })();
    }
};    