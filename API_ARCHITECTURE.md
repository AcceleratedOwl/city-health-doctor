# API Architecture for CityPulse - Urban Health Monitor
## NASA Space Apps Challenge 2025

This document outlines the free alternative APIs researched to replace the inactive NASA APIs for the CityPulse application.

---

## EXECUTIVE SUMMARY

**Status:** 6/6 API categories researched and alternatives identified
**CORS Issues:** Some APIs require backend proxy for client-side access
**Authentication:** Most APIs are free with minimal or no authentication required
**Rate Limits:** Vary by service, but generally sufficient for demo purposes

---

## 1. POPULATION DENSITY DATA

### Primary Recommendation: **Global Human Settlement Layer (GHSL)**
- **Provider:** European Commission Joint Research Centre
- **Endpoint:** `https://ghsl.jrc.ec.europa.eu/ghs_statuc.php`
- **Authentication:** None required
- **Rate Limits:** Not specified
- **Data Format:** GeoJSON, GeoTIFF
- **Coverage:** Global
- **Sample Request:**
  ```http
  GET https://ghsl.jrc.ec.europa.eu/ghs_statuc.php?layer=GHS_POP_E2015_GLOBE_R2019A&bbox=lon_min,lat_min,lon_max,lat_max&format=GeoJSON
  ```
- **Sample Response:**
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": { "type": "Point", "coordinates": [lon, lat] },
        "properties": {
          "population": 12345,
          "density": 250.5
        }
      }
    ]
  }
  ```

### Alternative: **WorldPop API**
- **Provider:** WorldPop
- **Endpoint:** `https://www.worldpop.org/rest/data/pop`
- **Authentication:** None required
- **Rate Limits:** Not specified
- **Coverage:** Global
- **Sample Request:**
  ```http
  GET https://www.worldpop.org/rest/data/pop?iso3=USA&year=2020
  ```

### Alternative: **OpenStreetMap Overpass API**
- **Provider:** OpenStreetMap Foundation
- **Endpoint:** `https://overpass-api.de/api/interpreter`
- **Authentication:** None required
- **Rate Limits:** 2,000 queries per minute
- **Coverage:** Global
- **Sample Request:**
  ```http
  POST https://overpass-api.de/api/interpreter
  Content-Type: text/plain
  
  [out:json];
  node["place"="city"](50.6,7.0,50.8,7.3);
  out;
  ```

**Recommendation Rationale:** GHSL provides the most comprehensive global population density data with no authentication requirements and excellent coverage.

---

## 2. AIR QUALITY DATA (NO₂, PM₂.₅, O₃)

### Primary Recommendation: **OpenAQ API**
- **Provider:** OpenAQ
- **Endpoint:** `https://api.openaq.org/v1/latest`
- **Authentication:** None required
- **Rate Limits:** Not specified
- **Coverage:** Global
- **Sample Request:**
  ```http
  GET https://api.openaq.org/v1/latest?coordinates=34.0522,-118.2437
  ```
- **Sample Response:**
  ```json
  {
    "results": [
      {
        "location": "Los Angeles",
        "measurements": [
          {
            "parameter": "pm25",
            "value": 12.3,
            "unit": "µg/m³",
            "lastUpdated": "2024-01-15T10:30:00Z"
          },
          {
            "parameter": "no2",
            "value": 45.6,
            "unit": "µg/m³",
            "lastUpdated": "2024-01-15T10:30:00Z"
          }
        ]
      }
    ]
  }
  ```

### Alternative: **OpenWeatherMap Air Pollution API**
- **Provider:** OpenWeatherMap
- **Endpoint:** `https://api.openweathermap.org/data/2.5/air_pollution`
- **Authentication:** API key required (free tier: 1,000,000 calls/month)
- **Rate Limits:** 60 calls per minute
- **Coverage:** Global
- **Sample Request:**
  ```http
  GET https://api.openweathermap.org/data/2.5/air_pollution?lat=34.0522&lon=-118.2437&appid=YOUR_API_KEY
  ```

### Alternative: **World Air Quality Index (WAQI) API**
- **Provider:** World Air Quality Index
- **Endpoint:** `https://api.waqi.info/feed/{city}/`
- **Authentication:** API key required (free registration)
- **Rate Limits:** Not specified
- **Coverage:** Global
- **Sample Request:**
  ```http
  GET https://api.waqi.info/feed/losangeles/?token=YOUR_API_KEY
  ```

**Recommendation Rationale:** OpenAQ provides the most comprehensive global air quality data without authentication, making it ideal for our application.

---

## 3. NATURAL DISASTERS/EVENTS DATA

### Primary Recommendation: **USGS Earthquake API**
- **Provider:** U.S. Geological Survey
- **Endpoint:** `https://earthquake.usgs.gov/fdsnws/event/1/query`
- **Authentication:** None required
- **Rate Limits:** Not specified
- **Coverage:** Global
- **Sample Request:**
  ```http
  GET https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-01-01&endtime=2024-01-31&minlatitude=30&maxlatitude=50&minlongitude=-130&maxlongitude=-100
  ```
- **Sample Response:**
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "mag": 4.5,
          "place": "California",
          "time": 1704067200000,
          "updated": 1704067200000,
          "url": "https://earthquake.usgs.gov/earthquakes/eventpage/ci12345678",
          "detail": "https://earthquake.usgs.gov/fdsnws/event/1/query?eventid=ci12345678&format=geojson",
          "felt": 25,
          "cdi": 3.4,
          "mmi": 2.1,
          "alert": "green",
          "status": "reviewed",
          "tsunami": 0,
          "sig": 312,
          "net": "ci",
          "code": "12345678",
          "ids": ",ci12345678,",
          "sources": ",ci,",
          "types": ",dyfi,origin,phase-data,",
          "nst": 35,
          "dmin": 0.234,
          "rms": 0.67,
          "gap": 45,
          "magType": "ml",
          "type": "earthquake",
          "title": "M 4.5 - 5km ENE of Los Angeles, CA"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-118.2437, 34.0522, 5.2]
        },
        "id": "ci12345678"
      }
    ]
  }
  ```

### Alternative: **Global Disaster Alert and Coordination System (GDACS) API**
- **Provider:** United Nations
- **Endpoint:** `https://www.gdacs.org/xml/rss.xml`
- **Authentication:** None required
- **Rate Limits:** Not specified
- **Coverage:** Global
- **Data Format:** RSS/XML

### Alternative: **NOAA Weather API**
- **Provider:** National Oceanic and Atmospheric Administration
- **Endpoint:** `https://api.weather.gov/alerts`
- **Authentication:** None required
- **Rate Limits:** Not specified
- **Coverage:** United States
- **Sample Request:**
  ```http
  GET https://api.weather.gov/alerts?point=34.0522,-118.2437
  ```

**Recommendation Rationale:** USGS Earthquake API provides the most reliable and comprehensive earthquake data globally with no authentication requirements.

---

## 4. URBAN HEAT ISLAND/TEMPERATURE DATA

### Primary Recommendation: **NASA GIBS WMTS (MODIS Thermal)**
- **Provider:** NASA
- **Endpoint:** `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_LST_Day/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.png`
- **Authentication:** None required
- **Rate Limits:** Not specified
- **Coverage:** Global
- **Data Format:** PNG tiles
- **Sample Request:**
  ```http
  GET https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_LST_Day/default/2024-01-15/GoogleMapsCompatible_Level9/5/10/10.png
  ```

### Alternative: **OpenWeatherMap API**
- **Provider:** OpenWeatherMap
- **Endpoint:** `https://api.openweathermap.org/data/2.5/weather`
- **Authentication:** API key required (free tier: 60 calls/minute)
- **Rate Limits:** 60 calls per minute
- **Coverage:** Global
- **Sample Request:**
  ```http
  GET https://api.openweathermap.org/data/2.5/weather?lat=34.0522&lon=-118.2437&appid=YOUR_API_KEY
  ```
- **Sample Response:**
  ```json
  {
    "main": {
      "temp": 295.15,
      "feels_like": 297.15,
      "temp_min": 293.15,
      "temp_max": 297.15,
      "pressure": 1013,
      "humidity": 65
    },
    "coord": {
      "lon": -118.2437,
      "lat": 34.0522
    },
    "name": "Los Angeles"
  }
  ```

### Alternative: **Global Urban Heat Island Dataset**
- **Provider:** Data.gov
- **Access:** `https://catalog.data.gov/dataset/global-urban-heat-island-uhi-data-set-2013`
- **Authentication:** None required
- **Coverage:** Global
- **Data Format:** GeoTIFF, Shapefile

**Recommendation Rationale:** NASA GIBS WMTS provides the most comprehensive thermal data for urban heat island analysis with no authentication requirements.

---

## 5. VEGETATION/GREEN SPACE DATA

### Primary Recommendation: **NASA GIBS WMTS (NDVI Layers)**
- **Provider:** NASA
- **Endpoint:** `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.png`
- **Authentication:** None required
- **Rate Limits:** Not specified
- **Coverage:** Global
- **Data Format:** PNG tiles
- **Sample Request:**
  ```http
  GET https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI/default/2024-01-15/GoogleMapsCompatible_Level9/5/10/10.png
  ```

### Alternative: **Sentinel Hub API**
- **Provider:** Sentinel Hub
- **Endpoint:** `https://services.sentinel-hub.com/ogc/wms/{INSTANCE_ID}`
- **Authentication:** API key required (free tier available)
- **Rate Limits:** Depends on subscription plan
- **Coverage:** Global
- **Sample Request:**
  ```http
  GET https://services.sentinel-hub.com/ogc/wms/YOUR_INSTANCE_ID?REQUEST=GetMap&LAYERS=NDVI&FORMAT=image/png&BBOX=16.0,48.0,16.1,48.1&WIDTH=512&HEIGHT=512&SRS=EPSG:4326
  ```

### Alternative: **Normalized Difference Urban Index (NDUI)**
- **Provider:** AWS Open Data Registry
- **Access:** `https://registry.opendata.aws/tag/urban/`
- **Authentication:** None required
- **Coverage:** Global
- **Data Format:** GeoTIFF

**Recommendation Rationale:** NASA GIBS WMTS NDVI layers provide the most accessible vegetation data with no authentication requirements.

---

## 6. NIGHTTIME LIGHTS/TRAFFIC FLOW DATA

### Primary Recommendation: **NASA GIBS WMTS (VIIRS Nighttime Lights)**
- **Provider:** NASA
- **Endpoint:** `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CityLights_2012/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg`
- **Authentication:** None required
- **Rate Limits:** Not specified
- **Coverage:** Global
- **Data Format:** JPEG tiles
- **Sample Request:**
  ```http
  GET https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CityLights_2012/default/2024-01-15/GoogleMapsCompatible_Level9/5/10/10.jpg
  ```

### Alternative: **OpenStreetMap Traffic Data**
- **Provider:** OpenStreetMap Foundation
- **Endpoint:** `https://overpass-api.de/api/interpreter`
- **Authentication:** None required
- **Rate Limits:** 2,000 queries per minute
- **Coverage:** Global
- **Data Format:** JSON
- **Sample Request:**
  ```http
  POST https://overpass-api.de/api/interpreter
  Content-Type: text/plain
  
  [out:json];
  way["highway"](50.6,7.0,50.8,7.3);
  out;
  ```

### Alternative: **VIIRS Nighttime Lights via NASA Earthdata**
- **Provider:** NASA
- **Access:** `https://search.earthdata.nasa.gov/search?q=VIIRS%20nighttime%20lights`
- **Authentication:** None required for basic access
- **Coverage:** Global
- **Data Format:** GeoTIFF, HDF5

**Recommendation Rationale:** NASA GIBS WMTS VIIRS nighttime lights provide the most comprehensive urban activity data with no authentication requirements.

---

## CORS CONSIDERATIONS

### APIs Requiring Backend Proxy:
1. **OpenWeatherMap APIs** - CORS restrictions
2. **WAQI API** - CORS restrictions  
3. **Sentinel Hub API** - CORS restrictions
4. **Some OSM Overpass queries** - Rate limiting

### APIs with Direct Client Access:
1. **OpenAQ API** - No CORS issues
2. **USGS Earthquake API** - No CORS issues
3. **NASA GIBS WMTS** - No CORS issues
4. **GHSL API** - No CORS issues

---

## IMPLEMENTATION RECOMMENDATIONS

### Phase 1 Implementation Priority:
1. **Start with CORS-free APIs:** OpenAQ, USGS, NASA GIBS WMTS, GHSL
2. **Implement backend proxy** for OpenWeatherMap and WAQI
3. **Add caching layer** for all APIs (5-minute TTL)
4. **Implement rate limiting** and exponential backoff

### Backend Proxy Requirements:
- **Node.js/Express server** for API proxying
- **Environment variables** for API keys
- **CORS headers** configuration
- **Request caching** with Redis or in-memory store
- **Rate limiting** middleware

### Data Processing Pipeline:
1. **Raw API Response** → **Data Transformation** → **Health Scoring** → **CityVitals Format**
2. **Error Handling:** Graceful degradation for missing data
3. **Data Validation:** Ensure data quality and completeness
4. **Caching Strategy:** 5-minute TTL for real-time data, 24-hour TTL for static data

---

## NEXT STEPS

1. **Approve this API architecture**
2. **Set up backend proxy server** for CORS-restricted APIs
3. **Implement API service classes** with error handling
4. **Create data transformation utilities**
5. **Begin Phase 2: Core Application Development**

---

## APPENDIX: API TESTING CHECKLIST

- [ ] Test OpenAQ API with sample coordinates
- [ ] Test USGS Earthquake API with date ranges
- [ ] Test NASA GIBS WMTS tile requests
- [ ] Test GHSL API with bounding boxes
- [ ] Verify CORS policies for all APIs
- [ ] Test rate limiting and error handling
- [ ] Validate data formats and schemas
- [ ] Test error scenarios and edge cases

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Ready for Review
