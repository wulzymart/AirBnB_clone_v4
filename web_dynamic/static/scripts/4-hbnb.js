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
  $.getJSON('http://localhost:5001/api/v1/status/', (data) => {
    if (data.status === 'OK') $('#api_status').addClass('available');
    else $('#api_status').removeClass('available');
  });

  const getPlaces = (searchParams = {}) => {
    function compareByName (a, b) {
      return a.name.localeCompare(b.name);
    }
    $.post({
      url: 'http://localhost:5001/api/v1/places_search/',
      data: JSON.stringify(searchParams),
      headers: {
        'Content-Type': 'application/json'
      },
      success: (data) => {
        data = data.sort(compareByName);
        $('section.places').empty();
        for (const place of data) {
          $('section.places').append(`<article>
	  <div class="title_box">
	    <h2>${place.name}</h2>
	    <div class="price_by_night">$${place.price_by_night}</div>
	  </div>
	  <div class="information">
	    <div class="max_guest">${place.max_guest} Guest${place.max_guest != 1 ? 's' : ''}</div>
            <div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms != 1 ? 's' : ''}</div>
            <div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms != 1 ? 's' : ''}</div>
	  </div>
	  <div class="user">
          </div>
          <div class="description">
	    ${place.description}
          </div>
	</article>
`);
        }
      }
    }, 'json');
  };
  getPlaces();
  $('.filters button').click(function () {
    console.log(this);
    const params = {
      amenities: Object.keys(amenities)
    };
    getPlaces(params);
  });
});
