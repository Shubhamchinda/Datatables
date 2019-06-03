$(document).ready(function() {
  printTable();
  $(".center").hide();
  var table = $("#table_id").DataTable();
  $("#table_id tbody").on("click", "tr", function() {
    var data = table.row(this).data();
    var url = "http://localhost:3000/getdata?id=" + data.id;
    var ourRequest = new XMLHttpRequest();
    ourRequest.open("POST", url, true);
    ourRequest.onload = function() {
      var ourData = JSON.parse(ourRequest.responseText);
      console.log(ourData.age);

      $(".center").show();
      $("#femail").val(ourData.email);
      $("#id1").val(data.id);
      $("#fname").val(ourData.username);
      $("#fage").val(ourData.age);
      $("#faddress").val(ourData.address);
      $("#fcompany").val(ourData.company);
      $("#fcontact").val(ourData.contact);
      filename = ourData.img;
      $(".images").attr("src", "/users/image/" + filename);
      $("#imgid").val(filename);
      console.log(filename);

      // $("#formm").append(
      //   "<img src='/users/image/" + ourData.img + "' height='100' width='100'/>"
      // );
      $(".container1").show();
    };
    ourRequest.send();
    return data;
  });
  $("form#formm1").submit(function(e) {
    e.preventDefault();
    var formData = new FormData(this);
    console.log(formData);
    $.ajax({
      url: "http://localhost:3000/table/xyz",
      type: "POST",
      data: formData,
      success: function(data) {
        $(".images").attr("src", "/users/image/" + data.img);
        t.destroy();
        printTable();
      },
      cache: false,
      contentType: false,
      processData: false
    });
  });
});
function cross() {
  $(".center").hide();
  return false;
}

// var dataa = $("#formm").serializeArray();
// var data1 = JSON.stringify(dataa);

// console.log(data1);
// var url = "http://localhost:3000/table/xyz?arr=" + data1;
// console.log(url);
// var ourRequest = new XMLHttpRequest();
// ourRequest.open("POST", url, true);
// ourRequest.onload = function() {
//   var ourData2 = JSON.parse(ourRequest.responseText);
//   if (ourData2) {
//     t.destroy();
//     printTable();
//   }
//   console.log(ourData2);
// };

// ourRequest.send();

//Dtatable
//$.fn.poshytip = { defaults: null };
//$.fn.editable.defaults.mode = 'inline';

function printTable() {
  t = $("#table_id").DataTable({
    paging: true,
    pageLength: 10,
    processing: true,
    serverSide: true,
    ajax: {
      type: "POST",
      url: "http://localhost:3000/table"
    },
    columns: [
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
            "' height='35' width='100'/>";
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
    ]
  });
}
