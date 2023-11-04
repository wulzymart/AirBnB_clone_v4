function formatDate (date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateParts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);

  // Extract the day, month, and year
  const day = dateParts.find(part => part.type === 'day').value;
  const month = dateParts.find(part => part.type === 'month').value;
  const year = dateParts.find(part => part.type === 'year').value;

  // Add the appropriate suffix to the day (e.g., "1st", "2nd", "3rd", "4th", etc.)
  const dayWithSuffix = addDaySuffix(day);

  // Create the formatted date string
  const formattedDate = `${dayWithSuffix} ${month} ${year}`;
  return formattedDate;
}

function addDaySuffix (day) {
  if (day >= 11 && day <= 13) {
    return day + 'th';
  }
  switch (day % 10) {
    case 1:
      return day + 'st';
    case 2:
      return day + 'nd';
    case 3:
      return day + 'rd';
    default:
      return day + 'th';
  }
}

$('document').ready(() => {
  const amenities = {};
  const states = {};
  const cities = {};
  function truncate (str, n) {
    return (str.length > n) ? str.slice(0, n - 1) + '...' : str;
  }
  $('li .check-amenity').change(function () {
    if (this.checked) amenities[this.dataset.id] = this.dataset.name;
    else delete amenities[this.dataset.id];
    let text = Object.values(amenities).sort().join(', ');
    text = truncate(text, 38);
    $('.amenities h4').text(text);
  });
  $('li .check-state').change(function () {
    if (this.checked) states[this.dataset.id] = this.dataset.name;
    else delete states[this.dataset.id];
  });
  $('li .check-city').change(function () {
    if (this.checked) cities[this.dataset.id] = this.dataset.name;
    else delete cities[this.dataset.id];
  });
  $.getJSON('http://localhost:5001/api/v1/status/', (data) => {
    if (data.status === 'OK') $('#api_status').addClass('available');
    else $('#api_status').removeClass('available');
  });
  //   const getAmenities = (id) => {
  //     $.get(`http://localhost:5001/api/v1/places/${id}/amenities`, function (data) {
  //       data.forEach(amenity => {
  //         $(`#${id} ul`).append(`<li class= ${amenity.name}>${amenity.name}</li>`);
  //       });
  //     }, 'json');
  //   };

  function getReviews (id) {
    $.get(`http://0.0.0.0:5001/api/v1/places/${id}/reviews`, function (reviews) {
      reviews.forEach(review => {
        $.get(`http://0.0.0.0:5001/api/v1/users/${review.user_id}`, (user) => {
          console.log(user, review);
          $(`#${id} .reviews>ul`).append(`<li>
                            <h3>From ${user.first_name} ${user.last_name} the ${formatDate(new Date(review.created_at))}</h3>
                            <p>${review.text}</p>
                        </li>`);
        });
      });
    });
  }

  const getPlaces = async (searchParams = {}) => {
    function compareByName (a, b) {
      return a.name.localeCompare(b.name);
    }
    $.post({
      url: 'http://0.0.0.0:5001/api/v1/places_search/',
      data: JSON.stringify(searchParams),
      headers: {
        'Content-Type': 'application/json'
      },
      success: (data) => {
        data = data.sort(compareByName);
        $('section.places').empty();
        for (const place of data) {
          $('section.places').append(`<article id = ${place.id}>
	  <div class="title_box">
	    <h2>${place.name}</h2>
	    <div class="price_by_night">$${place.price_by_night}</div>
	  </div>
	  <div class="information">
	    <div class="max_guest">${place.max_guest} Guest${place.max_guest != 1 ? 's' : ''}</div>
            <div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms != 1 ? 's' : ''}</div>
            <div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms != 1 ? 's' : ''}</div>
	  </div>
	  <div class="user"><b>Owner</b>: Mary Jake</div>
          <div class="description">
	    ${place.description}
          </div>
         <div class="reviews" data-place="${place.id}">
					<h2>Reviews <span  class = "reveal" id = "span-${place.id}" data-place = ${place.id}>show</span></h2>
					<ul></ul>
			</div>
	</article>
`);
          $.get(`http://0.0.0.0:5001/api/v1/users/${place.user_id}`, (user) => {
            $(`#${place.id} div.user`).html(`<b>Owner</b>: ${user.first_name} ${user.last_name}`);
          });
          $(`#span-${place.id}`).click(function () {
            if ($(this).text() === 'show') {
              $(this).text('hide');
              getReviews(this.dataset.place);
            } else {
              $(this).text('show');
              $(`#${this.dataset.place} .reviews>ul`).empty();
            }
          });
        }
      }
    }, 'json');
  };

  getPlaces();
  $('.filters button').click(function () {
    console.log(this);
    const params = {
      states: Object.keys(states),
      cities: Object.keys(cities),
      amenities: Object.keys(amenities)
    };
    getPlaces(params);
  });
});
