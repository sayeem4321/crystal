# Project Overview: Crystal Craft BD Website

This project is a static website for the "Crystal Craft BD" Minecraft server, served by a Node.js application using the Express.js framework. Its primary purpose is to provide essential information about the Minecraft server, including joining instructions, details on various ranks and their benefits, voting links, and access to the server's Discord community.

The Node.js application is designed to function as an HTTP server that efficiently delivers static content. It is intended to be deployed behind an Nginx reverse proxy, which will handle HTTPS termination, domain routing, and act as the public-facing entry point for the website.

## Key Files:

*   **`package.json`**: Defines the project's metadata, scripts, and lists Node.js dependencies, notably `express`.
*   **`server.js`**: This is the core Express.js application entry point. It's responsible for:
    *   Serving all HTML pages (`/`, `/join`, `/ranks`, `/vote`, `/discord`).
    *   Serving static assets like `style.css`, `script.js`, and files from the `assets/` directory.
    *   Implementing request logging, basic security headers, and trusting proxy headers (for Nginx integration).
    *   Handling 404 (Not Found) and 500 (Internal Server Error) responses with custom pages.
*   **`index.html`**: The main landing page of the website.
*   **`join.html`**: Provides instructions on how to connect to the Minecraft server.
*   **`ranks.html`**: Displays information about different donor ranks available on the server and their associated benefits.
*   **`vote.html`**: Contains links to various Minecraft server listing sites where users can vote for Crystal Craft BD.
*   **`discord.html`**: Details about the server's Discord community, including an invitation link.
*   **`script.js`**: Client-side JavaScript file that implements dynamic functionalities such as fetching live server status and player counts (from `api.mcsrvstat.us`), copying the server IP to the clipboard, and managing interactive modals (for rank details).
*   **`style.css`**: The global CSS stylesheet that defines the visual design and layout for the entire website.
*   **`assets/`**: A directory that stores various static assets, primarily images used throughout the website.

## Building and Running:

### Dependencies:

The project relies on `express` as its primary Node.js framework.

### Installation:

Ensure Node.js and npm (Node Package Manager) are installed on your system. Then, install the project dependencies:

```bash
npm install
```

### Running the Server (Development):

To run the server for development purposes, you can execute the `server.js` file directly:

```bash
node server.js
```

### Running the Server (Production with PM2):

For production environments, the project is configured to use `pm2`, a production process manager for Node.js applications, which enables background execution and auto-startup on system reboot.

**Initial Setup & Start:**

```bash
pm2 start server.js --name crystal-site
pm2 save
pm2 startup
```

*   `pm2 start server.js --name crystal-site`: Starts the `server.js` application under the name "crystal-site".
*   `pm2 save`: Saves the current list of PM2 processes, ensuring they are automatically restarted if the system reboots.
*   `pm2 startup`: Generates and configures a system-specific init script (e.g., `systemd` service) to automatically start PM2 and its managed applications on system boot.

**Restarting the Server:**

If you make changes to `server.js` or any other server-side files, you can restart the application gracefully:

```bash
pm2 restart crystal-site
```

**Viewing Logs:**

To monitor the application's output and debug issues, you can view the PM2 logs:

```bash
pm2 logs crystal-site
```

## Development Conventions:

*   The project adheres to a standard web development stack, utilizing plain HTML for structure, CSS for styling, and vanilla JavaScript for client-side interactivity.
*   To ensure robustness when deployed behind a reverse proxy (like Nginx), all static assets (CSS files, JavaScript files, and images within `assets/`) are referenced using **absolute paths** (e.g., `/style.css`, `/script.js`, `/assets/image.png`) within the HTML files.
*   The Node.js `server.js` application is configured to automatically trust proxy headers (such as `X-Forwarded-For`), which is essential for correctly identifying client IP addresses and handling other forwarded information when Nginx is used.
*   The server includes basic request logging to the console and provides user-friendly custom error pages for 404 (Not Found) and 500 (Internal Server Error) HTTP statuses.
