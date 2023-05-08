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

    var data = {"OkPercent": 21.43262411347518, "KoPercent": 78.56737588652483};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1930673758865248, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.20815602836879432, 500, 1500, "GetBooking after Partial Update"], "isController": false}, {"data": [0.20971631205673757, 500, 1500, "GetBooking after Update"], "isController": false}, {"data": [0.20879432624113475, 500, 1500, "PartialUpdateBooking"], "isController": false}, {"data": [0.08602836879432624, 500, 1500, "Auth"], "isController": false}, {"data": [0.2078723404255319, 500, 1500, "Create Booking"], "isController": false}, {"data": [0.20709219858156028, 500, 1500, "GetBooking"], "isController": false}, {"data": [0.20964539007092198, 500, 1500, "UpdateBooking "], "isController": false}, {"data": [0.2072340425531915, 500, 1500, "DeleteBooking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 56400, 44312, 78.56737588652483, 456.2653191489324, 0, 13262, 0.0, 185.0, 757.9000000000015, 9691.900000000016, 590.0075320110469, 1001.7787184073982, 36.52226470965144], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetBooking after Partial Update", 7050, 5539, 78.56737588652483, 75.33375886524823, 0, 2197, 0.0, 309.0, 349.0, 863.4499999999989, 77.70478793757164, 132.48752452385153, 3.0901301486310735], "isController": false}, {"data": ["GetBooking after Update", 7050, 5539, 78.56737588652483, 73.8399999999999, 0, 1340, 0.0, 307.0, 349.0, 477.97999999999956, 77.2484221598878, 131.7094158156557, 3.0719815932350105], "isController": false}, {"data": ["PartialUpdateBooking", 7050, 5539, 78.56737588652483, 78.02921985815568, 0, 1873, 0.0, 322.0, 369.0, 919.4699999999993, 77.47678443870542, 132.0987760316501, 5.156726502829826], "isController": false}, {"data": ["Auth", 7050, 5539, 78.56737588652483, 2908.239007092194, 0, 13262, 1208.0, 9174.800000000001, 10459.45, 11405.939999999999, 73.9776912664351, 123.90714029003452, 4.025775126181807], "isController": false}, {"data": ["Create Booking", 7050, 5539, 78.56737588652483, 240.8005673758867, 0, 11124, 7.0, 575.0, 1179.4499999999998, 1775.449999999999, 76.38633063904479, 130.78520221384923, 7.38640326700544], "isController": false}, {"data": ["GetBooking", 7050, 5539, 78.56737588652483, 79.51347517730484, 0, 1890, 0.0, 313.90000000000055, 361.0, 1038.4899999999998, 76.64876383483008, 130.7672057958153, 3.048134642251408], "isController": false}, {"data": ["UpdateBooking ", 7050, 5539, 78.56737588652483, 115.37957446808522, 0, 2104, 1.0, 363.0, 418.0, 1044.3499999999967, 76.92811313342936, 131.1653739606521, 7.986236142027846], "isController": false}, {"data": ["DeleteBooking", 7050, 5539, 78.56737588652483, 78.98695035460955, 0, 1619, 0.0, 320.0, 369.0, 951.0, 77.93155288291476, 130.15017325607425, 4.24093942065352], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 44312, 100.0, 78.56737588652483], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 56400, 44312, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 44312, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GetBooking after Partial Update", 7050, 5539, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 5539, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking after Update", 7050, 5539, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 5539, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PartialUpdateBooking", 7050, 5539, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 5539, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Auth", 7050, 5539, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 5539, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Create Booking", 7050, 5539, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 5539, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking", 7050, 5539, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 5539, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["UpdateBooking ", 7050, 5539, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 5539, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["DeleteBooking", 7050, 5539, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 5539, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
