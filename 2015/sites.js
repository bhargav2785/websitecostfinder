$(function () {
    $.ajax({
        method: 'GET',
        url: 'prices.json',
        success: function (data) {
            window.COSTFINDERDATA = data.sort(function (a, b) {
                return Number(a.Rank) < Number(b.Rank) ? -1 : 1;
            });

            __setupDropDown();
            __loadByRank(1);
            __setupListeners();
        },
        error: function (data) {
            console.log('ERROR');
            console.log(data);
        }
    });

    __setupListeners = function () {
        $('select').change(function (e) {
            var rank = $("select option:selected").val();
            __loadByRank(rank);
        });
    };

    __setupDropDown = function () {
        var optionHtml = '';
        $.each(window.COSTFINDERDATA, function (i, countryData) {
            var rank = countryData.Rank,
                site = countryData.Website;

            optionHtml += '<option value="' + rank + '">' + rank + ' - ' + site + '</option>';

            $('select').html(optionHtml);
        });
    };

    __loadByRank = function (rank) {
        $.each(window.COSTFINDERDATA, function (i, countryData) {
            if (rank == countryData.Rank) {
                var loadRank = countryData.Rank,
                    loadSite = countryData.Website,
                    names = [],
                    prices = [];

                delete countryData.Rank;
                delete countryData.Website;

                $.each(countryData, function (name, price) {
                    names.push(name);
                    prices.push(Number(price));
                });

                __loadData(names, prices, loadSite, loadRank);
            }
        });
    };

    __loadData = function (names, prices, site, rank) {
        $('#container').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'Prices in USD to load ' + site + ' on mobile'
            },
            subtitle: {
                text: '2015 Alexa global rank: ' + rank
            },
            xAxis: {
                categories: names,
                crosshair: true,
                title: {
                    text: 'Countries'
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
