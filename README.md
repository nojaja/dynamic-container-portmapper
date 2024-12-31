# dynamic-container-portmapper
Port Forwarding with Docker Container Management

This Node.js application provides TCP and UDP port forwarding functionality with dynamic Docker container management based on connection states.

## Features

- TCP and UDP port forwarding
- Dynamic Docker container pause/unpause
- Flexible forwarding rule definition via configuration file
- Container management based on connection states

## Prerequisites

- Node.js v11.13.0
- Docker daemon running with appropriate permissions
- Webpack v5.74 (for bundling)
- Jest v26.6.3 (for testing)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/port-forwarding-docker.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Configuration

Edit the `rule.json` file to define your forwarding rules and Docker container settings:

```
[
  {
    "containerName": "81b2989f543e",
    "forwardRule": [
      {"Protocol":"udp", "listenPort":19137, "forwardPort":19134, "forwardHost":"localhost"},
      {"Protocol":"udp", "listenPort":19136, "forwardPort":19135, "forwardHost":"localhost", "isTrigger":true},
      {"Protocol":"tcp", "listenPort":7777, "forwardPort":7777, "forwardHost":"localhost"}
    ]
  }
]
```

## Usage

1. Start the application:
   ```
   npm start
   ```

2. To stop the application, press Ctrl+C.

## Building

To create a bundled version of the application:

```
npm run build
```

The bundled file will be created in the `dist` directory.

## Testing

Run the test suite:

```
npm test
```

## License

This project is licensed under the MIT License.
