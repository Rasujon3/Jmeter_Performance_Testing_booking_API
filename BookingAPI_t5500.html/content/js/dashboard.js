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

    var data = {"OkPercent": 83.74545454545455, "KoPercent": 16.254545454545454};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7820568181818182, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8358181818181818, 500, 1500, "GetBooking after Partial Update"], "isController": false}, {"data": [0.8361818181818181, 500, 1500, "GetBooking after Update"], "isController": false}, {"data": [0.8347272727272728, 500, 1500, "PartialUpdateBooking"], "isController": false}, {"data": [0.4071818181818182, 500, 1500, "Auth"], "isController": false}, {"data": [0.8355454545454546, 500, 1500, "Create Booking"], "isController": false}, {"data": [0.8360909090909091, 500, 1500, "GetBooking"], "isController": false}, {"data": [0.8346363636363636, 500, 1500, "UpdateBooking "], "isController": false}, {"data": [0.8362727272727273, 500, 1500, "DeleteBooking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 44000, 7152, 16.254545454545454, 428.56524999999743, 0, 11574, 262.0, 1035.0, 1123.0, 8558.840000000026, 413.3240648543033, 267.1549943960537, 99.93964162337724], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetBooking after Partial Update", 5500, 894, 16.254545454545454, 227.03399999999962, 0, 900, 265.0, 285.0, 292.0, 322.9899999999998, 53.82236661838964, 36.285525820057146, 8.357747714384272], "isController": false}, {"data": ["GetBooking after Update", 5500, 894, 16.254545454545454, 226.908, 0, 1433, 264.0, 285.0, 292.9499999999998, 324.0, 53.547262761286305, 36.10005853689407, 8.315028510874964], "isController": false}, {"data": ["PartialUpdateBooking", 5500, 894, 16.254545454545454, 229.7327272727264, 0, 977, 266.0, 287.0, 296.0, 343.97999999999956, 53.68629632883345, 36.19379105781526, 13.956597298481165], "isController": false}, {"data": ["Auth", 5500, 894, 16.254545454545454, 1719.8850909090913, 0, 11574, 1075.0, 3306.5000000000136, 7547.499999999998, 10676.829999999996, 51.66647878856198, 28.749276375737423, 10.986098781610492], "isController": false}, {"data": ["Create Booking", 5500, 894, 16.254545454545454, 329.38563636363506, 0, 1630, 270.0, 371.0, 1021.7499999999991, 1443.9799999999996, 53.112898708873715, 37.27860635073344, 20.06796187700984], "isController": false}, {"data": ["GetBooking", 5500, 894, 16.254545454545454, 226.98290909090906, 0, 994, 264.0, 284.0, 292.0, 322.9899999999998, 53.264122255687155, 36.12697727922021, 8.271061345136985], "isController": false}, {"data": ["UpdateBooking ", 5500, 894, 16.254545454545454, 240.9525454545459, 0, 1560, 267.0, 290.0, 301.0, 470.85999999999694, 53.40946609955524, 36.0071599030861, 21.659615327424305], "isController": false}, {"data": ["DeleteBooking", 5500, 894, 16.254545454545454, 227.6410909090907, 0, 900, 266.0, 286.0, 296.0, 324.9899999999998, 53.96124601422615, 29.009286086583273, 11.468479810522444], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 7152, 100.0, 16.254545454545454], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 44000, 7152, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 7152, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GetBooking after Partial Update", 5500, 894, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 894, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking after Update", 5500, 894, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 894, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PartialUpdateBooking", 5500, 894, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 894, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Auth", 5500, 894, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 894, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Create Booking", 5500, 894, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 894, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking", 5500, 894, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 894, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["UpdateBooking ", 5500, 894, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 894, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["DeleteBooking", 5500, 894, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 894, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
