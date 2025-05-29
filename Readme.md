# Request Catcher

A simple web tool to catch and inspect HTTP requests sent to unique catcher endpoints.

## Project Structure

- **request_catcher_backend/**:  
  Django REST Framework API that manages catcher endpoints and stores incoming requests.

- **request-catcher-frontend/**:  
  React application that allows users to create catcher URLs, view recent requests, and inspect request details.

## Features

- Generate unique catcher URLs to receive HTTP requests.
- View latest requests with detailed headers, body, and metadata.
- Logs auto-refresh every few seconds.
- Collapsible request details for easy inspection.
