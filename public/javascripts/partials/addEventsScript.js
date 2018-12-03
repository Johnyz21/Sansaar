  $(document).ready(() => {
    $('#eventFile').on('change', function() {
      //get the file name
      var fileName = $(this).val();
      //replace the "Choose a file" label
      $(this).next('.custom-file-label').html(fileName);
    });

    $('#eventsForm').submit(function(event) {
      event.preventDefault();

      var post_url = $(this).attr("action"); //get form action url
      var request_method = $(this).attr("method"); //get form GET/POST method
      var form_data = new FormData(this);

      $.ajax({
        url: post_url,
        type: request_method,
        data: form_data,
        contentType: false,
        cache: false,
        processData: false,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          alert(errorThrown);
          alert(textStatus)
        }
      }).done(function(response) { //
        console.log(response)
        $("#eventsForm").html(response);
        $('body').find('script').each(function(i) {
          eval($(this).text());
        });
      })
    });
  })
