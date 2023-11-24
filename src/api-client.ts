import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

function isDateOlderThan3Minutes(date: Date | undefined): boolean {
  if (!date) {
    return true;
  }
  const currentTime = new Date();
  const timeDifferenceInMillis = currentTime.getTime() - date.getTime();
  const threeMinutesInMillis = 3 * 60 * 1000; // 3 minutes in milliseconds

  return timeDifferenceInMillis > threeMinutesInMillis;
}

class ApiClient {
  private cashin: AxiosInstance;
  private cashout: AxiosInstance;
  private auth: AxiosInstance;
  private ledge: AxiosInstance;
  private bearerToken: string | undefined;
  private bearerTokenSince: Date | undefined;

  private cToken: string
  constructor(domain: string, apiKey: string, timeout = 5000) {
    // Create an Axios instance with base URL or other configurations
    this.cToken = apiKey;
    this.cashin = axios.create({
      baseURL: `https://cashin.${domain}`, // Replace with your API base URL
      timeout, // Set a suitable timeout value
    });

    this.cashout = axios.create({
      baseURL: `https://cashout.${domain}`, // Replace with your API base URL
      timeout, // Set a suitable timeout value
    });

    this.ledge = axios.create({
      baseURL: `https://ledge.${domain}`, // Replace with your API base URL
      timeout, // Set a suitable timeout value
    });

    this.auth = axios.create({
      baseURL: `https://auth.${domain}`, // Replace with your API base URL
      timeout, // Set a suitable timeout value
    });
  }

  // Method to perform a "create" operation
  async exchangeToken(): Promise<any> {
    try {
      const response: AxiosResponse = await this.auth.post(
        '/auth',
        {},
        {
          headers: {
            'c-token': this.cToken
          }
        }
      );
      return response.data.access_token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('API Error:', axiosError.message);
      }
      throw error;
    }
  }

  // this function is checking if the bearer token exists and if is valid one
  async revalidateToken() {
    if (!this.bearerToken || isDateOlderThan3Minutes(this.bearerTokenSince)) {
      this.bearerToken = await this.exchangeToken();
      this.bearerTokenSince = new Date();
    }
  }

  // Method to perform a "create" operation
  // in this example I'm calling cashin api
  async askNewItem(data: any): Promise<any> {
    try {
      await this.revalidateToken();
      const response: AxiosResponse = await this.cashin.post('/cashins', data, {
        headers: {
          Authorization: `Bearer ${this.bearerToken}`
        }
      });

      return response.data;
    } catch (error) {
      // Handle AxiosError
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        // You can add custom error handling logic here if needed
        console.error('API Error:', axiosError.message);
      }

      // Rethrow the error so the caller can handle it
      throw error;
    }
  }
}

export default ApiClient;