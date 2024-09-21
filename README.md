# Veldora - Discord Verification Bot

![Veldora Logo](https://i.ibb.co/vvsYRgQ/Untitled-design-5.png)

## About

**Veldora** is a powerful and customizable verification bot for Discord servers. It helps manage member access by requiring users to complete a verification process before gaining full access to the server. Veldora is designed to enhance server security by preventing spam and ensuring only legitimate users gain entry.

## Features

- 🔒 **Captcha Verification**: Uses visual captcha to confirm human users and block bots.
- 🛡️ **Role Assignment**: Automatically assigns verified and unverified roles based on user actions.
- ⚙️ **Easy Setup**: Simple command-based configuration for server admins.
- 🚫 **Disable Feature**: Easily disable the verification system when not needed.
- 📊 **MongoDB Integration**: Efficient and reliable storage of server configurations and user data.

## Packages Used

- [`discord.js`](https://www.npmjs.com/package/discord.js) - A powerful library for interacting with the Discord API.
- [`captcha-canvas`](https://www.npmjs.com/package/captcha-canvas) - A library for generating customizable captcha images.
- [`canvas`](https://www.npmjs.com/package/canvas) - A Node.js implementation of the Canvas API.
- [`mongodb`](https://www.npmjs.com/package/mongodb) - Official MongoDB driver for Node.js.
- [`glob`](https://www.npmjs.com/package/glob) - A pattern-matching library for file paths.
- [`request`](https://www.npmjs.com/package/request) - A simplified HTTP request client.
- [`uuid`](https://www.npmjs.com/package/uuid) - (Optional) For generating unique identifiers.

## Commands

### `!setup`
Initiates the setup process for the verification system.

- **Usage**: `!setup`
- **Description**: Starts the verification setup wizard, where you can define the verification code, roles, and verification channel.
- **Permissions Required**: Administrator

### `!setup --disable`
Disables the verification system for the server.

- **Usage**: `!setup --disable`
- **Description**: Removes the verification settings from the server.
- **Permissions Required**: Administrator

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.9.0 or higher)
- [MongoDB](https://www.mongodb.com/) database
- Proper permissions to manage roles and channels in your Discord server

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/veldora.git
   cd veldora
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   TOKEN=your-bot-token
   MONGODB_URI=your-mongodb-connection-string
   ```

4. **Run the Bot**
   ```bash
   npm start
   ```

## Usage

1. **Invite the Bot to Your Server**
   Veldora is still in development so it's not ready to be used.

2. **Setup Verification**
   - Run `!setup` in the server to initiate the setup process.
   - Follow the prompts to configure your verification code, roles, and channel.

3. **Disable Verification**
   - Run `!setup --disable` to disable the verification system.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for any bugs or feature requests.

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For support, questions, or suggestions, feel free to join our [Discord Support Server](https://discord.gg/ABUaV7gkju)
