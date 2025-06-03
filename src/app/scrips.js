// Function to update theme dynamically
function updateTheme(theme) {
    const root = document.documentElement;
    const themes = {
      light: {
        '--bright-blue': 'oklch(51.01% 0.274 263.83)',
        '--electric-violet': 'oklch(53.18% 0.28 296.97)',
        '--gray-900': 'oklch(19.37% 0.006 300.98)',
        // Add more theme variables here
      },
      dark: {
        '--bright-blue': 'oklch(60% 0.2 260)',
        '--electric-violet': 'oklch(40% 0.3 290)',
        '--gray-900': 'oklch(10% 0.01 320)',
        // Add more theme variables here
      }
    };
  
    const selectedTheme = themes[theme] || themes.light;
  
    Object.keys(selectedTheme).forEach((key) => {
      root.style.setProperty(key, selectedTheme[key]);
    });
  }
  
  // Function to handle hover effects on pill elements
  function handlePillHover(pillElement) {
    pillElement.addEventListener('mouseenter', () => {
      pillElement.style.background = `color-mix(in srgb, var(--pill-accent) 15%, transparent)`;
    });
  
    pillElement.addEventListener('mouseleave', () => {
      pillElement.style.background = `color-mix(in srgb, var(--pill-accent) 5%, transparent)`;
    });
  }
  
  // Function to set up social links with hover effects
  function setupSocialLinks(socialLinks) {
    socialLinks.forEach(link => {
      const svgPath = link.querySelector('svg path');
      
      svgPath.addEventListener('mouseenter', () => {
        svgPath.style.fill = 'var(--gray-900)';
      });
  
      svgPath.addEventListener('mouseleave', () => {
        svgPath.style.fill = 'var(--gray-400)';
      });
  
      link.addEventListener('click', (event) => {
        event.preventDefault();
        window.open(link.href, '_blank');
      });
    });
  }
  
  // Function to dynamically add pills to a pill group
  function addPillsToGroup(pillGroupElement, pillData) {
    pillData.forEach(data => {
      const pill = document.createElement('a');
      pill.classList.add('pill');
      pill.textContent = data.label;
      pill.href = data.link;
  
      pill.style.setProperty('--pill-accent', data.color);
      
      pillGroupElement.appendChild(pill);
    });
  }
  
  // Function to update divider style based on screen size
  function updateDividerStyle() {
    const divider = document.querySelector('.divider');
    const isSmallScreen = window.innerWidth <= 650;
  
    if (isSmallScreen) {
      divider.style.background = 'var(--red-to-pink-to-purple-horizontal-gradient)';
      divider.style.height = '1px';
      divider.style.width = '100%';
    } else {
      divider.style.background = 'var(--red-to-pink-to-purple-vertical-gradient)';
      divider.style.height = '100%';
      divider.style.width = '1px';
    }
  }
  
  window.addEventListener('resize', updateDividerStyle);
  updateDividerStyle(); // Call initially to set correct style on page load
  
  // Function to animate SVG elements (optional)
  function animateSVG(svgElement) {
    const path = svgElement.querySelector('path');
    
    path.style.transition = 'all 0.3s ease';
    path.style.fill = 'var(--bright-blue)';
  
    svgElement.addEventListener('mouseover', () => {
      path.style.transform = 'scale(1.1)';
    });
  
    svgElement.addEventListener('mouseout', () => {
      path.style.transform = 'scale(1)';
    });
  }
  