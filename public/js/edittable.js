var editor;
var data;
$(document).ready(function() {
  editor = new $.fn.dataTable.Editor({
    ajax: "http://localhost:3000/editable/edit",
    table: "#example",
    idSrc: "id",
    fields: [
      {
        label: "Full Name",
        name: "username"
      },
      {
        label: "Email",
        name: "email"
      },
      {
        label: "Contact",
        name: "contact"
      },
      {
        label: "Image",
        name: "img",
        type: "upload",
        // display: function(file_id) {
        //   console.log(file_id);
        //   return (
        //     '<img src="http://localhost:3000/users/image/' + file_id + '"/>'
        //   );
        // },
        def: "Image",
        dragDrop: false,
        uploadText: false,
        clearText: false,
        contentType: false,
        processData: false
      }
    ]
  });
  editor.on("postSubmit", function(e, json, data) {
    t.destroy();
    printTable();
  });
  // $("form#target").submit(function(e) {
  //   e.preventDefault();
  //   var formData = new FormData(this);
  //   console.log(formData);
  //   $.ajax({
  //     url: "http://localhost:3000/editable/edit",
  //     type: "POST",
  //     data: formData,
  //     success: function(data) {
  //       t.destroy();
  //       printTable();
  //     },
  //     cache: false,
  //     contentType: false,
  //     processData: false
  //   });
  // });
  $("#example").on("click", "tbody td:not(:first-child)", function(e) {
    data = t.row(this).data();
    console.log(data._id);

    var url = "http://localhost:3000/editable/edit1?id=" + data.id;
    var ourRequest = new XMLHttpRequest();
    ourRequest.open("POST", url, true);
    ourRequest.onload = function() {
      var ourData = JSON.parse(ourRequest.responseText);
      console.log(ourData);
    };

    ourRequest.send();

    // $.ajax({
    //   url: "http://localhost:3000/editable/edit1?id=" + data.id,
    //   type: "POST",
    //   data: data,
    //   success: function(data) {
    //     t.destroy();
    //     printTable();
    //   },
    //   cache: false,
    //   contentType: false,
    //   processData: false
    // });
    editor.inline(this, {
      submitOnBlur: true
    });
  });
  printTable();
});
function printTable() {
  t = $("#example").DataTable({
    paging: true,
    pageLength: 10,
    processing: true,
    serverSide: true,
    ajax: {
      type: "POST",
      url: "http://localhost:3000/editable"
    },
    columns: [
      {
        data: null,
        defaultContent: "",
        className: "select-checkbox",
        orderable: false
      },
      { data: "username", defaultContent: "", name: "Full Name" },
      {
        data: "email",
        defaultContent: "",
        name: "Email"

        // render: function(data, type, row, meta) {
        //   if (type === "display") {
        //     data = '<a href="' + data + '">' + data + "</a>";
        //   }
        //   return data;
        // }
      },
      { data: "contact", defaultContent: "N", name: "Contact" },
      {
        data: "img",
        name: "Image",
        render: function(data, type, row) {
          data =
            "<img src='http://localhost:3000/users/image/" +
            data +
            "' height='35' width='100' /> ";
          return data;
        }
      }
    ],
    columnDefs: [
      {
        searchable: false,
        orderable: false,
        targets: 0
      }
    ],
    order: [1, "asc"],
    select: {
      style: "os",
      selector: "td:first-child"
    },
    buttons: [
      { extend: "create", editor: editor },
      { extend: "edit", editor: editor },
      { extend: "remove", editor: editor }
    ],
    tableTools: {
      sRowSelect: "os",
      aButtons: [
        { sExtends: "editor_create", editor: editor },
        { sExtends: "editor_edit", editor: editor },
        { sExtends: "editor_remove", editor: editor }
      ]
    }
  });
  t.columns.adjust().draw();
}
