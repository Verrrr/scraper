const express = require('express');
const app = express();
const rp = require('request-promise');
const cheerio = require('cheerio');

const PORT = process.env.PORT || 8080;

var server = app.listen(PORT, ()=> {
    process.stdout.write('\033c');
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
    } else if(category == 3){
        q = q.replace(' ','-');
        const uri = `http://ph.priceprice.com/search/?keyword={${q}}&sort=rated`;
        const options = {
            uri,
            transform: function (body) {
              return cheerio.load(body);
            }
          };
        rp(options)
        .then(function($){
            let items = new Array();
            $('.itemBox').each((i,elem) => {

                if($(elem).find('span.newPice').text().trim() == '-') return;
                let price = $(elem).find('span.newPice',0).text().trim().replace(' -','');
                const obj = {
                    link: "http://ph.priceprice.com"+$(elem).find('a').attr('href'),
                    img: $(elem).find('img').attr('src'),
                    name: $(elem).find('li.name').text(),
                    price,
                }
                items.push(obj);
            });
            res.json(items);
        })
        .catch(function(err){
            res.status(500).json(err);
            console.log(err);
        });       
    } else if(category == 4){
        q = q.replace(' ','+');
        const uri = `http://www.pcworx.ph/?module=product&search=${q}`;
        const options = {
            uri,
            transform: function (body) {
              return cheerio.load(body);
            }
          };
        rp(options)
        .then(function($){
            let items = new Array();
            $('.col-md-10 > .row').children().each((i,elem) => {
                const obj = {
                    name: $(elem).find('div.panel-heading > a > img.img-responsive.img-center.img-size').attr('title'),
                    link: 'http://www.pcworx.ph/'+$(elem).find('p.ellipsis > b > a.product-description').attr('href').replace('./',''),
                    price: $(elem).find('b.sellingprice-product').text(),
                    img: 'http://www.pcworx.ph/'+$(elem).find('div.panel-heading > a > img.img-responsive.img-center.img-size').attr('src'),
                }
                items.push(obj);
            });
            res.json(items);

            // res.send($('.col-md-10 > .row').children().html());
        })
        .catch(function(err){
            res.status(500).json(err);
            console.log(err);
        });
    } else if(category == 2){

        const typeArr = [
            "DEFAULT",
            "ALUMINUM VAN",
            "ALUMINUM WING VAN",
            "BOAT W/ TRAILER",
            "BULLDOZER",
            "BUS",
            "CABIN",
            "CANVAS WING VAN",
            "CAR CARRIER",
            "CARGO DUMP",
            "CARGO TRUCK",
            "CONCRETE PUMP",
            "DOUBLE CAB TRUCK",
            "DUMP TRUCK",
            "ENGINE",
            "FIBER WING VAN",
            "FIRE TRUCK",
            "FLAT BED",
            "FRONTCUT",
            "GARBAGE COMPACTOR",
            "GENERATOR",
            "HAND GUIDE ROLLER",
            "HYDRAULIC EXCAVATOR",
            "INSULATED VAN",
            "JEEP",
            "JETSKI",
            "LOADER BACKHOE",
            "MANLIFT TRUCK",
            "MISCELLANEOUS ITEMS",
            "MIXER TRUCK",
            "MOTOR GRADER",
            "OPEN TOP VAN",
            "PASSENGER VAN",
            "REFRIGERATED VAN",
            "RICE PLANTER",
            "ROUGH TERRAIN CRANE",
            "SELF LOADER",
            "SKID LOADER",
            "SPECIAL UNIT",
            "SPRINKLER TRUCK",
            "SUV",
            "TANKER",
            "TOWER LIGHT",
            "TRACTOR HEAD",
            "TRAILER - ALUMINUM VAN",
            "TRAILER - CARGO",
            "TRAILER - CHASSIS",
            "TRAILER - FLAT BED",
            "TRAILER - LOW BED",
            "TRAILER - TANK",
            "TRAILER - WING VAN",
            "TRUCK MOUNTED CRANE",
            "TRUCK WITH CRANE",
            "VACUUM TRUCK",
            "VIBRATORY ROLLER",
            "WHEEL EXCAVATOR",
            "WHEEL LOADER"
            ];

        let type = req.query.type;
        
        const uri = `https://www.uauctioneers.net/get_stocks.php?category=${typeArr[type]}&make=DEFAULT&model=DEFAULT&filter=${q}`;
        console.log(uri);
        const options = {
            uri,
            transform: function (body) {
              return cheerio.load(body);
            }
          };
        rp(options)
        .then(function($){
            let items = new Array();
            $('section.card.card-admin').each((i,elem) => {
                const obj = {
                    name: $(elem).find('table > tbody >tr').eq(1).find('td').eq(1).text().trim().replace("\n",""),
                    link: `https://www.uauctioneers.net/stockslist.php?category=${typeArr[type]}&make=DEFAULT&model=DEFAULT&filter=${q}`,
                    price: 0,
                    img: "https://www.uauctioneers.net/"+$(elem).find('img').attr('src'),
                }
                items.push(obj);
            });

            res.json(items);
            // res.send($.html());
        })
        .catch(function(err){
            res.status(500).json(err);
            console.log(err);
        });
    }
});