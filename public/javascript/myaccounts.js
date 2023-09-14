
                
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

                menuOpenBtn.addEventListener("click", openMenu);
                menuclosebtn.addEventListener("click", closeMenu);
                overlay.addEventListener("click", closeMenu);

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
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                document.addEventListener("DOMContentLoaded", function () {
                    const addressBtn = document.getElementById("address_btn");
                    const profileSection = document.getElementById("profile");
                    const addressSection = document.getElementById("address");
                    const profileBtn = document.getElementById("profile_btn");

                    addressBtn.addEventListener("click", function (event) {
                        event.preventDefault(); // Prevent any default link behavior
                        profileSection.classList.add("hidden"); // Hide the profile section
                        addressSection.style.display = "block"; // Show the address section
                    });

                    profileBtn.addEventListener("click", function () {
                        profileSection.classList.remove("hidden"); // Show the profile section
                        addressSection.style.display = "none"; // Hide the address section
                    });
                });





                document.addEventListener("DOMContentLoaded", function () {
                    const edit_profileBtn = document.getElementById("edit-profilebtn");
                    const editprofilesSection = document.getElementById("edit-profile");
                    const profileSection = document.getElementById("profile");
                    const editcloseBtn = document.getElementById("editprofilecloseBtn");

                    edit_profileBtn.addEventListener("click", function (event) {
                        event.preventDefault(); // Prevent any default link behavior
                        profileSection.classList.add("hidden"); // Hide the profile section
                        editprofilesSection.style.display = "block"; // Show the address section
                    });

                    editcloseBtn.addEventListener("click", function () {
                        profileSection.classList.remove("hidden"); // Show the profile section
                        editprofilesSection.style.display = "none"; // Hide the address section
                    });
                });





                function addAddress() {
                    const formData = $("#address_item").serialize(); // Serialize the form data
                
                    fetch("/add-address", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded", // Set the content type to URL-encoded
                        },
                        body: formData,
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            // Handle the response data here
                            window.location.reload();
                            console.log(data);
                        })
                        .catch((error) => console.error("Error:", error));
                }
                
                function deleteAddress(addressId) {
                    fetch('/delete-address', {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json" // Assuming you're sending JSON
                        },
                        body: JSON.stringify({ addressId }), // Assuming productId is an object
                    }).then((response) => {
                        window.location.reload();
                    });
                }
                
                
                
                
                
                
