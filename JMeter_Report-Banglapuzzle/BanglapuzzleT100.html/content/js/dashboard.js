/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 83.14285714285714, "KoPercent": 16.857142857142858};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.005625, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.005, 500, 1500, "https://www.banglapuzzle.com/industry/rmg-sector"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "https://www.banglapuzzle.com/"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.banglapuzzle.com/products"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.banglapuzzle.com/services"], "isController": false}, {"data": [0.03, 500, 1500, "https://www.banglapuzzle.com/contact"], "isController": false}, {"data": [0.005, 500, 1500, "https://www.banglapuzzle.com/partners"], "isController": false}, {"data": [0.005, 500, 1500, "https://www.banglapuzzle.com/industry/healthcare"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 700, 118, 16.857142857142858, 17702.800000000014, 726, 143456, 12830.5, 34967.1, 54073.349999999955, 72974.34000000001, 2.9277065601539136, 452.02661174167173, 2.589913430069638], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://www.banglapuzzle.com/industry/rmg-sector", 100, 28, 28.0, 14854.609999999997, 925, 38313, 13140.5, 24922.700000000004, 26620.8, 38207.73999999995, 0.861066861841822, 114.1960494521462, 0.7203951086020579], "isController": false}, {"data": ["Test", 100, 61, 61.0, 123919.60999999996, 94118, 175932, 121809.5, 142968.0, 151226.75, 175709.10999999987, 0.5562632460185458, 601.194312399525, 3.4445786670959166], "isController": true}, {"data": ["https://www.banglapuzzle.com/", 100, 11, 11.0, 44527.650000000016, 4856, 143456, 45069.5, 71153.4, 73700.75, 143024.59999999977, 0.6798327611407594, 176.32896682416126, 0.296026005727591], "isController": false}, {"data": ["https://www.banglapuzzle.com/products", 100, 18, 18.0, 16620.65000000001, 5555, 54720, 15651.5, 28020.0, 33984.05, 54624.45999999995, 0.6568230781356733, 75.3458494220778, 0.6353736994903053], "isController": false}, {"data": ["https://www.banglapuzzle.com/services", 100, 17, 17.0, 15304.160000000005, 5857, 39270, 15648.0, 22021.4, 27173.049999999952, 39266.89, 0.6787023211619384, 107.43724522151146, 0.664545014931451], "isController": false}, {"data": ["https://www.banglapuzzle.com/contact", 100, 15, 15.0, 9897.64, 726, 21827, 9123.0, 18380.9, 19410.85, 21823.789999999997, 1.0067958721369243, 151.86894349358167, 1.0087131103699976], "isController": false}, {"data": ["https://www.banglapuzzle.com/partners", 100, 15, 15.0, 9579.340000000006, 768, 28544, 8940.0, 15869.000000000002, 17234.0, 28510.669999999984, 0.9454744863709852, 101.33241915306759, 0.948059768169656], "isController": false}, {"data": ["https://www.banglapuzzle.com/industry/healthcare", 100, 14, 14.0, 13135.549999999997, 790, 27962, 11856.5, 22245.100000000006, 26924.149999999987, 27958.609999999997, 0.7551729346020238, 119.12828706719152, 0.7318835192946685], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 118, 100.0, 16.857142857142858], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 700, 118, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 118, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["https://www.banglapuzzle.com/industry/rmg-sector", 100, 28, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 28, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.banglapuzzle.com/", 100, 11, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["https://www.banglapuzzle.com/products", 100, 18, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["https://www.banglapuzzle.com/services", 100, 17, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["https://www.banglapuzzle.com/contact", 100, 15, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["https://www.banglapuzzle.com/partners", 100, 15, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["https://www.banglapuzzle.com/industry/healthcare", 100, 14, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 14, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
