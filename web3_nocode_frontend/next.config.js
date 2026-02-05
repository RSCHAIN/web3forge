// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // ⚙️ Ignore le module React Native non compatible côté web
    config.resolve.alias["@react-native-async-storage/async-storage"] = false
    return config
  },
}

module.exports = nextConfig
