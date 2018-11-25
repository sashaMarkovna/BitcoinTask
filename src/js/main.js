window.onload = function () {
    let symbols = {
            EUR: '€',
            USD: '$',
            RUB: '₽',
            GBP: '£'
        },
        //to keep data for each cryptoblock
        cryptoList  = {
            ethereum: {
                name: '#ethereum',
                url: 'https://apiv2.bitcoinaverage.com/indices/global/ticker/BTCUSD',
                showValOptions: 'percent',
            },
            bitcoin: {
                name: '#bitcoin',
                url: 'https://apiv2.bitcoinaverage.com/indices/global/ticker/BTCUSD',
                showValOptions: 'percent',
            },
            litecoin: {
                name: '#litecoin',
                url: 'https://apiv2.bitcoinaverage.com/indices/global/ticker/BTCUSD',
                showValOptions: 'percent',
            }
        },
        selectedCurrency = $('.currency__selected').attr('id'),
        //will keep '%' or selected currency symbol, depending on showValOptions selected in cryptoList object
        currentSymbol;

    $('.currency__selected').on('click', () => $('.currency__list').toggleClass('currency__list--active'));

    //function converter from '%' to '$' and vice versa
    $('.slider__circle').on('click', (event) => {
        let currentCrypt = cryptoList[$(event.target).attr('data-target')];
        currentCrypt['showValOptions'] === 'percent' ? currentCrypt['showValOptions'] = 'price' : currentCrypt['showValOptions'] = 'percent';
        getData.call(currentCrypt, getCurrentPriceChanges);
        $(event.target).parent().toggleClass('slider--deactivated');
    });


    //Did't use SELECT as on PSD there's 2 different blocks for selected currency and dropdown list
    //This function will delete the chosen currency from the <ul> and append the previous one.
    //Then will call getData() for every object in cryptoList to convert currency
    $('.currency__list').on('click', (event) => {
        if($(event.target).is('li')) {
            let target = $(event.target).html();
            let newNode = '<li class="currency__item">' + selectedCurrency + '</li>';
            $('.currency__selected').attr('id', target).html(target);
            $('.currency__list').append(newNode);
            $(event.target).remove();
            selectedCurrency = target;
            jQuery.each(cryptoList, function() {
                getData.call(this, getCurrentPrice, getCurrentPriceChanges);
            });
            $('.currency__list').toggleClass('currency__list--active');
        }
    });

    //close error block
    $('.error__close').on('click', () => {
       $('.error').css('display', 'none');
       $('.container').css('opacity', 'inherit');
    });

    //should receive object of crypto-currency from cryptoList as a context and function as an argument
    function getData() {
        let obj = this,
            valueOption = this.showValOptions,
            functions = [...arguments];

        $.get(this.url)
            .then( (data) => functions.forEach( func => func.call(obj, data, valueOption)))
            .catch( (error) => errorHandler(error));
    }

    function errorHandler(error) {
        console.log(error);
        $('.error').css('display', 'flex');
        $('.container').css('opacity', '0.1');
    }

    //function will get current price and call render function for price element from DOM
    function getCurrentPrice(data, valueOption) {
        price = $(this.name + ' > li > span.price');
        //data.bid = current price in data
        //if selected currency in USD just write data to price element, else - use converter to convert value to chosen currency
        selectedCurrency !== 'USD' ? converter.call(price, data.bid) : $(price).html(symbols[selectedCurrency] + data.bid);
    }

    //function will get current price changes by hour/day/week/month in $$ or %
    // and call render function for every DOM element with attribute 'data-term' with tha same value
    function getCurrentPriceChanges(data, valueOption) {
        valueOption === 'percent' ? currentSymbol = '%' : currentSymbol = symbols[selectedCurrency];

        let nodesList = $(this.name + ' > li > span.data');
        $(nodesList).map( function() {
            let period = $(this).attr('data-term'),
                val = data['changes'][valueOption][period];
            //to avoid convertation of percent value
            valueOption !== 'percent' && selectedCurrency !== 'USD' ? converter.call(this, val) : render.call(this, val);
        });
    }

    //function renders value to dom element adding additional class depending if the value is positive or negative
    function render(val) {
        if(val === undefined) { $(this).html('no information').addClass('red'); }
        //to avoid adding style(red/green) class to the 'Price' element
        if($(this).attr('class') === 'price') {
            $(this).html(symbols[selectedCurrency] + val);
        } else {
            val > 0 ? $(this).html('+' + val + currentSymbol).addClass('green') : $(this).html(val + currentSymbol).addClass('red');
        }
    }

    //converting price if selected currency !== USD, as we receive data in USD
    function converter(val) {
        let obj = this;
        //the base is in EUR
        $.get('http://data.fixer.io/api/latest?access_key=3d88b1bfc317b2feff7ce958af75e566&symbols=USD,GBP,RUB')
            .then( (data) => {
            let rate = val / data.rates.USD;
            selectedCurrency === 'EUR' ? render.call(obj, rate.toFixed(2)) : render.call(obj, (rate * data['rates'][selectedCurrency]).toFixed(2));
        }).catch( (error) => errorHandler(error));
    }
    //onload will call getData function for each crypto-block element on the page
    jQuery.each(cryptoList, function() {
        getData.call(this, getCurrentPrice, getCurrentPriceChanges);
    });
};



