// Main app with stages and timeline
document.addEventListener('DOMContentLoaded', () => {
  // Stage navigation
  const stages = document.querySelectorAll('.stage');
  const btnToStage2 = document.getElementById('btn-to-stage-2');
  const btnToStage3 = document.getElementById('btn-to-stage-3');
  const backBtn = document.getElementById('back-btn');
  
  let countdownInterval = null;

  function goToStage(stageNum) {
    stages.forEach(stage => stage.classList.remove('active'));
    document.getElementById(`stage-${stageNum}`).classList.add('active');
    currentStage = stageNum;
    
    // Show/hide back button
    if (stageNum === 1) {
      backBtn.classList.remove('show');
      // Clear countdown interval when leaving stage 2
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    } else {
      backBtn.classList.add('show');
    }

    // Update countdown when moving to stage 2
    if (stageNum === 2) {
      updateCountdown();
      // Update countdown every hour (3600000 ms)
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      countdownInterval = setInterval(updateCountdown, 3600000);
    }
  }

  let firstClickStage1 = true;

  btnToStage2.addEventListener('click', () => {
    if (firstClickStage1) {
      // First click: change text and trigger animation
      btnToStage2.textContent = 'MUEHEHEHHEEH';
      dropHearts();
      firstClickStage1 = false;
    } else {
      // Second click: proceed to stage 2
      dropHearts();
      setTimeout(() => {
        goToStage(2);
      }, 500);
    }
  });

  btnToStage3.addEventListener('click', () => {
    dropHearts();
    setTimeout(() => {
      goToStage(3);
    }, 300);
  });

  backBtn.addEventListener('click', () => {
    dropHearts();
    setTimeout(() => {
      goToStage(currentStage - 1);
    }, 300);
  });

  // Falling hearts and V² animation
  function dropHearts() {
    const colors = ['#f7a8b8', '#ff1744']; // Pink and Red
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        // Create heart
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.textContent = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.setProperty('--duration', (2 + Math.random() * 1.5) + 's');
        document.body.appendChild(heart);
        
        // Create V² text (every other drop)
        if (i % 2 === 0) {
          const v2 = document.createElement('div');
          v2.classList.add('heart');
          v2.textContent = 'V²';
          v2.style.left = Math.random() * 100 + 'vw';
          v2.style.setProperty('--duration', (2 + Math.random() * 1.5) + 's');
          v2.style.color = colors[Math.floor(Math.random() * colors.length)];
          v2.style.fontWeight = '700';
          v2.style.fontSize = '1.2rem';
          document.body.appendChild(v2);
          
          setTimeout(() => v2.remove(), 3500);
        }
        
        setTimeout(() => heart.remove(), 3500);
      }, i * 50);
    }
  }

  // Countdown timer
  function updateCountdown() {
    // Start date: May 4, 2025 at 4:00 AM
    const startDate = new Date(2025, 4, 4, 4, 0, 0); // Month is 0-indexed, so 4 = May
    const now = new Date();
    
    // Calculate time differences
    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();
    let hours = now.getHours() - startDate.getHours();
    let minutes = now.getMinutes() - startDate.getMinutes();

    // Adjust for negative values
    if (minutes < 0) {
      hours--;
      minutes += 60;
    }
    if (hours < 0) {
      days--;
      hours += 24;
    }
    if (days < 0) {
      months--;
      // Get days in previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // For the countdown, convert years to months if needed (9+ months for accuracy)
    const totalMonths = years * 12 + months;

    document.getElementById('months').textContent = totalMonths;
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
  }

  // Timeline section
  const timeline = document.getElementById('timeline');
  const previewPopup = document.getElementById('preview-popup');
  const previewImg = document.getElementById('preview-img');
  const previewInfo = document.getElementById('preview-info');
  const galleryModal = document.getElementById('gallery-modal');
  const galleryTitle = document.getElementById('gallery-title');
  const galleryGrid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');

  const timelineData = [
    {
      date: '12 May, 2025',
      location: 'Palladium',
      photos: [
        {url: './12-5-25/image1.png', title: ''},
        {url: './12-5-25/image2.png', title: ''},
        {url: './12-5-25/image3.png', title: ''},
        {url: './12-5-25/image4.png', title: ''},
        {url: './12-5-25/image.png', title: ''},
      ]
    },
    {
      date: '14 June, 2025',
      location: 'Elysium, McDonalds, Happinezz',
      photos: [
        {url: './14-6-25/image.png', title: ''},
        {url: './14-6-25/image10.png', title: ''},
        {url: './14-6-25/image1.png', title: ''},
        {url: './14-6-25/image2.png', title: ''},
        {url: './14-6-25/image3.png', title: ''},
        {url: './14-6-25/image4.png', title: ''},
        {url: './14-6-25/image5.png', title: ''},
        {url: './14-6-25/image6.png', title: ''},
        {url: './14-6-25/image7.png', title: ''},
        {url: './14-6-25/image8.png', title: ''},
        {url: './14-6-25/image9.png', title: ''},
      ]
    },
    {
      date: '21 June, 2025',
      location: 'F block Indraprasth-9',
      photos: [
        {url: './21-6-25/image1.jpeg', title: ''},
        {url: './21-6-25/image2.jpeg', title: ''},
        {url: './21-6-25/image3.jpeg', title: ''},
        {url: './21-6-25/image4.jpeg', title: ''},
        {url: './21-6-25/image5.jpeg', title: ''},
        {url: './21-6-25/image6.jpeg', title: ''},
        {url: './21-6-25/image7.jpeg', title: ''},
        {url: './21-6-25/image8.jpeg', title: ''},
        {url: './21-6-25/image9.jpeg', title: ''}
      ]
    },
    {
      date: '28 June, 2025',
      location: 'Bedroom',
      photos: [
        {url: './28-6-25/image1.jpeg', title: ''},
        {url: './28-6-25/image2.jpeg', title: ''},
        {url: './28-6-25/image3.jpeg', title: ''},
        {url: './28-6-25/image4.jpeg', title: ''},
        {url: './28-6-25/image5.jpeg', title: ''},
        {url: './28-6-25/image6.jpeg', title: ''},
        {url: './28-6-25/image7.jpeg', title: ''},
        {url: './28-6-25/image8.jpeg', title: ''},
        {url: './28-6-25/image9.jpeg', title: ''},
        {url: './28-6-25/image10.jpeg', title: ''},
        {url: './28-6-25/image11.jpeg', title: ''},
        {url: './28-6-25/image12.jpeg', title: ''},
        {url: './28-6-25/image13.jpeg', title: ''},
        {url: './28-6-25/image14.jpeg', title: ''},
        {url: './28-6-25/image15.jpeg', title: ''},
        {url: './28-6-25/image16.jpeg', title: ''},
        {url: './28-6-25/image17.jpeg', title: ''},
        {url: './28-6-25/image18.jpeg', title: ''},
        {url: './28-6-25/image19.jpeg', title: ''},
        {url: './28-6-25/image20.jpeg', title: ''},
        {url: './28-6-25/image21.jpeg', title: ''},
      ]
    },
    
    {
      date: '27 July, 2025',
      location: 'Palladium',
      photos: [
        {url: './27-7-25/image1.jpeg', title: ''},
        {url: './27-7-25/image2.jpeg', title: ''},
        {url: './27-7-25/image3.jpeg', title: ''},
        {url: './27-7-25/image4.jpeg', title: ''},
        {url: './27-7-25/image5.jpeg', title: ''},
        {url: './27-7-25/image6.jpeg', title: ''},
        {url: './27-7-25/image7.jpeg', title: ''},
        {url: './27-7-25/image8.jpeg', title: ''},
        {url: './27-7-25/image9.jpeg', title: ''},
        {url: './27-7-25/image10.jpeg', title: ''},
        {url: './27-7-25/image11.jpeg', title: ''},
        {url: './27-7-25/image12.jpeg', title: ''},
        {url: './27-7-25/image13.jpeg', title: ''},
        {url: './27-7-25/image14.jpeg', title: ''},
        {url: './27-7-25/image15.jpeg', title: ''},
        {url: './27-7-25/image16.jpeg', title: ''}
      ]
    },
    {
      date: '27 August, 2025',
      location: 'Elysium',
      photos: [
        {url: './27-8-25/image1.jpeg', title: ''},
        {url: './27-8-25/image2.jpeg', title: ''},
        {url: './27-8-25/image3.jpeg', title: ''},
        {url: './27-8-25/image4.jpeg', title: ''},
        {url: './27-8-25/image5.jpeg', title: ''},
        {url: './27-8-25/image6.jpeg', title: ''},
        {url: './27-8-25/image7.jpeg', title: ''},
        {url: './27-8-25/image8.jpeg', title: ''},
        {url: './27-8-25/image9.jpeg', title: ''}
      ]
    },
    {
      date: 'Navratri, 2025',
      location: 'Elysium, Nirma',
      featured: true,
      photos: [
        {url: './navratri-25/image1.jpeg', title: ''},
        {url: './navratri-25/image2.jpeg', title: ''},
        {url: './navratri-25/image3.jpeg', title: ''},
        {url: './navratri-25/image4.jpeg', title: ''},
        {url: './navratri-25/image5.jpeg', title: ''},
        {url: './navratri-25/image6.jpeg', title: ''},
        {url: './navratri-25/image7.jpeg', title: ''},
        {url: './navratri-25/image8.jpeg', title: ''},
        {url: './navratri-25/image9.jpeg', title: ''},
        {url: './navratri-25/image10.jpeg', title: ''},
        {url: './navratri-25/image11.jpeg', title: ''},
        {url: './navratri-25/image12.jpeg', title: ''},
        {url: './navratri-25/image13.jpeg', title: ''},
        {url: './navratri-25/image14.jpeg', title: ''},
        {url: './navratri-25/image15.jpeg', title: ''},
        {url: './navratri-25/image16.jpeg', title: ''},
        {url: './navratri-25/image17.jpeg', title: ''},
        {url: './navratri-25/image18.jpeg', title: ''},
        {url: './navratri-25/image19.jpeg', title: ''},
        {url: './navratri-25/image20.jpeg', title: ''},
        {url: './navratri-25/image21.jpeg', title: ''},
        {url: './navratri-25/image22.jpeg', title: ''},
        {url: './navratri-25/image23.jpeg', title: ''},
        {url: './navratri-25/image24.jpeg', title: ''},
        {url: './navratri-25/image25.jpeg', title: ''},
        {url: './navratri-25/image26.jpeg', title: ''},
        {url: './navratri-25/image27.jpeg', title: ''},
        {url: './navratri-25/image28.jpeg', title: ''},
        {url: './navratri-25/image29.jpeg', title: ''},
        {url: './navratri-25/image30.jpeg', title: ''}
      ]
    },
    {
      date: '24 October, 2025',
      location: 'Palladium',
      photos: [
        {url: './24-10-25/image1.jpeg', title: ''},
        {url: './24-10-25/image2.jpeg', title: ''},
        {url: './24-10-25/image3.jpeg', title: ''},
        {url: './24-10-25/image4.jpeg', title: ''},
        {url: './24-10-25/image5.jpeg', title: ''},
        {url: './24-10-25/image6.jpeg', title: ''},
        {url: './24-10-25/image7.jpeg', title: ''},
        {url: './24-10-25/image8.jpeg', title: ''},
        {url: './24-10-25/image9.jpeg', title: ''}
      ]
    },
    {
      date: '6 December, 2025',
      location: 'Rangoli',
      photos: [
        {url: './6-12-25/image1.jpeg', title: ''},
        {url: './6-12-25/image2.jpeg', title: ''},
        {url: './6-12-25/image3.jpeg', title: ''},
        {url: './6-12-25/image4.jpeg', title: ''},
        {url: './6-12-25/image5.jpeg', title: ''},
        {url: './6-12-25/image6.jpeg', title: ''},
        {url: './6-12-25/image7.jpeg', title: ''},
        {url: './6-12-25/image8.jpeg', title: ''}
      ]
    },
    {
      date: 'Euphoria Day-1, 2026',
      location: 'Nirma',
      featured: true,
      photos: [
        {url: './e-1-26/image1.jpeg', title: ''},
        {url: './e-1-26/image2.jpeg', title: ''},
        {url: './e-1-26/image3.jpeg', title: ''},
        {url: './e-1-26/image4.jpeg', title: ''},
        {url: './e-1-26/image5.jpeg', title: ''},
        {url: './e-1-26/image6.jpeg', title: ''},
        {url: './e-1-26/image7.jpeg', title: ''},
        {url: './e-1-26/image8.jpeg', title: ''},
        {url: './e-1-26/image9.jpeg', title: ''},
        {url: './e-1-26/image10.jpeg', title: ''},
        {url: './e-1-26/image11.jpeg', title: ''},
        {url: './e-1-26/image12.jpeg', title: ''},
        {url: './e-1-26/image13.jpeg', title: ''},
        {url: './e-1-26/image14.jpeg', title: ''},
        {url: './e-1-26/image15.jpeg', title: ''}
      ]
    },
    {
      date: 'Euphoria Day-2, 2026',
      location: 'Nirma',
      featured: true,
      photos: [
        {url: './e-2-26/image1.jpeg', title: ''},
        {url: './e-2-26/image2.jpeg', title: ''},
        {url: './e-2-26/image3.jpeg', title: ''},
        {url: './e-2-26/image4.jpeg', title: ''},
        {url: './e-2-26/image5.jpeg', title: ''},
        {url: './e-2-26/image6.jpeg', title: ''},
        {url: './e-2-26/image7.jpeg', title: ''},
        {url: './e-2-26/image8.jpeg', title: ''},
        {url: './e-2-26/image9.jpeg', title: ''}
      ]
    },
    {
      date: '7 February, 2026',
      location: 'Rangoli',
      featured: false,
      photos: [
        {url: './7-2-26/image1.jpeg', title: ''},
        {url: './7-2-26/image2.jpeg', title: ''},
        {url: './7-2-26/image3.jpeg', title: ''},
        {url: './7-2-26/image4.jpeg', title: ''},
        {url: './7-2-26/image5.jpeg', title: ''},
        {url: './7-2-26/image6.jpeg', title: ''}
      ]
    },
  ];

  function createTimelineItem(data, index) {
    const item = document.createElement('div');
    item.className = 'timeline-item';

    const dot = document.createElement('div');
    dot.className = 'timeline-dot';

    const content = document.createElement('div');
    content.className = 'content';

    const date = document.createElement('div');
    date.className = 'date';
    date.textContent = data.date;

    const location = document.createElement('p');
    location.className = 'location';
    location.textContent = `📍 ${data.location} • ${data.photos.length} photo${data.photos.length > 1 ? 's' : ''}`;

    content.appendChild(date);
    content.appendChild(location);

    content.addEventListener('mouseenter', () => {
      const rect = content.getBoundingClientRect();
      previewPopup.classList.add('show');
      previewPopup.style.left = (rect.left + rect.width / 2 - 120) + 'px';
      previewPopup.style.top = (rect.top - 260) + 'px';
      previewImg.src = data.photos[0].url;
      previewInfo.textContent = `${data.photos[0].title} (+${data.photos.length - 1} more)`;
    });

    content.addEventListener('mouseleave', () => {
      previewPopup.classList.remove('show');
    });

    content.addEventListener('click', () => {
      openGallery(data);
    });

    dot.addEventListener('click', () => {
      openGallery(data);
    });

    item.appendChild(dot);
    item.appendChild(content);
    
    // Apply featured styling if marked
    if (data.featured) {
      item.classList.add('featured-item');
    }
    
    return item;
  }

  function openGallery(data) {
    galleryTitle.textContent = `${data.date} — ${data.location}`;
    galleryGrid.innerHTML = '';

    data.photos.forEach(photo => {
      const item = document.createElement('div');
      item.className = 'gallery-item';

      const img = document.createElement('img');
      img.src = photo.url;
      img.alt = photo.title;

      img.addEventListener('click', () => {
        openLightbox(photo.url);
      });

      item.appendChild(img);
      galleryGrid.appendChild(item);
    });

    galleryModal.classList.add('open');
  }

  function openLightbox(url) {
    lightboxImg.src = url;
    lightbox.classList.add('open');
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
  }

  function closeGallery() {
    galleryModal.classList.remove('open');
  }

  document.querySelector('.gallery-close').addEventListener('click', closeGallery);
  galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) closeGallery();
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeGallery();
    }
  });

  timelineData.forEach((data, index) => {
    timeline.appendChild(createTimelineItem(data, index));
  });
});
