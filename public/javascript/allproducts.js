const maleLabels = document.querySelectorAll('label[for^="male-subcategory"]');
const femaleLabels = document.querySelectorAll('label[for^="female-subcategory"]');

function handleCategoryChange(labels) {
  labels.forEach(label => {
    label.addEventListener('click', () => {
      const radio = label.querySelector('input[type="radio"]');
      if (!radio.checked) {
        labels.forEach(otherLabel => {
          if (otherLabel !== label) {
            const otherRadio = otherLabel.querySelector('input[type="radio"]');
            otherLabel.style.borderColor = "";
            otherRadio.checked = false;
          }
        });

        labels.forEach(label => {
          label.style.borderColor = "#bdbdbdda"; // Reset all border colors
        });

        label.style.borderColor = "#000"; // Set border color for the selected label
        radio.checked = true;

        if (labels === femaleLabels) {
          maleLabels.forEach(maleLabel => {
            maleLabel.style.borderColor = "#bdbdbdda"; // Reset border color for male labels
          });
        } else if (labels === maleLabels) {
          femaleLabels.forEach(femaleLabel => {
            femaleLabel.style.borderColor = "#bdbdbdda"; // Reset border color for female labels
          });
        }
      }
    });
  });
}

handleCategoryChange(maleLabels);
handleCategoryChange(femaleLabels);







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




///////////////////////////////////////////////////////////////////////////

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
     
    ///////////////////////////////////////////////////////////////////////////////////////
    
    
        


        
    //////////////////////////////////////////////////////////////////////////////////////////////
    
    

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
          