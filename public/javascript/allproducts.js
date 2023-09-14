
const filter = document.querySelectorAll(".filter");

filter.forEach((label) => {
  const input = label.querySelector('input[type="radio"]');

  input.addEventListener("change", () => {
    filter.forEach((otherLabel) => {
      otherLabel.style.borderColor = "#bdbdbdda"; // Reset border color for all labels
    });

    if (input.checked) {
      label.style.borderColor = "#000"; // Set border color for the selected label
    } else {
      label.style.borderColor = "#bdbdbdda"; // Reset border color if radio is not checked
    }
  });
});






        const openFilterButton = document.getElementById("open-filter");
        const filterSection = document.querySelector(".filter-section");

        // Add click event listener to the "Open Filter" button
        openFilterButton.addEventListener("click", function () {
          // Toggle the visibility of the filter section
          if (filterSection.style.display === "none") {
            filterSection.style.display = "block";
          } else {
            filterSection.style.display = "none";
          }
        });

        

        const applyFilterButton = document.getElementById("apply-filter");
        applyFilterButton.addEventListener("click", () => {
          // Get selected category values
          const selectedMaleCategory =
            document.getElementById("maleCategory").value;
          const selectedFemaleCategory =
            document.getElementById("femaleCategory").value;

          // Get selected price range values
          const minPrice = document.querySelector('input[name="min-price"]').value;
          const maxPrice = document.querySelector('input[name="max-price"]').value;

          // Construct the URL with query parameters
          const queryParams = new URLSearchParams();
          queryParams.append("maleCategory", selectedMaleCategory);
          queryParams.append("femaleCategory", selectedFemaleCategory);
          queryParams.append("minPrice", minPrice);
          queryParams.append("maxPrice", maxPrice);

          const queryString = queryParams.toString();
          const url = `/products?${queryString}`; // Change the URL according to your endpoint

          // Redirect or make an API request using the constructed URL
          window.location.href = url; // Redirect to the filtered page
          // Alternatively, make an AJAX request using fetch or another library
        });





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
     
        
        const menuOpenBtn = document.querySelector("#menu-btn");
        const menu = document.querySelector("#menubar");
        const menuclosebtn = document.querySelector("#menuclose_btn");
        const overlay = document.getElementById("overlay_menu");
        const add_cart = document.getElementById("add_cart");

        menuOpenBtn.addEventListener("click", openMenu);
        menuclosebtn.addEventListener("click", closeMenu);
        overlay.addEventListener("click", closeMenu);
        add_cart.addEventListener("click", openMenu);

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


        function updateQuantity(productId, action) {
            fetch("/update-quantity", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: productId,
              action: action,
            }),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse the response body as JSON
          })
          .then(data => {
            // This is the data received from the server
            // Access 'success' and 'quantity' properties from 'data'
            const { success, quantity, total } = data;
            console.log(data); // 'true' if the request was successful
            const quantityElement = document.querySelector(`.quantity[data-product-id="${productId}"]`);
              quantityElement.textContent = quantity;
          
              // Update price
              const priceElement = document.querySelector(`.priceForQty[data-product="${productId}"]`);
              priceElement.textContent = `₹ ${total}/-`;
            // document.getElementById('singleprdprice').innerHTML=`₹ ${quantity*singleprd}`
            let updatedTotalAmount = 0;
          const prdsTotal = document.getElementsByClassName("priceForQty");
          
          for (let i = 0; i < prdsTotal.length; i++) {
            const priceText = prdsTotal[i].textContent;
            const price = parseFloat(priceText.replace("₹", "").replace("/-", ""));
            updatedTotalAmount += price;
          }
          
          const totalCartElement = document.getElementById('totalCart');
          totalCartElement.textContent = `₹ ${updatedTotalAmount.toFixed()}/-`;
                          // $("#totalCart").text("₹" + updatedTotalAmount.toFixed(2) + "/-");
           
          })
          .catch(error => {
            console.error('Error:', error);
          });
          }
          
          //     if (!response.ok) {
          //       throw new Error(`HTTP error! status: ${response.status}`);
          //     }
          
          //     const data = await response.json();
          
              
          //     if (data.success) {
          //       const quantityElement = document.querySelector(`.quantity[data-product-id="${productId}"]`);
          //       quantityElement.textContent = data.quantity;
               
          //     }
          //   } catch (error) {
          //     console.error("Error updating quantity:", error);
          //   }
          // }
          
          // Plus button click event
          function increaseQuantity(productId) {
            updateQuantity(productId, "increase");
          }
          
          // Minus button click event
          function decreaseQuantity(productId) {
            updateQuantity(productId, "decrease");
          }
          
          
          
          // document.getElementById('searchButton').addEventListener('click', function() {
          //     const searchValue = document.getElementById('searchInput').value;
          //     const searchUrl = `/allproducts?searchTerm=${encodeURIComponent(searchValue)}`;
          //     window.location.href = searchUrl;
          // });
          
          document.getElementById('searchButton').addEventListener('click', function() {
              const searchValue = document.getElementById('searchInput').value;
          
              // Determine the current page or route
              const currentPage = window.location.pathname; // Get the current page's URL
          
              // Define the search route based on the current page
              let searchRoute = '/allproducts'; // Default route
          
              if (currentPage.includes('/allproducts')) {
                  searchRoute = '/allproducts';
              } else if (currentPage.includes('/myorders')) {
                  searchRoute = '/myorders';
              } // Add more conditions as needed for other pages
          
              const searchUrl = `${searchRoute}?searchTerm=${encodeURIComponent(searchValue)}`;
              window.location.href = searchUrl;
          });
          