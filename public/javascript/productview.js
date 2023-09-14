document.addEventListener('DOMContentLoaded', function() {
    const sizeInputs = document.querySelectorAll('input[name="size"]');
    const addToCartButton = document.getElementById('addToCartButton');

    sizeInputs.forEach(function(sizeInput) {
        sizeInput.addEventListener('change', function() {
            if (this.checked) {
                addToCartButton.removeAttribute('disabled');
            }
        });
    });
});



const sizeLabels = document.querySelectorAll('.size-label');

sizeLabels.forEach(label => {
  const input = label.querySelector('input[type="radio"]');

  input.addEventListener('change', () => {
    sizeLabels.forEach(otherLabel => {
      otherLabel.style.borderColor = '#bdbdbdda'; // Reset border color for all labels
    });

    if (input.checked) {
      label.style.borderColor = '#000'; // Set border color for the selected label
    } else {
      label.style.borderColor = '#bdbdbdda'; // Reset border color if radio is not checked
    }
  });
});

const colorLabel = document.querySelector('.color-label');
const inputcolor = colorLabel.querySelector('input[type="radio"]');

inputcolor.addEventListener('change', () => {
  if (inputcolor.checked) {
    colorLabel.style.borderColor = '#000'; // Set border color for the selected label
  } else {
    colorLabel.style.borderColor = '#bdbdbdda'; // Reset border color if radio is not checked
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const semiImageContainer = document.querySelector(".semi-image-container");
  const mainImage = document.querySelector(".main-image");

  // Set the initial source of the main image to the first thumbnail image
  const firstThumbnail = semiImageContainer.querySelector(".semi-image");
  if (firstThumbnail) {
    const firstImageURL = firstThumbnail.getAttribute("src");
    showMainImage(firstImageURL);
  }

  semiImageContainer.addEventListener("click", function (event) {
    const clickedImage = event.target;
    if (clickedImage.classList.contains("semi-image")) {
      const imageURL = clickedImage.getAttribute("src");
      showMainImage(imageURL);
    }
  });

  function showMainImage(imageURL) {
    mainImage.setAttribute("src", imageURL);
  }
});








        function addtowish(productId){
           

            
          fetch(`/add-to-wishlist/${productId}`,{
            method:'POST',
          }).then(response=>
            window.location.reload()).then(data=>{
              window.location.reload()
            }).catch(error=>{
              console.error("Error adding product to wishlist:", error)
            })

        }






        function addtocart(productId) {
  
            const selectedSizeInput = document.querySelector('input[name="size"]:checked');
            const selectedSize = selectedSizeInput ? selectedSizeInput.value : null;
            const selectedcolorinput=document.querySelector('input[name="color"]');
            const selectedcolor =selectedcolorinput? selectedcolorinput.value:null;
            const price = document.getElementById('price').value
          
            const data = {
              productId: productId,
              size: selectedSize,
              color:selectedcolor,
              price:price
            };
                    fetch(`/add-to-cart/${productId}`, {
                      method: 'POST',
                      headers: {
                'Content-Type': 'application/json', // Set the content type to JSON
              },
              body: JSON.stringify(data), 
                    })
                      .then(response => window.location.reload())
                      .then(data => {
                        window.location.reload()
                      })
                      .catch(error => {
                        console.error('Error adding product to cart:', error);
                      });
                  }
          
          