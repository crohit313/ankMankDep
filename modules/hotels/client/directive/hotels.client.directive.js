// angular.module('hotels').directive('exportToCsv',function(){
//   var _this = this;
//   return {
//     restrict: 'A',
//     link: function (_this, element, attrs) {
//       var el = element[0];
//         element.bind('click', function(e){
//           var table = e.target.nextElementSibling;
//           var csvString = '';
//           for(var i=0; i<table.rows.length;i++){
//             var rowData = table.rows[i].cells;
//             for(var j=0; j<rowData.length;j++){
//               csvString = csvString + rowData[j].innerHTML + ",";
//             }
//             csvString = csvString.substring(0,csvString.length - 1);
//             csvString = csvString + "\n";
//         }
//            csvString = csvString.substring(0, csvString.length - 1);
//            var a = angular.element('<a/>', {
//               style:'display:none',
//               href:'data:application/octet-stream;base64,'+btoa(csvString),
//               download:'HotelReport.csv'
//           });
//           a.appendTo('body');
//           a[0].click();
//           a.remove();
//         });
//     }
//   };
// });
// // angular.module('hotels').factory('exportToExcel',function($window){
// //     var uri='data:application/vnd.ms-excel;base64,',
// //       template='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
// //       base64=function(s){return $window.btoa(unescape(encodeURIComponent(s)));},
// //       format=function(s,c){return s.replace(/{(\w+)}/g,function(m,p){return c[p];})};
// //       return {
// //       tableToExcel:function(tableId,worksheetName){
// //       var table=$(tableId),
// //       ctx={worksheet:worksheetName,table:table.html()},
// //       href=uri+base64(format(template,ctx));
// //       return href;
// //       }
// //       };
// // })

