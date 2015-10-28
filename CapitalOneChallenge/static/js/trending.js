var dict = null;
var next = "";


function loadStart(){
    $("#load-more").prop("disabled",true);
    $("#loader").show();
}

function loadFinish(){
    $("#load-more").prop("disabled",false);
    $("#loader").hide();
}

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
    for(var i = 0; i < keys.length; i++){
        d = keys[i];
        dict["categories"].push(d);
        var neutral = data[d]["neutral"];
        var pos = data[d]["pos"];
        var neg = data[d]["neg"];
        dict["neutral"].push(neutral);
        dict["pos"].push(pos);
        dict["neg"].push(neg);
        var sum = pos + neg == 0 ? 1 : pos + neg;
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

$(function () {
    loadStart();
    $.ajax({
      url: "/trendingdata",
      context: document.body
    }).done(function( data ) {
        loadFinish();
        next = data[0]
        var values = data[1]
        dict = formatData(values);
        displayCharts(dict);
    });
});

function combineDict(temp){
    if(temp["categories"][temp["categories"].length - 1] == dict["categories"][0]){
        temp["categories"].pop();
        dict["neutral"][0] += temp["neutral"].pop();
        dict["pos"][0] += temp["pos"].pop();
        dict["neg"][0] += temp["neg"].pop();
        temp["ppos"].pop();
        temp["pneg"].pop();
        dict["ppos"][0] = dict["pos"][0] / (dict["pos"][0] + dict["neg"][0]);
        dict["pneg"][0] = dict["neg"][0] / (dict["pos"][0] + dict["neg"][0]);
    }
    dict["categories"] = temp["categories"].concat(dict["categories"]);
    dict["neutral"] = temp["neutral"].concat(dict["neutral"]);
    dict["pos"] = temp["pos"].concat(dict["pos"]);
    dict["neg"] = temp["neg"].concat(dict["neg"]);
    dict["ppos"] = temp["ppos"].concat(dict["ppos"]);
    dict["pneg"] = temp["pneg"].concat(dict["pneg"]);
}


function loadMore(){
    loadStart();
    $.ajax({
      url: "/trendingdata?next=" + next,
      context: document.body
    }).done(function( data ) {
        loadFinish();
        next = data[0]
        var values = data[1]
        var temp = formatData(values);
        combineDict(temp);
        displayCharts(dict);
    });
}




