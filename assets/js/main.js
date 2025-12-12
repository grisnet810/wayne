// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener('change', () => {
    mobileMenu.classList.toggle('open', mobileMenuToggle.checked);
  });
}

// Close mobile menu when a link is clicked
const mobileLinks = mobileMenu.querySelectorAll('a');
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    mobileMenuToggle.checked = false; // Uncheck the checkbox
  });
});

// Hero Slider Logic
const slidesEl = document.getElementById('slides');
const slides = [...document.querySelectorAll('.slide')];
const dotsEl = document.getElementById('dots');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
let index = 0;
let timer;

function renderDots() {
  dotsEl.innerHTML = '';
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'dot' + (i === index ? ' active' : '');
    b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    b.addEventListener('click', () => go(i));
    dotsEl.appendChild(b);
  });
}

function go(i) {
  index = (i + slides.length) % slides.length;
  slidesEl.style.transform = `translateX(-${index * 100}%)`;
  [...dotsEl.children].forEach((d, di) => d.classList.toggle('active', di === index));
  restart();
}

function next() {
  go(index + 1)
}

function prev() {
  go(index - 1)
}

function start() {
  timer = setInterval(next, 6000)
}

function stop() {
  clearInterval(timer)
}

function restart() {
  stop();
  start()
}

prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);
document.querySelector('.hero').addEventListener('mouseenter', stop);
document.querySelector('.hero').addEventListener('mouseleave', start);
renderDots();
start();

// Testimonials Slider Logic
const slidesTestimonialsEl = document.getElementById('slidesTestimonials');
const slidesTestimonials = [...document.querySelectorAll('.slide-testimonial')];
const dotsTestimonialsEl = document.getElementById('dotsTestimonials');
let indexTestimonials = 0;
let timerTestimonials;

function renderDotsTestimonials() {
  dotsTestimonialsEl.innerHTML = '';
  slidesTestimonials.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'dot' + (i === indexTestimonials ? ' active' : '');
    b.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
    b.addEventListener('click', () => goTestimonials(i));
    dotsTestimonialsEl.appendChild(b);
  });
}

function goTestimonials(i) {
  indexTestimonials = (i + slidesTestimonials.length) % slidesTestimonials.length;
  slidesTestimonialsEl.style.transform = `translateX(-${indexTestimonials * 100}%)`;
  [...dotsTestimonialsEl.children].forEach((d, di) => d.classList.toggle('active', di === indexTestimonials));
  restartTestimonials();
  // Restart the timer
}document.getElementById('prevTestimonial').addEventListener('click', () => {
  goTestimonials(indexTestimonials - 1);
});

document.getElementById('nextTestimonial').addEventListener('click', () => {
  goTestimonials(indexTestimonials + 1);
});

function startTestimonials() {
  timerTestimonials = setInterval(() => goTestimonials(indexTestimonials + 1), 7000);
} // 7-second interval

function restartTestimonials() {
  clearInterval(timerTestimonials);
  startTestimonials();
}

renderDotsTestimonials();
startTestimonials();




// Handle initial page load
window.addEventListener('load', () => {
  const hash = window.location.hash;
  if (hash) {
    const targetSection = document.querySelector(hash);
    if (targetSection) {
      const allSections = document.querySelectorAll('.page-section');
      allSections.forEach(section => section.classList.remove('active'));
      targetSection.classList.add('active');
    }
  }
});

// Function to handle the portfolio tab switching logic
function initializePortfolioTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const projectCategories = document.querySelectorAll('.project-category');

    // Initial setup: Show only the first category by default
    // This is a failsafe in case the CSS is missed or overridden
    projectCategories.forEach((cat, index) => {
        if (index === 0) {
            cat.classList.add('active');
            cat.style.opacity = 1;
        } else {
            cat.classList.remove('active');
            cat.style.opacity = 0;
        }
    });

    // Add event listeners to all tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');

            // 1. Deactivate all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // 2. Hide all category content
            projectCategories.forEach(cat => {
                cat.classList.remove('active');
                cat.style.opacity = 0;
            });

            // 3. Activate the clicked button
            button.classList.add('active');

            // 4. Show the corresponding category content
            const activeCategory = document.getElementById(category);
            if (activeCategory) {
                // Short delay ensures smooth transition after 'display: grid' is applied
                activeCategory.classList.add('active');
                setTimeout(() => {
                    activeCategory.style.opacity = 1;
                }, 10); 
            }
        });
    });
}

// Ensure the function runs once the entire HTML is loaded
document.addEventListener('DOMContentLoaded', initializePortfolioTabs);

// --- PORTFOLIO MODAL LOGIC ---

function initializeCaseStudyModal() {
    const modal = document.getElementById('caseStudyModal');
    const closeBtn = document.querySelector('.close-btn');
    const projectCards = document.querySelectorAll('.project-overlay-card');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalCta = document.getElementById('modalCta');

    // Function to open the modal with content
    function openModal(title, description, imageUrl) {
        modalTitle.textContent = title;
        modalBody.innerHTML = `
            <div style="margin-bottom: 20px;">
                <img src="${imageUrl}" alt="${title}" style="width: 100%; height: auto; border-radius: 8px;">
            </div>
            <p>${description}</p>
            <p style="font-style: italic; margin-top: 15px;">We decided on a pop-up to keep you focused on getting a quote, as per high-performance sales funnel best practice.</p>
        `;
        // Ensure the CTA button is visible and relevant
        modalCta.href = "quote.html";
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    }

    // Attach click listeners to all project cards
    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const title = card.getAttribute('data-title');
            const desc = card.getAttribute('data-desc');
            // Assuming Img folder is relative to the root
            const imgPath = card.querySelector('img').getAttribute('src'); 
            
            openModal(title, desc, imgPath);
        });
    });

    // Close modal handlers
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
}

// Call the new modal initializer once the page loads
document.addEventListener('DOMContentLoaded', initializeCaseStudyModal);

