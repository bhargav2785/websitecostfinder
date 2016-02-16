$(function () {
    $.ajax({
        method: 'GET',
        url: 'metrics.json',
        success: function (data) {
            var dataSorted = data.sort(function (a, b) {
                return Number(a.Rank) < Number(b.Rank) ? -1 : 1;
            }), metrics = {};

            $.each(dataSorted, function (i, metricData) {
                var rank = metricData.Rank,
                    site = metricData.Website;

                delete metricData.Rank;
                delete metricData.Website;

                $.each(metricData, function (name, value) {
                    if ('undefined' === typeof metrics[name]) {
                        metrics[name] = {};
                    }
                    metrics[name][site] = {};
                    metrics[name][site].value = value;
                    metrics[name][site].rank = rank;
                });
            });

            window.METRICSDATA = metrics;

            __setupDropDown();
            __loadByMetric('loadTime');
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
            __loadByMetric(name);
        });
    };

    __setupDropDown = function () {
        var optionHtml = '';
        $.each(window.METRICSDATA, function (name, metricsData) {
            optionHtml += '<option value="' + name + '">' + name + '</option>';

            $('select').html(optionHtml);
        });
    };

    __loadByMetric = function (name) {
        $.each(window.METRICSDATA, function (metricName, metricsData) {
            if (name == metricName) {
                var sites = [],
                    values = [];

                $.each(metricsData, function (siteName, data) {
                    sites.push(siteName + ' (' + data.rank + ')');
                    values.push(Number(data.value));
                });

                __loadData(sites, values, metricName);
            }
        });
    };

    __loadData = function (sites, values, metricName) {
        var min = Math.min.apply(null, values),
            max = Math.max.apply(null, values),
            sum = values.reduce(function (a, b) {
                return a + b;
            }),
            avg = (sum / values.length).toFixed(3);

        $('#container').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'Values of <strong>' + metricName + '</strong> for top 500 sites'
            },
            subtitle: {
                text: ''
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
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:.f}</b></td></tr>',
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
                name: 'value',
                data: values,
                color: '#f7a35c'
            }]
        })
    };
});
