



function confirmOrder() {
  $.ajax({
    url: "/confirm-order",
    method: "POST",
    data: $('#checkoutForm').serialize(),
    success: function (res) {
      if (res.codSuccess) {
        $('#myModal').modal('show');

      }else if (res.razorSuccess) {
        const order = {
          "key": "" + res.key_id + "",
          "amount": "" + res.amount + "",
          "currency": "INR",
          "name": "" + res.name + "",
          "prefill": {
            "contact": "" + res.contact + "",
            "name": "" + res.name + "",
            "email": "" + res.email + ""
          },
          "handler": function (response) {
            // alert("paymentDone")
            verifypayment()

          },

        }

        const razorpay = new Razorpay(order);

        const done = razorpay.open();

      }else if(res.walletSuccess){
        console.log(res)
        $('#myModal').modal('show');
      } else {
        window.location.href = `/checkout`
      }
    },
    error: function (err) {
      console.log(err);
    }
  })
}

function verifypayment() {
  $.ajax({
    url: "/verify-payment",
    method: "POST",
    success: () => {
      // window.location.href = "/myorders?ordersuccess=true"
      $('#myModal').modal('show');
    }
  })
}


///////////////////////////////////////



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




//////////////////////////////////////////////////


document.addEventListener('DOMContentLoaded', function() {
    const walletCheckbox = document.getElementById('wallet');
    const totalElement = document.getElementById('Total');
    const totalAmountInput = document.getElementById('totalamount');
    const applyCoupon = document.getElementById('applyCouponBtn');
    const walletAmount = parseFloat(walletCheckbox.value);
    const previousamount = document.getElementById('prevTotal').value
    const discount = document.getElementById('discount');
    const walletAlert= document.getElementById('walletalert')
  
  
    walletCheckbox.addEventListener('change', function() {
      const isChecked = this.checked;
      const total = parseFloat(totalElement.innerText.split('₹')[1]);
  
      let remainingAmount = Math.max(0, previousamount - walletAmount);
      if (isChecked) {

        if(walletAmount>=previousamount){
          walletAlert.innerHTML=`<b>Wallet: ₹ -${previousamount}<b>`
        }else{
          walletAlert.innerHTML=`<b>Wallet: ₹ -${walletAmount}<b>`
        }
       
       
        totalElement.innerHTML = `<b>Total: ₹ ${remainingAmount}<b>`;
        totalAmountInput.value = remainingAmount;
        applyCoupon.disabled = true;
        
    discount.innerHTML=" ";
    document.getElementById('alert_tag').innerHTML=""
        
      } else {
        totalElement.innerHTML = `<b>Total: ₹ ${previousamount}<b>`;
        totalAmountInput.value = previousamount;
        walletAlert.innerHTML=""
        applyCoupon.disabled = false; // Enable coupon button
        
      }
    });
  });

  

  /////////////////////////////////////////////////////////////



  const addressRadios = document.querySelectorAll('input[name="selectedAddress"]');
  const confirmBtn = document.getElementById('confirmBtn');

  addressRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      // Reset border color for all labels
      addressRadios.forEach(otherRadio => {
        const label = otherRadio.parentElement;
        label.style.borderColor = '#7777';
      });

      // Set border color for the selected label
      if (radio.checked) {
        const label = radio.parentElement;
        label.style.borderColor = '#2e8d6d';
        confirmBtn.disabled = false; // Enable the button when an address is selected
      } else {
        confirmBtn.disabled = true; // Disable the button if no address is selected
      }
    });
  });




/////////////////////////////////////////////////////   




  const openBtn = document.querySelector("#cart-btn");
  const cart = document.querySelector("#sidecart");
  const closeBtn = document.querySelector("#close_btn");
  const overlaycart = document.getElementById("overlay_cart");

  // overlaycart.addEventListener('click',closeCart)
  openBtn.addEventListener("click", openCart);
  closeBtn.addEventListener("click", closeCart);

  function openCart() {
    cart.classList.add("open");
    overlaycart.style.display = "block";
    document.body.classList.add("no-scroll");
  }

  function closeCart() {
    cart.classList.remove("open");
    overlaycart.style.display = "none";
    document.body.classList.remove("no-scroll");
  }


/////////////////////////////////////////////////////////////



  const menuOpenBtn = document.querySelector("#menu-btn");
  const menu = document.querySelector("#menubar");
  const menuclosebtn = document.querySelector("#menuclose_btn");
  const overlay = document.getElementById("overlay_menu");
  const add_cart = document.getElementById('add_cart')


  menuOpenBtn.addEventListener("click", openMenu);
  menuclosebtn.addEventListener("click", closeMenu);
  overlay.addEventListener('click', closeMenu)
  add_cart.addEventListener('click', openMenu)


  function openMenu() {
    menu.classList.add("open");
    overlay.style.display = "block"; // Show the overlay
    document.body.classList.add("no-scroll");
  }

  function closeMenu() {
    menu.classList.remove("open");
    overlay.style.display = "none"; // Hide the overlay
    document.body.classList.remove("no-scroll");
  }



//////////////////////////////////////////////////////



