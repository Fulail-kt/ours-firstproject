
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