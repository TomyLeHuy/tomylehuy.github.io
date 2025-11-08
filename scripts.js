// Smooth scrolling for navigation links with offset
$(document).ready(function () {
  // Smooth scrolling for navigation links
  $("a.nav-link, footer a").on("click", function (event) {
    if (this.hash !== "") {
      event.preventDefault();

      var hash = this.hash;
      var navbarHeight = $(".navbar").outerHeight();

      $("html, body").animate(
        {
          scrollTop: $(hash).offset().top - navbarHeight,
        },
        1000,
        "swing",
        function () {
          // window.location.hash = hash;
        }
      );
    }
  });

  // Navbar scroll effect
  $(window).on("scroll", function () {
    if ($(window).scrollTop() > 100) {
      $("#mainNavbar").addClass("scrolled");
    } else {
      $("#mainNavbar").removeClass("scrolled");
    }
  });

  // Scroll reveal animation for sections
  function revealOnScroll() {
    var reveals = $("section, .card, .info-box");

    reveals.each(function () {
      var windowHeight = $(window).height();
      var elementTop = $(this).offset().top;
      var elementVisible = 150;

      if ($(window).scrollTop() > elementTop - windowHeight + elementVisible) {
        $(this).addClass("active");
      }
    });
  }

  $(window).on("scroll", revealOnScroll);
  revealOnScroll(); // Initial check

  // Subtle parallax effect to intro section (professional)
  $(window).on("scroll", function () {
    var scrolled = $(window).scrollTop();
    if (scrolled < 500) {
      $("#intro").css("transform", "translateY(" + scrolled * 0.15 + "px)");
    }
  });

  // Animate skill bars on scroll
  function animateSkills() {
    var skillsSection = $("#skills");
    var skillsSectionTop = skillsSection.offset().top;
    var windowHeight = $(window).height();

    if ($(window).scrollTop() > skillsSectionTop - windowHeight + 200) {
      $(".skill-bar").each(function () {
        var skillLevel = $(this).data("level");
        $(this).css("width", skillLevel + "%");
      });
    }
  }

  $(window).on("scroll", animateSkills);

  // Add smooth hover effect for cards
  $(".card").hover(
    function () {
      $(this).find(".card-title").css("color", "#667eea");
    },
    function () {
      $(this).find(".card-title").css("color", "#1a202c");
    }
  );

  // Add click effect to buttons
  $(".btn").on("click", function (e) {
    var ripple = $("<span class='ripple'></span>");
    $(this).append(ripple);

    var x = e.pageX - $(this).offset().left;
    var y = e.pageY - $(this).offset().top;

    ripple.css({
      top: y + "px",
      left: x + "px",
    });

    setTimeout(function () {
      ripple.remove();
    }, 600);
  });

  // Preloader fade out (if you add one later)
  $(window).on("load", function () {
    $("body").addClass("loaded");
  });
});
