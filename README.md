{# Firebase Studio - Diff Detective

## Overview

Diff Detective is a Next.js application designed to compare the JSON responses from two different API endpoints. It allows users to input two API URLs, specify the request methods (GET or POST), and provide any necessary request data. The application then fetches the responses, compares them, and provides a summary of the key differences, along with suggestions for potential fixes or reasons for any discrepancies.

This tool leverages Genkit to summarize differences and suggest fixes using AI, making it easier to identify and understand the variations between API responses.

## Modules

The application consists of the following main modules:

### 1. UI Components (`/components/ui`)

-   **ShadCN UI**: Utilizes ShadCN UI components for a modern and consistent user interface. Key components include:
    -   `Button`: For triggering API comparison and other actions.
    -   `Input` and `Textarea`: For entering API URLs and request data.
    -   `Card`: For structuring the layout and displaying information.
    -   `Select`: For choosing the HTTP method (GET or POST).
    -   `ScrollArea`: For scrollable content within cards.
    -   `AlertDialog`: For confirmation before deleting history entries.

### 2. API Calling Service (`/services/api-caller.ts`)

-   **`callApi`**: Asynchronously fetches data from the provided API endpoints. It handles both `GET` and `POST` requests, including error handling for invalid URLs and network issues.

### 3. AI Flows (`/src/ai/flows`)

-   **`summarize-differences.ts`**: Uses Genkit to summarize the key differences between two JSON responses.
    -   `summarizeDifferences`: A function that takes two JSON responses as input and returns a concise summary of their differences.
-   **`suggest-fixes.ts`**: Employs Genkit to provide suggestions for fixes or reasons for discrepancies between two JSON documents.
    -   `suggestFixes`: A function that takes two JSON strings and their differences as input, returning suggestions for fixes.

### 4. React Components (`/src/app/page.tsx`)

-   **`Home`**: The main component that renders the entire application. It includes:
    -   Two `RequestForm` components for inputting API details.
    -   Buttons to trigger data fetching and comparison.
    -   Cards to display the JSON responses, differences summary, and suggestions.
    -   A history table to show recent API requests.

### 5. History Management (`/components/history-table.tsx`)

-   **`HistoryTable`**: Displays a table of recent API requests, allowing users to load previous requests or delete entries. It stores the history in the local storage.

## Installation

Follow these steps to set up and run the Diff Detective application:

1.  **Clone the repository:**

    ```bash
    git clone [repository URL]
    cd [repository directory]
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**

    -   Create a `.env` file in the root directory of the project.
    -   Add your Google Gemini API key to the `.env` file:

        ```
        GOOGLE_GENAI_API_KEY=YOUR_API_KEY
        ```

    -   Make sure you have a Google Cloud project set up and billing enabled.

4.  **Run Genkit Dev:**

    ```bash
    npm run genkit:dev
    ```

    Or alternatively:

    ```bash
    npm run genkit:watch
    ```

    This will allow Genkit to run in the background.

5.  **Start the Next.js development server:**

    ```bash
    npm run dev
    ```

    This command starts the application on `http://localhost:9002`.

## Execution

1.  **Open the application in your browser:**

    Navigate to `http://localhost:9002` to access the Diff Detective application.

2.  **Enter API details:**

    -   In the "Request 1" and "Request 2" sections, enter the API URLs, select the request methods (GET or POST), and provide any required request data in JSON format.

3.  **Compare the responses:**

    -   Click the "Compare" button to fetch data from the APIs and analyze the differences.

4.  **View the results:**

    -   The JSON responses from both APIs will be displayed in the "Response 1" and "Response 2" cards.
    -   The summary of key differences will be shown in the "Differences Summary" card.
    -   Suggestions for fixes or reasons for discrepancies will be provided in the "Suggestions" card.

5.  **Manage History:**

    -   The application stores recent API requests in the "History" section.
    -   Click "Load" to load the details of a previous request into the "Request 1" form.
    -   Click "Delete" to remove an entry from the history.

## Genkit Configuration

This application uses Genkit for AI-powered features. The Genkit configuration is located in `src/ai/ai-instance.ts` and includes:

-   **Plugins**: `@genkit-ai/googleai` for integrating with Google's Gemini API.
-   **Model**: `googleai/gemini-2.0-flash` as the default AI model.
-   **Prompts**: Defined in the `src/ai/flows` directory, used for summarizing differences and suggesting fixes.
