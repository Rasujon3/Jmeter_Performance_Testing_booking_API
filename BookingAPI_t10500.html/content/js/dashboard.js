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

    var data = {"OkPercent": 84.44761904761904, "KoPercent": 15.552380952380952};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6055357142857143, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7008571428571428, 500, 1500, "GetBooking after Partial Update"], "isController": false}, {"data": [0.6940952380952381, 500, 1500, "GetBooking after Update"], "isController": false}, {"data": [0.5951904761904762, 500, 1500, "PartialUpdateBooking"], "isController": false}, {"data": [0.2791904761904762, 500, 1500, "Auth"], "isController": false}, {"data": [0.6924285714285714, 500, 1500, "Create Booking"], "isController": false}, {"data": [0.6961428571428572, 500, 1500, "GetBooking"], "isController": false}, {"data": [0.5854761904761905, 500, 1500, "UpdateBooking "], "isController": false}, {"data": [0.6009047619047619, 500, 1500, "DeleteBooking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 84000, 13064, 15.552380952380952, 667.3702738095174, 0, 99499, 1.0, 999.9000000000015, 1819.800000000003, 8097.780000000035, 509.91914139329333, 323.5788849464585, 124.5223420654457], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetBooking after Partial Update", 10500, 1633, 15.552380952380952, 418.2630476190479, 0, 5348, 396.0, 690.0, 943.9499999999989, 1376.9199999999983, 65.81669111286622, 43.60724291138566, 10.339133723062169], "isController": false}, {"data": ["GetBooking after Update", 10500, 1633, 15.552380952380952, 426.70180952380986, 0, 6330, 401.0, 692.0, 997.0, 1475.0, 65.86045111272801, 43.63623636139825, 10.346007974602955], "isController": false}, {"data": ["PartialUpdateBooking", 10500, 1633, 15.552380952380952, 541.1348571428565, 0, 7477, 485.0, 982.0, 1175.0, 1707.9399999999987, 65.82081693036784, 43.609976496483284, 17.287795939012312], "isController": false}, {"data": ["Auth", 10500, 1633, 15.552380952380952, 2000.267333333329, 0, 99499, 1241.0, 3917.7999999999993, 5925.799999999996, 10366.889999999998, 64.63527239150507, 35.14993796168052, 13.858951792859342], "isController": false}, {"data": ["Create Booking", 10500, 1633, 15.552380952380952, 440.60295238095114, 0, 4486, 402.5, 690.0, 1096.8999999999978, 1498.9799999999996, 65.86292983402542, 45.510965981796744, 25.094033543833348], "isController": false}, {"data": ["GetBooking", 10500, 1633, 15.552380952380952, 427.3945714285729, 0, 3846, 401.0, 688.0, 1071.949999999999, 1437.9899999999998, 65.85838565416194, 43.90642959150552, 10.34568351203954], "isController": false}, {"data": ["UpdateBooking ", 10500, 1633, 15.552380952380952, 554.5323809523804, 0, 7833, 500.0, 1014.8999999999996, 1193.0, 1728.909999999998, 65.8443439708529, 43.62556447807383, 26.95951101952128], "isController": false}, {"data": ["DeleteBooking", 10500, 1633, 15.552380952380952, 530.0652380952389, 0, 3411, 480.0, 982.0, 1147.0, 1634.9799999999996, 65.76186688545535, 34.51405038494178, 14.12681354005524], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 13064, 100.0, 15.552380952380952], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 84000, 13064, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 13064, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GetBooking after Partial Update", 10500, 1633, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1633, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking after Update", 10500, 1633, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1633, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PartialUpdateBooking", 10500, 1633, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1633, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Auth", 10500, 1633, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1633, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Create Booking", 10500, 1633, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1633, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking", 10500, 1633, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1633, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["UpdateBooking ", 10500, 1633, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1633, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["DeleteBooking", 10500, 1633, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1633, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
