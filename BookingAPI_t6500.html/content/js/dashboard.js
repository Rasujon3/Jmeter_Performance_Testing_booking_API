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

    var data = {"OkPercent": 84.24038461538461, "KoPercent": 15.759615384615385};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7742596153846154, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8263846153846154, 500, 1500, "GetBooking after Partial Update"], "isController": false}, {"data": [0.8348461538461538, 500, 1500, "GetBooking after Update"], "isController": false}, {"data": [0.8221538461538461, 500, 1500, "PartialUpdateBooking"], "isController": false}, {"data": [0.37753846153846154, 500, 1500, "Auth"], "isController": false}, {"data": [0.8426153846153847, 500, 1500, "Create Booking"], "isController": false}, {"data": [0.8408461538461538, 500, 1500, "GetBooking"], "isController": false}, {"data": [0.8255384615384616, 500, 1500, "UpdateBooking "], "isController": false}, {"data": [0.8241538461538461, 500, 1500, "DeleteBooking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 52000, 8195, 15.759615384615385, 483.06698076923266, 0, 12398, 282.0, 1051.0, 1117.0, 7126.950000000008, 363.5728019576997, 227.8456222142108, 89.29798795009613], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetBooking after Partial Update", 6500, 1055, 16.23076923076923, 277.4993846153847, 0, 12398, 271.0, 302.0, 335.9499999999998, 923.9899999999998, 49.626654858067766, 32.440972613244206, 7.847393741697078], "isController": false}, {"data": ["GetBooking after Update", 6500, 1023, 15.738461538461538, 267.37369230769207, 0, 10562, 271.0, 306.0, 385.0, 916.9899999999998, 49.82866604828014, 32.6120758694144, 7.8793374895551445], "isController": false}, {"data": ["PartialUpdateBooking", 6500, 1050, 16.153846153846153, 277.6944615384614, 0, 11797, 276.0, 328.0, 381.9499999999998, 1015.9799999999996, 49.72764551074117, 32.5125935859944, 13.139275181314646], "isController": false}, {"data": ["Auth", 6500, 983, 15.123076923076923, 1933.153538461542, 0, 11807, 1079.0, 5123.500000000003, 7568.849999999999, 10216.849999999997, 46.048343676499755, 24.68768209020516, 9.92377781497067], "isController": false}, {"data": ["Create Booking", 6500, 983, 15.123076923076923, 300.63307692307666, 0, 10025, 272.0, 307.0, 371.9499999999998, 3910.9699999999993, 50.07009813739235, 34.26186384495986, 19.173883701605323], "isController": false}, {"data": ["GetBooking", 6500, 1001, 15.4, 264.9603076923076, 0, 10266, 271.0, 305.0, 354.9499999999998, 617.8899999999976, 50.00115387278168, 32.961442740024765, 7.90661274875574], "isController": false}, {"data": ["UpdateBooking ", 6500, 1022, 15.723076923076922, 276.5220000000001, 0, 8274, 278.0, 338.0, 430.0, 815.0, 49.92434541502492, 32.68927777473751, 20.55335646414664], "isController": false}, {"data": ["DeleteBooking", 6500, 1078, 16.584615384615386, 266.6993846153841, 0, 9268, 275.0, 317.0, 339.0, 881.9899999999998, 49.5207911136845, 25.60664605919258, 10.703916023213822], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 7864, 95.96095179987798, 15.123076923076923], "isController": false}, {"data": ["503/Service Unavailable", 1, 0.012202562538133009, 0.0019230769230769232], "isController": false}, {"data": ["403/Forbidden", 200, 2.4405125076266017, 0.38461538461538464], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 1, 0.012202562538133009, 0.0019230769230769232], "isController": false}, {"data": ["404/Not Found", 129, 1.5741305674191581, 0.24807692307692308], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 52000, 8195, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 7864, "403/Forbidden", 200, "404/Not Found", 129, "503/Service Unavailable", 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GetBooking after Partial Update", 6500, 1055, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 983, "404/Not Found", 72, "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking after Update", 6500, 1023, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 983, "404/Not Found", 40, "", "", "", "", "", ""], "isController": false}, {"data": ["PartialUpdateBooking", 6500, 1050, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 983, "403/Forbidden", 67, "", "", "", "", "", ""], "isController": false}, {"data": ["Auth", 6500, 983, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 983, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Create Booking", 6500, 983, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 983, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking", 6500, 1001, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 983, "404/Not Found", 17, "503/Service Unavailable", 1, "", "", "", ""], "isController": false}, {"data": ["UpdateBooking ", 6500, 1022, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 983, "403/Forbidden", 38, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 1, "", "", "", ""], "isController": false}, {"data": ["DeleteBooking", 6500, 1078, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 983, "403/Forbidden", 95, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
