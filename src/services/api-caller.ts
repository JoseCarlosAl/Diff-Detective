/**
 * Represents the details of an API request, including URL, method, and data.
 */
export interface ApiRequest {
  /**
   * The URL to which the request should be sent.
   */
  url: string;
  /**
   * The HTTP method to use for the request (e.g., 'GET', 'POST').
   */
  method: 'GET' | 'POST';
  /**
   * The data to send with the request (for POST, PUT, etc.).
   */
  data: any;
}

/**
 * Asynchronously sends an API request and returns the JSON response.
 *
 * @param requestDetails The details of the API request to send.
 * @returns A promise that resolves to the JSON response from the API.
 */
export async function callApi(requestDetails: ApiRequest): Promise<any> {
  try {
    const { url, method, data } = requestDetails;

    // Check if the URL is valid before making the fetch request
    if (!url) {
      throw new Error("URL is required");
    }

    let response;
    try {
      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify(data) : undefined,
      });
    } catch (fetchError: any) {
      // This catch specifically handles network errors or issues during the fetch process
      throw new Error(`Failed to fetch from URL: ${url}. Reason: ${fetchError.message}`);
    }

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error calling API:', error);
    throw error;
  }
}
