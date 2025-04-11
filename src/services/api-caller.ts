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
    let { url, method, data } = requestDetails;

    if (!url) {
      throw new Error("URL is required");
    }

    console.log('Request body:', JSON.stringify(data, null, 2));

    // Si es GET y data tiene valores, se añaden como parámetros en la URL
    if (method === 'GET' && data && Object.keys(data).length > 0) {
      const params = new URLSearchParams(data).toString();
      url = `${url}?${params}`;
    }

    let response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: method === 'POST' ? (typeof data === 'string' ? data : JSON.stringify(data)) : undefined,
      });
    } catch (fetchError: any) {
      console.error('Fetch error details:', fetchError);
      throw new Error(`Failed to fetch from URL: ${url}. Reason: ${fetchError.message}`);
    }

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorMessage;
      } catch (e) {
        console.warn("Failed to parse error body", e);
      }
      throw new Error(`API request failed with status: ${response.status} - ${errorMessage}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error calling API:', error);
    throw error;
  }
}
