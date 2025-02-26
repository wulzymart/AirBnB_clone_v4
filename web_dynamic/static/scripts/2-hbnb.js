$('document').ready(() => {
  const amenities = {};
  function truncate (str, n) {
    return (str.length > n) ? str.slice(0, n - 1) + '...' : str;
  }
  $('li input[type=checkbox]').change(function () {
    if (this.checked) amenities[this.dataset.id] = this.dataset.name;
    else delete amenities[this.dataset.id];
    let text = Object.values(amenities).sort().join(', ');
    text = truncate(text, 38);
    $('.amenities h4').text(text);
  });
  $.getJSON('http://0.0.0.0:5001/api/v1/status/', (data) => {
    if (data.status === 'OK') $('#api_status').addClass('available');
    else $('#api_status').removeClass('available');
  });
  $('#api_status');
});
