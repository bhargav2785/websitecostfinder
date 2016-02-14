$(function () {
    $.ajax({
        method: 'GET',
        url: 'prices.json',
        success: function (data) {
            var dataSorted = data.sort(function (a, b) {
                return Number(a.Rank) < Number(b.Rank) ? -1 : 1;
            });
            var countries = {};
            $.each(dataSorted, function (i, countryData) {
                var rank = countryData.Rank,
                    site = countryData.Website;

                delete countryData.Rank;
                delete countryData.Website;

                $.each(countryData, function (name, value) {
                    if ('undefined' === typeof countries[name]) {
                        countries[name] = {};
                    }
                    countries[name][site] = {};
                    countries[name][site].price = value;
                    countries[name][site].rank = rank;
                });
            });

            window.COSTFINDERDATA = countries;

            __setupDropDown();
            __loadByCountry('United States');
            __setupListeners();
        },
        error: function (data) {
            console.log('ERROR');
            console.log(data);
        }
    });

    __setupListeners = function () {
        $('select').change(function (e) {
            var name = $("select option:selected").val();
            __loadByCountry(name);
        });
    };

    __setupDropDown = function () {
        var optionHtml = '';
        $.each(window.COSTFINDERDATA, function (countryName, countryData) {
            var selected = '';
            if (countryName == 'United States') {
                selected = 'selected="selected"';
            }
            optionHtml += '<option ' + selected + ' value="' + countryName + '">' + countryName + '</option>';
            $('select').html(optionHtml);
        });
    };

    __loadByCountry = function (name) {
        $.each(window.COSTFINDERDATA, function (countryName, countryData) {
            if (name == countryName) {
                var sites = [],
                    prices = [];

                $.each(countryData, function (site, data) {
                    sites.push(site + ' (' + data.rank + ')');
                    prices.push(Number(data.price));
                });

                __loadData(sites, prices, name);
            }
        });
    };

    __loadData = function (sites, prices, country) {
        var min = Math.min.apply(null, prices),
            max = Math.max.apply(null, prices),
            sum = prices.reduce(function (a, b) {
                return a + b;
            }),
            avg = (sum / prices.length).toFixed(3);

        $('#container').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'Prices in USD to load top 500 sites in <strong>' + country + '</strong>'
            },
            subtitle: {
                text: 'Lowest: $' + min + ', Highest: $' + max + ', Average: $' + avg
            },
            xAxis: {
                categories: sites,
                crosshair: true,
                title: {
                    text: 'Sites'
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Amount (in USD)'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>${point.y:.2f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                name: 'Price',
                data: prices
            }]
        });
    };
});
