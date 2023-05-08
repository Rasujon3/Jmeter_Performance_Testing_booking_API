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

    var data = {"OkPercent": 77.95031055900621, "KoPercent": 22.049689440993788};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6586024844720497, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7175776397515528, 500, 1500, "GetBooking after Partial Update"], "isController": false}, {"data": [0.7161490683229814, 500, 1500, "GetBooking after Update"], "isController": false}, {"data": [0.6918012422360248, 500, 1500, "PartialUpdateBooking"], "isController": false}, {"data": [0.31515527950310557, 500, 1500, "Auth"], "isController": false}, {"data": [0.7211180124223603, 500, 1500, "Create Booking"], "isController": false}, {"data": [0.7172670807453416, 500, 1500, "GetBooking"], "isController": false}, {"data": [0.6924844720496894, 500, 1500, "UpdateBooking "], "isController": false}, {"data": [0.6972670807453416, 500, 1500, "DeleteBooking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 64400, 14200, 22.049689440993788, 553.5943788819869, 0, 19451, 319.0, 1050.0, 1101.0, 1169.0, 510.69768917225736, 380.0772855258045, 115.1892881110133], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetBooking after Partial Update", 8050, 1775, 22.049689440993788, 307.1781366459636, 0, 8764, 294.0, 690.9000000000005, 864.0, 1011.4499999999989, 66.25732534404425, 51.02084122111016, 9.620011924260881], "isController": false}, {"data": ["GetBooking after Update", 8050, 1775, 22.049689440993788, 308.0160248447212, 0, 4957, 296.0, 680.0, 871.4499999999998, 1009.4299999999985, 66.2513270840363, 51.01622231640975, 9.61914102685442], "isController": false}, {"data": ["PartialUpdateBooking", 8050, 1775, 22.049689440993788, 379.51602484472204, 0, 3820, 312.0, 952.0, 1286.8999999999996, 1578.0, 66.25841605346766, 51.02168111182445, 16.07625042183153], "isController": false}, {"data": ["Auth", 8050, 1775, 22.049689440993788, 1955.2814906832266, 0, 19451, 1110.0, 4722.900000000001, 7586.049999999998, 10821.899999999998, 64.9502585907811, 42.89619783808425, 12.855001321193148], "isController": false}, {"data": ["Create Booking", 8050, 1775, 22.049689440993788, 408.30770186335354, 0, 5572, 308.0, 889.0, 1092.8999999999996, 1511.0, 66.31627508485188, 52.81958729446074, 23.32276267526444], "isController": false}, {"data": ["GetBooking", 8050, 1775, 22.049689440993788, 307.1228571428569, 0, 6227, 294.0, 644.8000000000011, 857.0, 1088.449999999999, 66.27041622760801, 51.28315804002157, 9.62191261154834], "isController": false}, {"data": ["UpdateBooking ", 8050, 1775, 22.049689440993788, 392.3275776397506, 0, 10626, 317.0, 988.9000000000005, 1279.3499999999995, 1572.0, 66.25405343121923, 51.01832171486889, 25.052587225930438], "isController": false}, {"data": ["DeleteBooking", 8050, 1775, 22.049689440993788, 371.0052173913051, 0, 5619, 308.0, 856.0, 1238.4499999999998, 1561.0, 66.24478476616825, 42.58975030396481, 13.148133599478271], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 14200, 100.0, 22.049689440993788], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 64400, 14200, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 14200, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GetBooking after Partial Update", 8050, 1775, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1775, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking after Update", 8050, 1775, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1775, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PartialUpdateBooking", 8050, 1775, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1775, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Auth", 8050, 1775, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1775, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Create Booking", 8050, 1775, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1775, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking", 8050, 1775, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1775, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["UpdateBooking ", 8050, 1775, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1775, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["DeleteBooking", 8050, 1775, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1775, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
