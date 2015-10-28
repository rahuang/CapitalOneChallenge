function formatData(data){
    var dict = {};
    dict["categories"] = [];
    dict["neutral"] = [];
    dict["pos"] = [];
    dict["neg"] = [];
    dict["ppos"] = [];
    dict["pneg"] = [];
    dict["pneutral"] = [];
    var keys = Object.keys(data);
    keys.sort();
    alert(keys);
    for(var i = 0; i < keys.length; i++){
        d = keys[i];
        dict["categories"].push(d);
        var neutral = data[d]["neutral"];
        var pos = data[d]["pos"];
        var neg = data[d]["neg"];
        dict["neutral"].push(neutral);
        dict["pos"].push(pos);
        dict["neg"].push(neg);
        var sum = pos + neg;
        dict["ppos"].push(pos/sum);
        dict["pneg"].push(neg/sum);
    }
    return dict;
}

function displayCharts(dict){
    $('#count-chart').highcharts({
        title: {
            text: '#CapitalOne Pos/Neg Post Frequency',
            x: -20 //center
        },
        xAxis: {
            categories: dict["categories"]
        },
        yAxis: {
            title: {
                text: 'Number of Posts'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ' posts'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'Positive',
            color: 'green',
            data: dict["pos"]
        }, {
            name: 'Negative',
            color: 'red',
            data: dict["neg"]
        }, {
            name: 'Neutral',
            color: 'black',
            data: dict["neutral"]
        }]
    });

    $('#percentage-chart').highcharts({
        title: {
            text: '#CapitalOne Percentage of Pos and Neg Posts',
            x: -20 //center
        },
        xAxis: {
            categories: dict["categories"]
        },
        yAxis: {
            title: {
                text: 'Percentage of Posts'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ' ratio'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'pos',
            color: 'green',
            data: dict["ppos"]
        }, {
            name: 'neg',
            color: 'red',
            data: dict["pneg"]
        }]
    });
}