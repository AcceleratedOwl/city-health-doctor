<<<<<<< HEAD
# CityPulse - Urban Health Monitor
## NASA Space Apps Challenge 2025

CityPulse is an interactive web application that visualizes cities as living organisms using NASA Earth observation data. The app diagnoses urban "health" through various data layers, presenting them as medical vitals.

![CityPulse Demo](https://via.placeholder.com/800x400/1e40af/ffffff?text=CityPulse+Demo)

## Concept Overview

**Core Metaphor:** Cities are living organisms with NASA data as their vital signs
- **Heart Rate** = Traffic flow / Nighttime lights
- **Temperature** = Urban heat islands  
- **Blood Oxygen** = Air quality (NO2, PM2.5)
- **Infections** = Pollution hotspots
- **Immune Response** = Green infrastructure / Vegetation

## Features

- **Interactive Map**: Click anywhere to analyze city health
- **Real-time Vitals**: Live data from multiple NASA and environmental APIs
- **AI Diagnosis**: Natural language health assessment
- **Prescription System**: Actionable recommendations based on global case studies
- **Medical Theme**: EKG-style animations and medical UI design

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Mapping**: Leaflet.js with React-Leaflet
- **Styling**: Tailwind CSS
- **APIs**: OpenAQ, USGS, OpenWeatherMap, NASA GIBS WMTS
- **State Management**: React Context
- **Build Tool**: Create React App

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/citypulse.git
   cd citypulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   REACT_APP_OPENWEATHER_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## API Keys Required

### Required APIs (Free)
- **OpenWeatherMap**: Get your free API key at [openweathermap.org](https://openweathermap.org/api)
  - Rate limit: 60 calls/minute
  - Usage: Weather and temperature data

### Optional APIs (No Authentication Required)
- **OpenAQ**: Air quality data (no key needed)
- **USGS Earthquake**: Natural disaster data (no key needed)
- **NASA GIBS WMTS**: Satellite imagery (no key needed)

## Project Structure

```
citypulse/
├── src/
│   ├── components/
│   │   ├── Map.tsx                 # Interactive map component
│   │   ├── VitalsPanel.tsx         # City vitals dashboard
│   │   └── DiagnosisCard.tsx       # Health diagnosis display
│   ├── services/
│   │   ├── airQualityAPI.ts        # OpenAQ integration
│   │   ├── earthquakeAPI.ts       # USGS integration
│   │   ├── weatherAPI.ts           # OpenWeatherMap integration
│   │   └── diagnosticEngine.ts     # AI health analysis
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── App.tsx                     # Main application
│   └── index.tsx                   # Entry point
├── public/
│   └── index.html                  # HTML template
├── package.json                    # Dependencies
├── tailwind.config.js             # Tailwind configuration
└── README.md                      # This file
```

## Usage

1. **Select a Location**: Click anywhere on the map
2. **Wait for Analysis**: The system fetches real-time data from multiple APIs
3. **Review Vitals**: Check the city's health metrics in the vitals panel
4. **Read Diagnosis**: Get AI-generated health assessment
5. **Follow Prescriptions**: Implement recommended solutions

## 📊 Data Sources

### Active APIs (6/6)
- **OpenAQ API** - Real-time air quality data
- **USGS Earthquake API** - Natural disaster information
- **OpenWeatherMap API** - Weather and temperature data
- **NASA GIBS WMTS** - Satellite imagery (thermal, NDVI, nighttime lights)
- **GHSL API** - Population density data
- **OpenStreetMap** - Geographic data

### Data Processing Pipeline
1. **Raw API Response** → **Data Transformation** → **Health Scoring** → **CityVitals Format**
2. **Error Handling**: Graceful degradation for missing data
3. **Caching**: 5-minute TTL for real-time data
4. **Rate Limiting**: Exponential backoff for failed requests

## Design Features

- **Medical Theme**: Blue/green color palette with medical icons
- **Animations**: Heartbeat effects, pulse animations, smooth transitions
- **Responsive**: Mobile-first design with desktop optimization
- **Accessibility**: ARIA labels, keyboard navigation, color-blind friendly

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Set environment variables in Netlify dashboard

### Manual Deployment
1. Build the project: `npm run build`
2. Upload the `build` folder to your web server
3. Configure environment variables on your server

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **NASA** for Earth observation data and APIs
- **OpenAQ** for air quality data aggregation
- **USGS** for earthquake and natural disaster data
- **OpenWeatherMap** for weather data
- **Leaflet** for mapping capabilities
- **React** and **TypeScript** communities


---

**Built with ❤️ for NASA Space Apps Challenge 2025**
=======
# city-health-doctor
>>>>>>> e2a441948327219e8e4a3adb482ba57fc79d25d8
