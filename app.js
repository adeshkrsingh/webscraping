var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser')

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())

//Setting View Engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main',helpers: {
        inc: function(value, options){
          return parseInt(value) + 1;
        }
}}));
app.set('view engine', 'handlebars');
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/group-members', (req, res) => {
    res.render('about')
})


app.post('/search', (req, res) => {
    request('https://www.smartprix.com/products/?q=' + req.body.search + '&cat=all', (err, resp, body) => {
        var productSuggestion = []
        var $ = cheerio.load(body);
        $('li.f-mobiles').each(function () {
            // console.log($(this))
            var productName = $(this).find('div.info>h2').text()
            if (productName == '') {
                return false
            }

            var imgSrc = $(this).find('div.simg> a>img').attr('src');
            var href = $(this).find('div.simg> a').attr('href');
            var productSpecification = $(this).find('ul.pros').text();
            var price = $(this).find('.price').text();
            console.log()
            // console.log(imgSrc)
            // console.log()
            var productDetails = {
                name: productName,
                href: href,
                img: imgSrc,
                specs: productSpecification,
                price: price.replace(/^\D+/g, '')
            }
            productSuggestion.push(productDetails)



        })
        //  console.log(productSuggestion);
        res.render('search', {
            product: productSuggestion
        })
    })
})

app.get('/search/mobiles/:id', (req, res) => {
    request('https://www.smartprix.com/mobiles/' + req.params.id, (err, resp, body) => {
        var productInfo = [];
        var productFeature = [];
        var priceTable = [];
        var $ = cheerio.load(body);
        var productName = $('#page-heading').find('h1').text();
        var bestPrice = $('#product-price').find('.price').text();
        var largeImage = $('.large-img').find('img').attr('src');
        $('.product-features').find('ul').each(function(){
           
            productFeature.push($(this).find('li').text()
        )})
        var productDetails = {
            name:productName,
            price:bestPrice.replace(/^\D+/g, ''),
            img:largeImage,
        }

        $('#compare-prices >table > tbody  > tr').each(function(index , item) {
            var itemSrc = $(item).find('img').attr("src")  // will give src
            var price  = $(item).find('.price div').text().split(' ')[1]  // will give price
            if(price!=undefined){
                console.log("Price is:",price)
            var brandPrice = {
                brand:itemSrc,
                price:price.slice(0,6)
            }
            priceTable.push(brandPrice);
            }
            
        })
        // console.log(priceTable)
        productInfo.push(productDetails);
        // console.log(productInfo);
        res.render('details',{product:productDetails,feature:productFeature,prcTable:priceTable})
    })
     
})



app.listen('3000')