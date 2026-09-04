const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach((element) => observer.observe(element));

  window.setTimeout(() => {
    reveals.forEach((element) => element.classList.add('visible'));
  }, 900);
} else {
  reveals.forEach((element) => element.classList.add('visible'));
}
