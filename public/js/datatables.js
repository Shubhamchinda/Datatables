// //$.fn.poshytip = { defaults: null };
// //$.fn.editable.defaults.mode = 'inline';

// $(document).ready(function() {
//   t = null;

//   printTable();
//   /* t.on('draw', function () {
//                  //setting the next and prev buttons with active or disabled state
//                  //setting the index column with values.
//                  t.column(0, { search: 'applied', order: 'applied' }).nodes().each(
//                      function (cell, i) {
//                          cell.innerHTML = i + 1;
//                      }
//                  );
//              });
//              */
//   //paging
//   /* $('#next').on('click', function () {
//                  t.page('next').draw('page');
//              });
//              $('#previous').on('click', function () {
//                  t.page('previous').draw('page');
//              });
//          */
//   //$('#table_id  ').DataTable();
// });
// function printTable() {
//   t = $("#table_id").DataTable({
//     paging: true,
//     pageLength: 10,
//     processing: true,
//     serverSide: true,
//     ajax: {
//       type: "POST",
//       url: "http://localhost:3000/table"
//     },
//     columns: [
//       { data: "username", defaultContent: "", name: "Full Name" },
//       {
//         data: "email",
//         defaultContent: "",
//         name: "Email"
//         // render: function(data, type, row, meta) {
//         //   if (type === "display") {
//         //     data = '<a href="' + data + '">' + data + "</a>";
//         //   }
//         //   return data;
//         // }
//       },
//       { data: "contact", defaultContent: "N", name: "Contact" }
//     ],
//     columnDefs: [
//       {
//         searchable: false,
//         orderable: false,
//         targets: 0
//       }
//     ]
//   });
// }
