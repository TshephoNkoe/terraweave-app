// Enhanced Charts and Maps JavaScript with Google Maps Integration
class TerraWeaveCharts {
    constructor() {
        this.charts = new Map();
        this.map = null;
        this.globe = null;
        this.isGlobeView = false;
        this.apiKey = localStorage.getItem('google_api_key') || '';
        this.init();
    }

    init() {
        this.setupTimeLensChart();
        this.setupCityComparisonChart();
        this.setupEnergyMixChart();
        this.initializeGoogleMaps();
        this.setupMapControls();
    }

    initializeGoogleMaps() {
        // Check if API key is available
        if (!this.apiKey) {
            this.showApiKeyPrompt();
            return;
        }

        // Load Google Maps API
        this.loadGoogleMapsAPI().then(() => {
            this.createMap();
        }).catch(error => {
            console.error('Failed to load Google Maps:', error);
            this.showError('Failed to load Google Maps. Check your API key.');
        });
    }

    loadGoogleMapsAPI() {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=visualization`;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    createMap() {
        const mapElement = document.getElementById('googleMap');
        if (!mapElement) return;

        this.map = new google.maps.Map(mapElement, {
            center: { lat: 20, lng: 0 },
            zoom: 2,
            mapTypeId: 'satellite',
            styles: [
                {
                    "featureType": "all",
                    "elementType": "geometry.fill",
                    "stylers": [{ "weight": "2.00" }]
                },
                {
                    "featureType": "all",
                    "elementType": "geometry.stroke",
                    "stylers": [{ "color": "#9c9c9c" }]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text.fill",
                    "stylers": [{ "color": "#ffffff" }]
                }
            ],
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: true,
            fullscreenControl: true
        });

        // Add climate data overlay
        this.addClimateOverlays();
        
        // Add click event to get coordinates
        this.map.addListener('click', (event) => {
            this.handleMapClick(event.latLng);
        });

        console.log('Google Maps initialized successfully');
    }

    addClimateOverlays() {
        // Add heat map for temperature anomalies
        const heatMapData = [
            {location: new google.maps.LatLng(-25.75, 28.19), weight: 0.8},  // Pretoria
            {location: new google.maps.LatLng(55.75, 37.61), weight: 0.3},   // Moscow
            {location: new google.maps.LatLng(35.68, 139.65), weight: 0.5},  // Tokyo
            {location: new google.maps.LatLng(6.52, 3.37), weight: 0.9},     // Lagos
            {location: new google.maps.LatLng(51.50, -0.12), weight: 0.4}    // London
        ];

        this.heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatMapData,
            map: this.map,
            radius: 30,
            opacity: 0.6
        });

        // Add markers for major cities
        this.addCityMarkers();
    }

    addCityMarkers() {
        const cities = [
            {name: 'Pretoria', lat: -25.75, lng: 28.19, temp: '+4.0°C', color: '#ff2e63'},
            {name: 'Moscow', lat: 55.75, lng: 37.61, temp: '+2.0°C', color: '#7b61ff'},
            {name: 'Tokyo', lat: 35.68, lng: 139.65, temp: '+1.0°C', color: '#00f3ff'},
            {name: 'Lagos', lat: 6.52, lng: 3.37, temp: '+3.0°C', color: '#ffb800'},
            {name: 'London', lat: 51.50, lng: -0.12, temp: '+1.0°C', color: '#00d4aa'}
        ];

        cities.forEach(city => {
            const marker = new google.maps.Marker({
                position: { lat: city.lat, lng: city.lng },
                map: this.map,
                title: city.name,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: city.color,
                    fillOpacity: 0.8,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                }
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div class="map-info-window">
                        <h3>${city.name}</h3>
                        <p><strong>Temperature Anomaly:</strong> ${city.temp}</p>
                        <p><strong>Coordinates:</strong> ${city.lat.toFixed(2)}, ${city.lng.toFixed(2)}</p>
                        <button onclick="terraWeaveCharts.analyzeLocation(${city.lat}, ${city.lng})" class="analyze-btn">
                            Analyze This Location
                        </button>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
            });
        });
    }

    handleMapClick(latLng) {
        const lat = latLng.lat();
        const lng = latLng.lng();
        
        this.showLocationAnalysis(lat, lng);
    }

    analyzeLocation(lat, lng) {
        this.showLocationAnalysis(lat, lng);
        
        // Pan map to the location
        if (this.map) {
            this.map.panTo({ lat, lng });
            this.map.setZoom(8);
        }
    }

    showLocationAnalysis(lat, lng) {
        // Create or update analysis panel
        let analysisPanel = document.getElementById('locationAnalysis');
        if (!analysisPanel) {
            analysisPanel = document.createElement('div');
            analysisPanel.id = 'locationAnalysis';
            analysisPanel.className = 'location-analysis-panel';
            document.querySelector('.map-container').appendChild(analysisPanel);
        }

        // Mock analysis data - in real app, this would come from NASA APIs
        const analysisData = this.generateLocationAnalysis(lat, lng);

        analysisPanel.innerHTML = `
            <div class="analysis-header">
                <h4>Location Analysis</h4>
                <button onclick="this.parentElement.parentElement.remove()" class="close-btn">&times;</button>
            </div>
            <div class="analysis-content">
                <p><strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
                <p><strong>Temperature Trend:</strong> ${analysisData.temperatureTrend}</p>
                <p><strong>Vegetation Change:</strong> ${analysisData.vegetationChange}</p>
                <p><strong>Urban Development:</strong> ${analysisData.urbanDevelopment}</p>
                <p><strong>Climate Risk:</strong> ${analysisData.climateRisk}</p>
            </div>
            <div class="analysis-actions">
                <button class="action-btn" onclick="terraWeaveCharts.generateReport(${lat}, ${lng})">
                    <i class="fas fa-download"></i> Generate Report
                </button>
                <button class="action-btn" onclick="terraWeaveCharts.addToMonitoring(${lat}, ${lng})">
                    <i class="fas fa-plus"></i> Monitor Location
                </button>
            </div>
        `;

        analysisPanel.style.display = 'block';
    }

    generateLocationAnalysis(lat, lng) {
        // Mock analysis based on coordinates
        // In real app, this would integrate with NASA climate APIs
        return {
            temperatureTrend: '+2.1°C since 1984',
            vegetationChange: '-15% green cover',
            urbanDevelopment: '+35% urban area',
            climateRisk: 'Medium-High',
            recommendations: [
                'Implement green infrastructure',
                'Monitor water resources',
                'Develop climate adaptation plan'
            ]
        };
    }

    setupMapControls() {
        // API Key management
        const apiKeyInput = document.getElementById('googleApiKey');
        const saveKeyBtn = document.getElementById('saveApiKey');
        const toggleGlobeBtn = document.getElementById('toggleGlobe');
        const resetViewBtn = document.getElementById('resetView');

        if (apiKeyInput && this.apiKey) {
            apiKeyInput.value = '••••••••••••••••';
        }

        if (saveKeyBtn) {
            saveKeyBtn.addEventListener('click', () => {
                const newKey = document.getElementById('googleApiKey').value;
                if (newKey && newKey.length > 10) {
                    this.apiKey = newKey;
                    localStorage.setItem('google_api_key', newKey);
                    this.showMessage('API Key saved successfully!', 'success');
                    location.reload(); // Reload to initialize maps with new key
                } else {
                    this.showMessage('Please enter a valid API key', 'error');
                }
            });
        }

        if (toggleGlobeBtn) {
            toggleGlobeBtn.addEventListener('click', () => {
                this.toggleGlobeView();
            });
        }

        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                this.resetMapView();
            });
        }
    }

    toggleGlobeView() {
        this.isGlobeView = !this.isGlobeView;
        const toggleBtn = document.getElementById('toggleGlobe');
        
        if (this.isGlobeView) {
            this.enableGlobeView();
            toggleBtn.innerHTML = '<i class="fas fa-map"></i> Switch to 2D Map';
        } else {
            this.disableGlobeView();
            toggleBtn.innerHTML = '<i class="fas fa-globe"></i> Switch to 3D Globe';
        }
    }

    enableGlobeView() {
        if (!this.map) return;

        // Enable 3D terrain and buildings
        this.map.setOptions({
            tilt: 45,
            heading: 0,
            zoom: 3
        });

        // Start automatic rotation
        this.startGlobeRotation();
    }

    disableGlobeView() {
        if (!this.map) return;

        // Reset to 2D view
        this.map.setOptions({
            tilt: 0,
            heading: 0,
            zoom: 2
        });

        // Stop rotation
        this.stopGlobeRotation();
    }

    startGlobeRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
        }

        this.rotationInterval = setInterval(() => {
            if (this.map) {
                const currentHeading = this.map.getHeading() || 0;
                this.map.setHeading((currentHeading + 0.2) % 360);
            }
        }, 50);
    }

    stopGlobeRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
    }

    resetMapView() {
        if (this.map) {
            this.map.setCenter({ lat: 20, lng: 0 });
            this.map.setZoom(2);
            this.map.setHeading(0);
            this.map.setTilt(0);
            this.isGlobeView = false;
            
            const toggleBtn = document.getElementById('toggleGlobe');
            toggleBtn.innerHTML = '<i class="fas fa-globe"></i> Switch to 3D Globe';
            
            this.stopGlobeRotation();
        }
    }

    showApiKeyPrompt() {
        const mapElement = document.getElementById('googleMap');
        if (mapElement) {
            mapElement.innerHTML = `
                <div class="api-key-prompt">
                    <div class="prompt-content">
                        <i class="fas fa-key"></i>
                        <h3>Google Maps API Key Required</h3>
                        <p>To enable satellite imagery and interactive maps, please provide your Google Maps API key.</p>
                        <div class="key-input-group">
                            <input type="password" id="promptApiKey" placeholder="Enter your Google API key">
                            <button onclick="terraWeaveCharts.savePromptApiKey()">Save & Load Maps</button>
                        </div>
                        <div class="api-key-help">
                            <p><strong>How to get an API key:</strong></p>
                            <ol>
                                <li>Go to <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
                                <li>Create a new project or select existing one</li>
                                <li>Enable "Maps JavaScript API" and "Maps Static API"</li>
                                <li>Create credentials (API key)</li>
                                <li>Restrict the key to your domain for security</li>
                            </ol>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    savePromptApiKey() {
        const keyInput = document.getElementById('promptApiKey');
        const apiKey = keyInput.value.trim();
        
        if (apiKey && apiKey.length > 10) {
            this.apiKey = apiKey;
            localStorage.setItem('google_api_key', apiKey);
            this.showMessage('API Key saved! Loading maps...', 'success');
            setTimeout(() => location.reload(), 2000);
        } else {
            this.showMessage('Please enter a valid API key', 'error');
        }
    }

    generateReport(lat, lng) {
        // Generate a PDF or detailed report for the location
        this.showMessage('Generating climate analysis report...', 'success');
        // In real implementation, this would generate a PDF report
    }

    addToMonitoring(lat, lng) {
        // Add location to monitoring list
        this.showMessage('Location added to monitoring list', 'success');
        // In real implementation, this would save to database
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.map-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `map-message map-message-${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.querySelector('.map-container').appendChild(messageEl);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    // Existing chart methods remain the same
    setupTimeLensChart() {
        const ctx = document.getElementById('changeChart');
        if (!ctx) return;

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1984', '1990', '1996', '2002', '2008', '2014', '2020', '2024'],
                datasets: [
                    {
                        label: 'Temperature Change (°C)',
                        data: [0, 0.3, 0.7, 1.1, 1.4, 1.8, 2.0, 2.1],
                        borderColor: '#ff2e63',
                        backgroundColor: 'rgba(255, 46, 99, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Urban Area (%)',
                        data: [100, 112, 125, 138, 152, 165, 178, 195],
                        borderColor: '#00f3ff',
                        backgroundColor: 'rgba(0, 243, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Green Cover (%)',
                        data: [100, 95, 88, 82, 75, 68, 62, 55],
                        borderColor: '#00d4aa',
                        backgroundColor: 'rgba(0, 212, 170, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#8892b0',
                            font: {
                                family: 'Exo 2'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Climate Change Indicators (1984-2024)',
                        color: '#ffffff',
                        font: {
                            family: 'Exo 2',
                            size: 14
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(136, 146, 176, 0.1)'
                        },
                        ticks: {
                            color: '#8892b0'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(136, 146, 176, 0.1)'
                        },
                        ticks: {
                            color: '#8892b0'
                        }
                    }
                }
            }
        });

        this.charts.set('changeChart', chart);
    }

    setupCityComparisonChart() {
        // Implementation remains the same as before
    }

    setupEnergyMixChart() {
        // Implementation remains the same as before
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.terraWeaveCharts = new TerraWeaveCharts();
});