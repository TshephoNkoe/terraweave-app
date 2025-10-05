// Dashboard Module Management
class TerraWeaveDashboard {
    constructor() {
        this.currentModule = 'time-lens';
        this.init();
    }

    init() {
        this.setupModuleNavigation();
        this.setupTimeLens();
        this.setupGlobalPulse();
        this.setupActionHub();
        this.loadInitialData();
    }

    setupModuleNavigation() {
        const modules = document.querySelectorAll('.nav-module');
        modules.forEach(module => {
            module.addEventListener('click', (e) => {
                e.preventDefault();
                const targetModule = module.getAttribute('data-module');
                this.switchModule(targetModule);
            });
        });
    }

    switchModule(moduleName) {
        // Update navigation
        document.querySelectorAll('.nav-module').forEach(mod => mod.classList.remove('active'));
        document.querySelector(`[data-module="${moduleName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.module').forEach(mod => mod.classList.remove('active'));
        document.getElementById(moduleName).classList.add('active');

        this.currentModule = moduleName;
    }

    setupTimeLens() {
        const yearSlider = document.getElementById('yearSlider');
        const currentYear = document.getElementById('currentYear');

        yearSlider.addEventListener('input', (e) => {
            const year = e.target.value;
            currentYear.textContent = year;
            this.updateTimeLensData(year);
        });

        const locationSelect = document.getElementById('locationSelect');
        locationSelect.addEventListener('change', (e) => {
            this.updateTimeLensData(yearSlider.value, e.target.value);
        });
    }

    setupGlobalPulse() {
        this.loadGlobalPulseData();
    }

    setupActionHub() {
        this.setupActionTabs();
        this.loadActionRecommendations();
        this.loadEskomAnalysis();
    }

    setupActionTabs() {
        const tabs = document.querySelectorAll('.action-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = tab.getAttribute('data-tab');
                this.switchActionTab(tabName);
            });
        });
    }

    switchActionTab(tabName) {
        // Update tabs
        document.querySelectorAll('.action-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(`${tabName}-actions`).classList.add('active');
    }

    async loadInitialData() {
        // Simulate API calls
        await this.loadTimeLensData();
        await this.loadGlobalPulseData();
    }

    async loadTimeLensData() {
        // Simulate data loading
        const sampleData = {
            tempChange: '+2.1°C',
            urbanGrowth: '+45%',
            greenLoss: '-18%'
        };

        Object.keys(sampleData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = sampleData[key];
            }
        });
    }

    async loadGlobalPulseData() {
        const cities = [
            {
                name: 'Pretoria',
                temp: '32°C',
                anomaly: '+4°C',
                aqi: '85',
                vegetation: '-12%',
                precipitation: '-50%'
            },
            {
                name: 'Moscow',
                temp: '18°C',
                anomaly: '+2°C',
                aqi: '45',
                vegetation: '+5%',
                precipitation: '+20%'
            },
            {
                name: 'Tokyo',
                temp: '25°C',
                anomaly: '+1°C',
                aqi: '65',
                vegetation: '-3%',
                precipitation: '-10%'
            },
            {
                name: 'Lagos',
                temp: '35°C',
                anomaly: '+3°C',
                aqi: '95',
                vegetation: '-8%',
                precipitation: '-30%'
            },
            {
                name: 'London',
                temp: '15°C',
                anomaly: '+1°C',
                aqi: '55',
                vegetation: '+2%',
                precipitation: '+15%'
            }
        ];

        const grid = document.querySelector('.cities-grid');
        grid.innerHTML = cities.map(city => `
            <div class="city-card">
                <div class="city-header">
                    <span class="city-name">${city.name}</span>
                    <span class="city-temp">${city.temp}</span>
                </div>
                <div class="city-metrics">
                    <div class="city-metric">
                        <span class="metric-value">${city.anomaly}</span>
                        <span class="metric-label">vs Average</span>
                    </div>
                    <div class="city-metric">
                        <span class="metric-value">${city.aqi}</span>
                        <span class="metric-label">Air Quality</span>
                    </div>
                </div>
                <div class="climate-anomaly">
                    <span class="anomaly-value">Climate Anomaly Detected</span>
                    <p>Current conditions are significantly different from historical averages.</p>
                </div>
            </div>
        `).join('');

        // Update AI Insight
        document.getElementById('aiInsight').innerHTML = `
            <p>"Analysis shows unusual temperature patterns across Southern Africa and West Africa, 
            with Pretoria and Lagos experiencing significantly higher temperatures than historical averages. 
            This pattern aligns with climate model projections for urban heat island intensification."</p>
        `;
    }

    async loadActionRecommendations() {
        const recommendations = [
            {
                title: "Reduce Energy Consumption",
                description: "Switch to LED lighting and optimize AC usage during peak hours",
                impact: "Save ~1.2 tons CO2/year"
            },
            {
                title: "Plant Native Trees",
                description: "Spekboom and other native species are excellent for carbon capture",
                impact: "Capture ~50kg CO2/year per tree"
            },
            {
                title: "Use Public Transport",
                description: "Reduce car usage by 2 days per week",
                impact: "Reduce ~0.8 tons CO2/year"
            },
            {
                title: "Support Renewable Energy",
                description: "Consider solar panel installation or green energy tariffs",
                impact: "Offset ~3 tons CO2/year"
            }
        ];

        const container = document.getElementById('personalRecommendations');
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
                <div class="impact-badge">${rec.impact}</div>
            </div>
        `).join('');
    }

    async loadEskomAnalysis() {
        const plants = [
            {
                name: "Kendal Power Station",
                type: "Coal",
                capacity: "4116 MW",
                impact: "2.1M people",
                co2: "18.2M tons/year"
            },
            {
                name: "Medupi Power Station",
                type: "Coal",
                capacity: "4764 MW",
                impact: "2.8M people",
                co2: "21.5M tons/year"
            },
            {
                name: "Koeberg Nuclear",
                type: "Nuclear",
                capacity: "1860 MW",
                impact: "Low",
                co2: "0 tons"
            }
        ];

        const grid = document.querySelector('.power-plant-grid');
        grid.innerHTML = plants.map(plant => `
            <div class="power-plant-card">
                <div class="plant-header">
                    <span class="plant-name">${plant.name}</span>
                    <span class="plant-type">${plant.type}</span>
                </div>
                <div class="plant-metrics">
                    <div class="city-metric">
                        <span class="metric-value">${plant.capacity}</span>
                        <span class="metric-label">Capacity</span>
                    </div>
                    <div class="city-metric">
                        <span class="metric-value">${plant.impact}</span>
                        <span class="metric-label">Health Impact</span>
                    </div>
                    <div class="city-metric">
                        <span class="metric-value">${plant.co2}</span>
                        <span class="metric-label">CO2 Emissions</span>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('transitionRecommendations').innerHTML = `
            <div class="recommendation-card">
                <h4>Immediate Action: Solar Deployment</h4>
                <p>Deploy 5GW solar capacity in Northern Cape to reduce coal dependency by 15%</p>
                <div class="impact-badge">Save 8.3M tons CO2 annually</div>
            </div>
            <div class="recommendation-card">
                <h4>Medium-term: Nuclear Expansion</h4>
                <p>Extend Koeberg's lifespan and develop new nuclear capacity</p>
                <div class="impact-badge">Zero-emission baseload power</div>
            </div>
            <div class="recommendation-card">
                <h4>Long-term: Grid Modernization</h4>
                <p>Implement smart grid technologies and energy storage systems</p>
                <div class="impact-badge">30% efficiency improvement</div>
            </div>
        `;
    }

    updateTimeLensData(year, location = 'pretoria') {
        // Simulate data update based on year and location
        console.log(`Updating Time Lens: ${year}, ${location}`);
        // In a real app, this would fetch new data from NASA APIs
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TerraWeaveDashboard();
});
