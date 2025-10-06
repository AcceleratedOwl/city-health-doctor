import { APITester } from '../services/apiTester';
import { DataValidator } from '../services/dataValidator';
import { MockDataService } from '../services/mockDataService';
import { CacheManager } from '../services/cacheManager';

export interface TestSuite {
  name: string;
  tests: TestCase[];
  results: TestResult[];
  overallStatus: 'pass' | 'fail' | 'partial';
  timestamp: number;
}

export interface TestCase {
  name: string;
  description: string;
  test: () => Promise<TestResult>;
}

export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration: number;
  details?: any;
}

export class TestRunner {
  private apiTester: APITester;
  private cacheManager: CacheManager;

  constructor() {
    this.apiTester = new APITester();
    this.cacheManager = new CacheManager();
  }

  /**
   * Run all test suites
   */
  async runAllTests(): Promise<TestSuite[]> {
    const suites = [
      await this.runAPITests(),
      await this.runDataValidationTests(),
      await this.runMockDataTests(),
      await this.runCacheTests()
    ];

    return suites;
  }

  /**
   * Run API tests
   */
  async runAPITests(): Promise<TestSuite> {
    const tests: TestCase[] = [
      {
        name: 'testAirQualityAPI',
        description: 'Test OpenAQ Air Quality API',
        test: async () => {
          const startTime = Date.now();
          try {
            const result = await this.apiTester.testSingleAPI('airQuality', 34.0522, -118.2437);
            const duration = Date.now() - startTime;
            
            if (result.status === 'success') {
              return {
                name: 'testAirQualityAPI',
                status: 'pass',
                message: 'Air Quality API test passed',
                duration,
                details: result
              };
            } else {
              return {
                name: 'testAirQualityAPI',
                status: 'fail',
                message: `Air Quality API test failed: ${result.errorMessage}`,
                duration,
                details: result
              };
            }
          } catch (error) {
            return {
              name: 'testAirQualityAPI',
              status: 'fail',
              message: `Air Quality API test error: ${error}`,
              duration: Date.now() - startTime
            };
          }
        }
      },
      {
        name: 'testEarthquakeAPI',
        description: 'Test USGS Earthquake API',
        test: async () => {
          const startTime = Date.now();
          try {
            const result = await this.apiTester.testSingleAPI('earthquake', 34.0522, -118.2437);
            const duration = Date.now() - startTime;
            
            if (result.status === 'success') {
              return {
                name: 'testEarthquakeAPI',
                status: 'pass',
                message: 'Earthquake API test passed',
                duration,
                details: result
              };
            } else {
              return {
                name: 'testEarthquakeAPI',
                status: 'fail',
                message: `Earthquake API test failed: ${result.errorMessage}`,
                duration,
                details: result
              };
            }
          } catch (error) {
            return {
              name: 'testEarthquakeAPI',
              status: 'fail',
              message: `Earthquake API test error: ${error}`,
              duration: Date.now() - startTime
            };
          }
        }
      },
      {
        name: 'testWeatherAPI',
        description: 'Test OpenWeatherMap API',
        test: async () => {
          const startTime = Date.now();
          try {
            const result = await this.apiTester.testSingleAPI('weather', 34.0522, -118.2437);
            const duration = Date.now() - startTime;
            
            if (result.status === 'success') {
              return {
                name: 'testWeatherAPI',
                status: 'pass',
                message: 'Weather API test passed',
                duration,
                details: result
              };
            } else {
              return {
                name: 'testWeatherAPI',
                status: 'fail',
                message: `Weather API test failed: ${result.errorMessage}`,
                duration,
                details: result
              };
            }
          } catch (error) {
            return {
              name: 'testWeatherAPI',
              status: 'fail',
              message: `Weather API test error: ${error}`,
              duration: Date.now() - startTime
            };
          }
        }
      }
    ];

    const results: TestResult[] = [];
    
    for (const testCase of tests) {
      try {
        const result = await testCase.test();
        results.push(result);
      } catch (error) {
        results.push({
          name: testCase.name,
          status: 'fail',
          message: `Test execution error: ${error}`,
          duration: 0
        });
      }
    }

    const passCount = results.filter(r => r.status === 'pass').length;
    const overallStatus = passCount === results.length ? 'pass' : 
                         passCount > 0 ? 'partial' : 'fail';

    return {
      name: 'API Tests',
      tests,
      results,
      overallStatus,
      timestamp: Date.now()
    };
  }

  /**
   * Run data validation tests
   */
  async runDataValidationTests(): Promise<TestSuite> {
    const tests: TestCase[] = [
      {
        name: 'testLocationValidation',
        description: 'Test location data validation',
        test: async () => {
          const startTime = Date.now();
          try {
            const validLocation = { lat: 34.0522, lon: -118.2437, timestamp: Date.now() };
            const invalidLocation = { lat: 200, lon: -118.2437, timestamp: Date.now() };
            
            const validResult = DataValidator.validateLocation(validLocation);
            const invalidResult = DataValidator.validateLocation(invalidLocation);
            
            const duration = Date.now() - startTime;
            
            if (validResult.isValid && !invalidResult.isValid) {
              return {
                name: 'testLocationValidation',
                status: 'pass',
                message: 'Location validation working correctly',
                duration,
                details: { validResult, invalidResult }
              };
            } else {
              return {
                name: 'testLocationValidation',
                status: 'fail',
                message: 'Location validation not working correctly',
                duration,
                details: { validResult, invalidResult }
              };
            }
          } catch (error) {
            return {
              name: 'testLocationValidation',
              status: 'fail',
              message: `Location validation test error: ${error}`,
              duration: Date.now() - startTime
            };
          }
        }
      },
      {
        name: 'testVitalsValidation',
        description: 'Test city vitals validation',
        test: async () => {
          const startTime = Date.now();
          try {
            const mockVitals = MockDataService.generateMockVitals({
              lat: 34.0522,
              lon: -118.2437,
              timestamp: Date.now()
            });
            
            const validation = DataValidator.validateCityVitals(mockVitals);
            const duration = Date.now() - startTime;
            
            if (validation.isValid) {
              return {
                name: 'testVitalsValidation',
                status: 'pass',
                message: 'Vitals validation passed',
                duration,
                details: validation
              };
            } else {
              return {
                name: 'testVitalsValidation',
                status: 'fail',
                message: `Vitals validation failed: ${validation.errors.join(', ')}`,
                duration,
                details: validation
              };
            }
          } catch (error) {
            return {
              name: 'testVitalsValidation',
              status: 'fail',
              message: `Vitals validation test error: ${error}`,
              duration: Date.now() - startTime
            };
          }
        }
      }
    ];

    const results: TestResult[] = [];
    
    for (const testCase of tests) {
      try {
        const result = await testCase.test();
        results.push(result);
      } catch (error) {
        results.push({
          name: testCase.name,
          status: 'fail',
          message: `Test execution error: ${error}`,
          duration: 0
        });
      }
    }

    const passCount = results.filter(r => r.status === 'pass').length;
    const overallStatus = passCount === results.length ? 'pass' : 
                         passCount > 0 ? 'partial' : 'fail';

    return {
      name: 'Data Validation Tests',
      tests,
      results,
      overallStatus,
      timestamp: Date.now()
    };
  }

  /**
   * Run mock data tests
   */
  async runMockDataTests(): Promise<TestSuite> {
    const tests: TestCase[] = [
      {
        name: 'testMockDataGeneration',
        description: 'Test mock data generation',
        test: async () => {
          const startTime = Date.now();
          try {
            const location = { lat: 34.0522, lon: -118.2437, timestamp: Date.now() };
            const mockVitals = MockDataService.generateMockVitals(location);
            
            const duration = Date.now() - startTime;
            
            if (mockVitals && mockVitals.heartRate && mockVitals.temperature) {
              return {
                name: 'testMockDataGeneration',
                status: 'pass',
                message: 'Mock data generation working',
                duration,
                details: mockVitals
              };
            } else {
              return {
                name: 'testMockDataGeneration',
                status: 'fail',
                message: 'Mock data generation failed',
                duration
              };
            }
          } catch (error) {
            return {
              name: 'testMockDataGeneration',
              status: 'fail',
              message: `Mock data test error: ${error}`,
              duration: Date.now() - startTime
            };
          }
        }
      }
    ];

    const results: TestResult[] = [];
    
    for (const testCase of tests) {
      try {
        const result = await testCase.test();
        results.push(result);
      } catch (error) {
        results.push({
          name: testCase.name,
          status: 'fail',
          message: `Test execution error: ${error}`,
          duration: 0
        });
      }
    }

    const passCount = results.filter(r => r.status === 'pass').length;
    const overallStatus = passCount === results.length ? 'pass' : 
                         passCount > 0 ? 'partial' : 'fail';

    return {
      name: 'Mock Data Tests',
      tests,
      results,
      overallStatus,
      timestamp: Date.now()
    };
  }

  /**
   * Run cache tests
   */
  async runCacheTests(): Promise<TestSuite> {
    const tests: TestCase[] = [
      {
        name: 'testCacheOperations',
        description: 'Test cache set/get operations',
        test: async () => {
          const startTime = Date.now();
          try {
            const testKey = 'test_key';
            const testData = { test: 'data' };
            
            this.cacheManager.set(testKey, testData);
            const retrieved = this.cacheManager.get(testKey);
            
            const duration = Date.now() - startTime;
            
            if (retrieved && JSON.stringify(retrieved) === JSON.stringify(testData)) {
              return {
                name: 'testCacheOperations',
                status: 'pass',
                message: 'Cache operations working correctly',
                duration,
                details: { testKey, testData, retrieved }
              };
            } else {
              return {
                name: 'testCacheOperations',
                status: 'fail',
                message: 'Cache operations failed',
                duration,
                details: { testKey, testData, retrieved }
              };
            }
          } catch (error) {
            return {
              name: 'testCacheOperations',
              status: 'fail',
              message: `Cache test error: ${error}`,
              duration: Date.now() - startTime
            };
          }
        }
      }
    ];

    const results: TestResult[] = [];
    
    for (const testCase of tests) {
      try {
        const result = await testCase.test();
        results.push(result);
      } catch (error) {
        results.push({
          name: testCase.name,
          status: 'fail',
          message: `Test execution error: ${error}`,
          duration: 0
        });
      }
    }

    const passCount = results.filter(r => r.status === 'pass').length;
    const overallStatus = passCount === results.length ? 'pass' : 
                         passCount > 0 ? 'partial' : 'fail';

    return {
      name: 'Cache Tests',
      tests,
      results,
      overallStatus,
      timestamp: Date.now()
    };
  }

  /**
   * Generate test report
   */
  generateReport(suites: TestSuite[]): string {
    let report = '# CityPulse Test Report\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    suites.forEach(suite => {
      report += `## ${suite.name}\n\n`;
      report += `Status: ${suite.overallStatus.toUpperCase()}\n\n`;
      
      suite.results.forEach(result => {
        const status = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
        report += `- ${status} ${result.name}: ${result.message} (${result.duration}ms)\n`;
      });
      
      report += '\n';
    });
    
    const totalTests = suites.reduce((sum, suite) => sum + suite.results.length, 0);
    const passedTests = suites.reduce((sum, suite) => 
      sum + suite.results.filter(r => r.status === 'pass').length, 0);
    
    report += `## Summary\n\n`;
    report += `Total Tests: ${totalTests}\n`;
    report += `Passed: ${passedTests}\n`;
    report += `Failed: ${totalTests - passedTests}\n`;
    report += `Success Rate: ${Math.round((passedTests / totalTests) * 100)}%\n`;
    
    return report;
  }
}
