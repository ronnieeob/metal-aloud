const config = {
  apps: [{
    name: 'metal-aloud',
    script: './dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3002,  // Changed to avoid conflicts
      HOST: 'srv685290.hstgr.cloud'
    },
    error_file: '/home/hstgr-srv685290/logs/metal-aloud-error.log',
    out_file: '/home/hstgr-srv685290/logs/metal-aloud-out.log',
    time: true,
    max_memory_restart: '500M',
    restart_delay: 3000,
    wait_ready: true,
    kill_timeout: 5000,
    watch: false
    }
  }]
};

module.exports = config;