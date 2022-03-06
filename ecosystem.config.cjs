module.exports = {
  apps: [{
    name: 'DD@Home Nodejs',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false
  }]
}
