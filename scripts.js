// Smooth scrolling for navigation links with offset
$(document).ready(function () {
  $("a.nav-link").on("click", function (event) {
    if (this.hash !== "") {
      event.preventDefault();

      var hash = this.hash;
      var navbarHeight = $(".navbar").outerHeight();

      $("html, body").animate(
        {
          scrollTop: $(hash).offset().top, // Adjusted offset to 50px more
        },
        800,
        function () {
          window.location.hash = hash;
        }
      );
    }
  });
});
