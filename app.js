const express = require('express');
const app = express();
const rp = require('request-promise');
const cheerio = require('cheerio');

const PORT = process.env.PORT || 8080;

var server = app.listen(PORT, ()=> {
    console.clear();
    console.log('listening to port 8080');
});

app.get('/scrape', (req, res) => {
    const category = req.query.category;
    let q = req.query.q;
    if(category == 1){
        const uri = `https://www.automobilico.com/find-a-vehicle/?fwp_keywords=${q}`;
        const options = {
            uri,
            transform: function (body) {
              return cheerio.load(body);
            }
          };
        rp(options)
        .then(function($){
            let items = new Array();
            $('.vehicle').each((i,elem) => {
                const obj = {
                    name: $(elem).find('h3.vehicle-title').text(),
                    link: $(elem).find('a.vehicle-link').attr('href'),
                    price: $(elem).find('div.vehicle-price > div.vehicle-price').text(),
                    img: $(elem).find('img').attr('src'),
                }
                items.push(obj);
            });
            res.json(items);
        })
        .catch(function(err){
            res.status(500).json(err);
            console.log(err);
        });
    }
});