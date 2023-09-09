// SIDEBAR DROPDOWN
const allDropdown = document.querySelectorAll('#sidebar .side-dropdown');
const sidebar = document.getElementById('sidebar');

allDropdown.forEach(item=> {
	const a = item.parentElement.querySelector('a:first-child');
	a.addEventListener('click', function (e) {
		e.preventDefault();

		if(!this.classList.contains('active')) {
			allDropdown.forEach(i=> {
				const aLink = i.parentElement.querySelector('a:first-child');

				aLink.classList.remove('active');
				i.classList.remove('show');
			})
		}

		this.classList.toggle('active');
		item.classList.toggle('show');
	})
})






// SIDEBAR COLLAPSE
const toggleSidebar = document.querySelector('nav .toggle-sidebar');
const allSideDivider = document.querySelectorAll('#sidebar .divider');

if (sidebar.classList.contains('hide')) {
	allSideDivider.forEach(item => {
	  item.textContent = '-';
	});
	allDropdown.forEach(item => {
	  const a = item.parentElement.querySelector('a:first-child');
	  a.classList.remove('active');
	  item.classList.remove('show');
	});
  } else {
	allSideDivider.forEach(item => {
	  item.textContent = item.dataset.text;
	});
  }

toggleSidebar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');

	if(sidebar.classList.contains('hide')) {
		allSideDivider.forEach(item=> {
			item.textContent = '-'
		})

		allDropdown.forEach(item=> {
			const a = item.parentElement.querySelector('a:first-child');
			a.classList.remove('active');
			item.classList.remove('show');
		})
	} else {
		allSideDivider.forEach(item=> {
			item.textContent = item.dataset.text;
		})
	}
})




sidebar.addEventListener('mouseleave', function () {
	if(this.classList.contains('hide')) {
		allDropdown.forEach(item=> {
			const a = item.parentElement.querySelector('a:first-child');
			a.classList.remove('active');
			item.classList.remove('show');
		})
		allSideDivider.forEach(item=> {
			item.textContent = '-'
		})
	}
})



sidebar.addEventListener('mouseenter', function () {
	if(this.classList.contains('hide')) {
		allDropdown.forEach(item=> {
			const a = item.parentElement.querySelector('a:first-child');
			a.classList.remove('active');
			item.classList.remove('show');
		})
		allSideDivider.forEach(item=> {
			item.textContent = item.dataset.text;
		})
	}
})




// PROFILE DROPDOWN
const profile = document.querySelector('nav .profile');
const imgProfile = profile.querySelector('img');
const dropdownProfile = profile.querySelector('.profile-link');

imgProfile.addEventListener('click', function () {
	dropdownProfile.classList.toggle('show');
})




// MENU
const allMenu = document.querySelectorAll('main .content-data .head .menu');

allMenu.forEach(item=> {
	const icon = item.querySelector('.icon');
	const menuLink = item.querySelector('.menu-link');

	icon.addEventListener('click', function () {
		menuLink.classList.toggle('show');
	})
})



window.addEventListener('click', function (e) {
	if(e.target !== imgProfile) {
		if(e.target !== dropdownProfile) {
			if(dropdownProfile.classList.contains('show')) {
				dropdownProfile.classList.remove('show');
			}
		}
	}

	allMenu.forEach(item=> {
		const icon = item.querySelector('.icon');
		const menuLink = item.querySelector('.menu-link');

		if(e.target !== icon) {
			if(e.target !== menuLink) {
				if (menuLink.classList.contains('show')) {
					menuLink.classList.remove('show')
				}
			}
		}
	})
})







// // PROGRESSBAR
// const allProgress = document.querySelectorAll('main .card .progress');

// allProgress.forEach(item=> {
// 	item.style.setProperty('--value', item.dataset.value)
// })






// // APEXCHART
// var options = {
//   series: [{
//   name: 'series1',
//   data: [31, 40, 28, 51, 42, 109, 100]
// }, {
//   name: 'series2',
//   data: [11, 32, 45, 32, 34, 52, 41]
// }],
//   chart: {
//   height: 350,
//   type: 'area'
// },
// dataLabels: {
//   enabled: false
// },
// stroke: {
//   curve: 'smooth'
// },
// xaxis: {
//   type: 'datetime',
//   categories: ["2018-09-19T00:00:00.000Z", "2018-09-19T01:30:00.000Z", "2018-09-19T02:30:00.000Z", "2018-09-19T03:30:00.000Z", "2018-09-19T04:30:00.000Z", "2018-09-19T05:30:00.000Z", "2018-09-19T06:30:00.000Z"]
// },
// tooltip: {
//   x: {
//     format: 'dd/MM/yy HH:mm'
//   },
// },
// };

// var chart = new ApexCharts(document.querySelector("#chart"), options);
// chart.render();



//  sidebar menu------------------------------------------------------------------


const menuOpenBtn = document.querySelector('#menu-btn')
const menu = document.querySelector('#menubar')
const menuclosebtn = document.querySelector('#menuclose_btn')

menuOpenBtn.addEventListener('click', openMenu)
menuclosebtn.addEventListener("click", closeMenu)


function openMenu() {
  menu.classList.add('open')
}

function closeMenu() {
  menu.classList.remove('open')
}





/// products category//


const modal = new bootstrap.Modal(document.getElementById('exampleModalCenter'));
    modal._element.addEventListener('hidden.bs.modal', () => {
      document.getElementById("productForm").reset();
    });

    // Get each "Add Products" button by its unique ID
    const showButton1 = document.getElementById('showButton1');
    const showButton2 = document.getElementById('showButton2');

    // Add event listener to each "Add Products" button
    showButton1.addEventListener('click', () => {
      // Show the overlay when the popup is displayed
      document.querySelector('.overlay').style.display = 'block';
      document.querySelector('.popup').classList.add('active');
    });

    showButton2.addEventListener('click', () => {
      // Show the overlay when the popup is displayed
      document.querySelector('.overlay').style.display = 'block';
      document.querySelector('.popup').classList.add('active');
    });

    document.querySelector('.popup .close-btn').addEventListener('click', () => {
      // Hide the overlay when the popup is hidden
      document.querySelector('.overlay').style.display = 'none';
      document.querySelector('.popup').classList.remove('active');
    });

    function showCategory() {
      let categoryContainer = document.getElementById("categoryContainer");
      let categoryContainerFemale = document.getElementById("categoryContainerFemale");
      let maleRadioButton = document.getElementById("male");
      let femaleRadioButton = document.getElementById("female");

      if (maleRadioButton.checked) {
        categoryContainer.style.display = "block";
        categoryContainerFemale.style.display = "none";
      } else if (femaleRadioButton.checked) {
        categoryContainer.style.display = "none";
        categoryContainerFemale.style.display = "block";
      }
    }



    function stopPropagation(event) {
      event.stopPropagation();
    }


// function getQueryParams(name){
// 	const urlParams=new URLSearchParams(window.location.search);
// 	return urlParams.get(name);
// }

// window.addEventListener('load',function(){

// 	let Message

// 	if(getQueryParams){}

// 	if(message){
// 		const modal=new bootstrap.Modal(document.getElementById)
// 	}
// })


// Check if the 'ordersuccess' query parameter is present in the URL




// function getQueryParam(name) {
//     const urlParams = new URLSearchParams(window.location.search);
//     return urlParams.get(name);
// }

// // Display the alert box with the message from the 'message' query parameter
// window.addEventListener('load', function () {
//     let message
//     let adminMessage
//     if (getQueryParam('CreatedAccount')) { message = getQueryParam('CreatedAccount'); }
//     else if (getQueryParam('UserLogged')) { message = getQueryParam('UserLogged'); }
//     else if (getQueryParam('message')) { message = getQueryParam('message') }
//     else if (getQueryParam('adminMessage')) { adminMessage = getQueryParam('adminMessage') }
//     if (message) {
//         const modal = new bootstrap.Modal(document.getElementById("myModal"));
//         // const modalMessage = document.getElementById("modalMessage");
//         // modalMessage.textContent = message;
//         modal.show();
//     } else if (adminMessage) {
//         const modal = new bootstrap.Modal(document.getElementById("adminMessageModal"));
//         const modalMessage = document.getElementById("modalAdminMessage");
//         modalMessage.textContent = adminMessage;
//         modal.show();
//     }
// });


function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Check if the "ordersuccess" query parameter is set to "true"
if (getQueryParam('ordersuccess') === 'true') {
    // Open the modal when "ordersuccess" is true
    const modal = new bootstrap.Modal(document.getElementById("myModal"));
    modal.show();
}



function addAddress() {
    const formData = $('#address_item').serialize(); // Serialize the form data

    fetch('/add-address', {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", // Set the content type to URL-encoded
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response data here
        window.location.reload()
        console.log(data);
    })
    .catch(error => console.error('Error:', error));
}
