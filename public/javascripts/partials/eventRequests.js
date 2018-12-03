$(document).ready(() => {

  $('.productRequestTable tr').click(function(event) {

    if (event.target.type !== 'checkbox') {
      $(':checkbox', this).trigger('click');
    }
  });

  $("input[type='checkbox']").change(function(e) {
    if ($(this).is(":checked")) {
      $(this).closest('tr').addClass("highlight");
    } else {
      $(this).closest('tr').removeClass("highlight");
    }
  });


  $('#eventSelection').change(() => {
    var eventId = $('#eventSelection option:selected').val();
    $.ajax({
      url: '/admin/getEvent/' + eventId,
      type: 'GET',
      contentType: 'application/json',
      success: (data) => {
        $('#eventsTable').html(data);

        $('body').find('script').each(function(i) {
          // console.log(i);
          console.log($(this));
          eval($(this).text());

        });
      }
    })
  });
});
