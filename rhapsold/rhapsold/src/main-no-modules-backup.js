/**
 * Rhapsold - Main Application Entry Point (No ES6 Modules)
 * A minimalist blogging platform using SVG components
 */

// Placeholder data
const PLACEHOLDER_POSTS = [
  {
    id: 'post-1',
    title: 'The Future of Decentralized Blogging',
    content: `![Decentralized Network](data:image/svg+xml;base64,${btoa(`<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="300" fill="url(#grad1)"/>
      <circle cx="150" cy="100" r="30" fill="#ffffff" opacity="0.8"/>
      <circle cx="450" cy="80" r="25" fill="#ffffff" opacity="0.8"/>
      <circle cx="300" cy="150" r="35" fill="#ffffff" opacity="0.9"/>
      <circle cx="100" cy="200" r="20" fill="#ffffff" opacity="0.7"/>
      <circle cx="500" cy="220" r="28" fill="#ffffff" opacity="0.8"/>
      <line x1="150" y1="100" x2="300" y2="150" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
      <line x1="300" y1="150" x2="450" y2="80" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
      <line x1="300" y1="150" x2="100" y2="200" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
      <line x1="300" y1="150" x2="500" y2="220" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
      <text x="300" y="250" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="24" font-weight="bold">Decentralized Network</text>
    </svg>`)}`)

The landscape of digital publishing is rapidly evolving. With platforms like Rhapsold leading the charge, we're witnessing a paradigm shift toward user-owned content and cryptographic authentication.

This new model empowers writers with **true ownership** of their work while providing readers with authentic, censorship-resistant content. The integration with allyabase services creates a robust ecosystem where creativity and technology converge.

## Key Benefits

- **True content ownership** through cryptographic signatures
- **Decentralized storage** eliminating single points of failure  
- **Direct creator monetization** without platform intermediaries
- **Cross-platform interoperability** through open protocols

> The future of blogging is here, and it's decentralized.

*Ready to join the revolution?*`,
    author: 'Alice Chen',
    timestamp: '2025-01-28T10:30:00Z',
    readTime: '4 min read',
    tags: ['decentralization', 'blogging', 'technology'],
    featuredImage: `data:image/svg+xml;base64,${btoa(`<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#3498db"/>
      <polygon points="100,50 150,100 100,150 50,100" fill="#ffffff" opacity="0.9"/>
      <polygon points="300,40 360,100 300,160 240,100" fill="#ffffff" opacity="0.8"/>
      <rect x="180" y="80" width="40" height="40" fill="#ffffff" opacity="0.7" rx="5"/>
      <circle cx="200" cy="100" r="15" fill="#3498db"/>
      <text x="200" y="180" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="16" font-weight="bold">Blog</text>
    </svg>`)}`
  },
  {
    id: 'post-2', 
    title: 'Understanding sessionless Authentication',
    content: `![Cryptographic Keys](data:image/svg+xml;base64,${btoa(`<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e74c3c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#c0392b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="300" fill="url(#grad2)"/>
      <rect x="100" y="100" width="80" height="60" fill="#ffffff" opacity="0.9" rx="8"/>
      <rect x="420" y="120" width="80" height="60" fill="#ffffff" opacity="0.9" rx="8"/>
      <circle cx="140" cy="130" r="8" fill="#e74c3c"/>
      <circle cx="460" cy="150" r="8" fill="#e74c3c"/>
      <path d="M180 130 Q300 80 420 150" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.8"/>
      <polygon points="410,145 420,150 410,155" fill="#ffffff"/>
      <text x="140" y="170" text-anchor="middle" fill="#2c3e50" font-family="Arial" font-size="10" font-weight="bold">Private</text>
      <text x="460" y="190" text-anchor="middle" fill="#2c3e50" font-family="Arial" font-size="10" font-weight="bold">Public</text>
      <text x="300" y="250" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="24" font-weight="bold">Cryptographic Keys</text>
    </svg>`)}`)

Traditional web authentication relies on usernames, passwords, and session cookies - a model fraught with security vulnerabilities and privacy concerns. **Sessionless authentication** represents a fundamental shift toward cryptographic identity.

## How It Works

Using \`secp256k1\` elliptic curve cryptography, users can authenticate without revealing personal information. Each interaction is signed with a private key, creating an unforgeable digital signature that proves identity without compromising privacy.

### Benefits of Sessionless Auth

This approach eliminates:
- ❌ Password databases vulnerable to breaches
- ❌ Session hijacking attacks  
- ❌ Personal information collection requirements
- ❌ Centralized identity verification

### The Technical Flow

\`\`\`javascript
// Generate cryptographic keypair
const keys = sessionless.generateKeys();

// Sign a message
const signature = sessionless.sign(message, keys.privateKey);

// Verify signature (no secrets shared)
const isValid = sessionless.verify(message, signature, keys.publicKey);
\`\`\`

> The result is a more secure, private, and user-controlled authentication experience.`,
    author: 'Bob Martinez',
    timestamp: '2025-01-27T14:15:00Z',
    readTime: '6 min read',
    tags: ['security', 'authentication', 'cryptography'],
    featuredImage: `data:image/svg+xml;base64,${btoa(`<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#e74c3c"/>
      <circle cx="120" cy="100" r="40" fill="#ffffff" opacity="0.2"/>
      <circle cx="120" cy="100" r="30" fill="#ffffff" opacity="0.4"/>
      <circle cx="120" cy="100" r="20" fill="#ffffff" opacity="0.8"/>
      <rect x="250" y="70" width="100" height="60" fill="#ffffff" opacity="0.9" rx="10"/>
      <circle cx="275" cy="85" r="3" fill="#e74c3c"/>
      <circle cx="285" cy="85" r="3" fill="#e74c3c"/>
      <circle cx="295" cy="85" r="3" fill="#e74c3c"/>
      <rect x="270" y="100" width="50" height="20" fill="#34495e" rx="3"/>
      <text x="200" y="170" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="16" font-weight="bold">Secure Auth</text>
    </svg>`)}`
  },
  {
    id: 'post-3',
    title: 'Building SVG-First Interfaces',
    content: `![SVG Graphics](data:image/svg+xml;base64,${btoa(`<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f39c12;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e67e22;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="300" fill="url(#grad3)"/>
      <rect x="50" y="50" width="120" height="80" fill="#ffffff" opacity="0.9" rx="15"/>
      <rect x="200" y="70" width="80" height="80" fill="#ffffff" opacity="0.8" rx="8"/>
      <circle cx="380" cy="100" r="45" fill="#ffffff" opacity="0.9"/>
      <polygon points="450,60 500,90 500,130 450,160 400,130 400,90" fill="#ffffff" opacity="0.8"/>
      <ellipse cx="320" cy="200" rx="60" ry="30" fill="#ffffff" opacity="0.7"/>
      <path d="M100 200 Q150 160 200 200 T300 200" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.8"/>
      <text x="300" y="270" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="24" font-weight="bold">SVG Interface Design</text>
    </svg>`)}`)

Modern web development often relies on complex CSS frameworks and component libraries. But what if we could build beautiful, scalable interfaces using just **SVG and vanilla JavaScript**?

## Why SVG-First?

SVG-first design offers compelling advantages:

✨ **Perfect scalability** at any resolution  
🎯 **Programmatic control** over every visual element  
📦 **Smaller bundle sizes** compared to CSS frameworks  
🎬 **Built-in animation** capabilities  
♿ **Accessibility** through proper semantic markup  

### A Simple Example

\`\`\`xml
<svg viewBox="0 0 200 100">
  <rect x="10" y="10" width="180" height="80" 
        fill="#3498db" rx="8"/>
  <text x="100" y="55" text-anchor="middle" 
        fill="white" font-size="16">
    Click Me!
  </text>
</svg>
\`\`\`

## Real-World Applications

From simple icons to complex data visualizations, SVG provides the foundation for next-generation web applications.

![SVG Components](data:image/svg+xml;base64,${btoa(`<svg width="500" height="250" xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="250" fill="#9b59b6"/>
      <rect x="50" y="50" width="100" height="40" fill="#ffffff" opacity="0.9" rx="20"/>
      <text x="100" y="75" text-anchor="middle" fill="#9b59b6" font-family="Arial" font-size="14" font-weight="bold">Button</text>
      <rect x="200" y="60" width="120" height="20" fill="#ffffff" opacity="0.8" rx="10"/>
      <rect x="205" y="65" width="60" height="10" fill="#9b59b6" rx="5"/>
      <circle cx="380" cy="70" r="25" fill="#ffffff" opacity="0.9"/>
      <path d="M370 70 L375 75 L390 60" stroke="#9b59b6" stroke-width="3" fill="none"/>
      <rect x="80" y="150" width="340" height="60" fill="#ffffff" opacity="0.1" stroke="#ffffff" stroke-width="2" rx="10"/>
      <text x="250" y="185" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="16">Interactive Components</text>
    </svg>`)}`)

> The future of UI is vector-based, scalable, and programmable.`,
    author: 'Charlie Smith',
    timestamp: '2025-01-26T09:45:00Z',
    readTime: '8 min read',
    tags: ['svg', 'ui-design', 'web-development'],
    featuredImage: `data:image/svg+xml;base64,${btoa(`<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#f39c12"/>
      <rect x="50" y="40" width="60" height="60" fill="#ffffff" opacity="0.9" rx="10"/>
      <circle cx="180" cy="70" r="30" fill="#ffffff" opacity="0.8"/>
      <polygon points="280,40 320,60 320,100 280,120 240,100 240,60" fill="#ffffff" opacity="0.9"/>
      <ellipse cx="120" cy="140" rx="40" ry="20" fill="#ffffff" opacity="0.7"/>
      <path d="M240 140 Q280 120 320 140" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.8"/>
      <text x="200" y="180" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="16" font-weight="bold">SVG UI</text>
    </svg>`)}`
  },
  {
    id: 'post-4',
    title: 'The MAGIC Protocol Explained',
    content: `![MAGIC Protocol](data:image/svg+xml;base64,${btoa(`<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#27ae60;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#229954;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="300" fill="url(#grad4)"/>
      <circle cx="150" cy="100" r="40" fill="#ffffff" opacity="0.9"/>
      <circle cx="450" cy="100" r="40" fill="#ffffff" opacity="0.9"/>
      <circle cx="300" cy="200" r="35" fill="#ffffff" opacity="0.8"/>
      <text x="150" y="108" text-anchor="middle" fill="#27ae60" font-family="Arial" font-size="12" font-weight="bold">Alice</text>
      <text x="450" y="108" text-anchor="middle" fill="#27ae60" font-family="Arial" font-size="12" font-weight="bold">Bob</text>
      <text x="300" y="208" text-anchor="middle" fill="#27ae60" font-family="Arial" font-size="12" font-weight="bold">MAGIC</text>
      <path d="M185 110 Q240 140 265 190" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.8" stroke-dasharray="5,5"/>
      <path d="M415 110 Q360 140 335 190" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.8" stroke-dasharray="5,5"/>
      <polygon points="260,185 265,190 260,195" fill="#ffffff"/>
      <polygon points="340,185 335,190 340,195" fill="#ffffff"/>
      <text x="300" y="50" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="24" font-weight="bold">MAGIC Protocol</text>
      <text x="300" y="270" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="14">Multi-party Consensus</text>
    </svg>`)}`)

**Multi-device Asynchronous Generic Input/output Consensus (MAGIC)** represents a breakthrough in decentralized transaction processing. Unlike traditional payment systems that rely on centralized clearing houses, MAGIC enables direct peer-to-peer value transfer.

## How MAGIC Works

The protocol handles both monetary and non-monetary transactions through a unified interface. Whether you're processing a micropayment, transferring digital assets, or recording consensus decisions, MAGIC provides the infrastructure for trustless interactions.

### Core Features

✅ **Multi-party transaction support**  
⚡ **Asynchronous processing** for improved UX  
🔄 **Generic transaction types** beyond payments  
🤝 **Built-in consensus mechanisms**  
🏦 **Integration** with existing financial systems  

### Transaction Flow

\`\`\`javascript
// Initialize MAGIC transaction
const magic = new MAGICProtocol({
  participants: ['alice', 'bob', 'charlie'],
  type: 'payment_split',
  amount: 100
});

// Process asynchronously
const result = await magic.process();
console.log('Transaction completed:', result.txId);
\`\`\`

![Transaction Flow](data:image/svg+xml;base64,${btoa(`<svg width="500" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="200" fill="#2ecc71"/>
      <rect x="50" y="60" width="80" height="80" fill="#ffffff" opacity="0.9" rx="10"/>
      <rect x="210" y="60" width="80" height="80" fill="#ffffff" opacity="0.9" rx="10"/>
      <rect x="370" y="60" width="80" height="80" fill="#ffffff" opacity="0.9" rx="10"/>
      <text x="90" y="85" text-anchor="middle" fill="#2ecc71" font-family="Arial" font-size="10" font-weight="bold">User A</text>
      <text x="90" y="125" text-anchor="middle" fill="#2ecc71" font-family="Arial" font-size="14" font-weight="bold">💰</text>
      <text x="250" y="85" text-anchor="middle" fill="#2ecc71" font-family="Arial" font-size="10" font-weight="bold">MAGIC</text>
      <text x="250" y="125" text-anchor="middle" fill="#2ecc71" font-family="Arial" font-size="14" font-weight="bold">⚡</text>
      <text x="410" y="85" text-anchor="middle" fill="#2ecc71" font-family="Arial" font-size="10" font-weight="bold">User B</text>
      <text x="410" y="125" text-anchor="middle" fill="#2ecc71" font-family="Arial" font-size="14" font-weight="bold">💰</text>
      <path d="M130 100 L210 100" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.8"/>
      <path d="M290 100 L370 100" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.8"/>
      <polygon points="205,95 210,100 205,105" fill="#ffffff"/>
      <polygon points="365,95 370,100 365,105" fill="#ffffff"/>
      <text x="250" y="30" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="18" font-weight="bold">P2P Transactions</text>
    </svg>`)}`)

> This technology powers the economic layer of the Planet Nine ecosystem.`,
    author: 'Diana Rodriguez',
    timestamp: '2025-01-25T16:20:00Z',
    readTime: '5 min read',
    tags: ['magic', 'payments', 'protocol'],
    featuredImage: `data:image/svg+xml;base64,${btoa(`<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#27ae60"/>
      <circle cx="100" cy="100" r="50" fill="#ffffff" opacity="0.2"/>
      <circle cx="100" cy="100" r="35" fill="#ffffff" opacity="0.4"/>
      <circle cx="100" cy="100" r="20" fill="#ffffff" opacity="0.8"/>
      <polygon points="200,60 240,80 240,120 200,140 160,120 160,80" fill="#ffffff" opacity="0.9"/>
      <text x="200" y="105" text-anchor="middle" fill="#27ae60" font-family="Arial" font-size="12" font-weight="bold">MAGIC</text>
      <circle cx="320" cy="100" r="30" fill="#ffffff" opacity="0.8"/>
      <text x="320" y="105" text-anchor="middle" fill="#27ae60" font-family="Arial" font-size="14" font-weight="bold">💰</text>
      <path d="M150 100 L160 100" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.8"/>
      <path d="M240 100 L290 100" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.8"/>
      <text x="200" y="170" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="16" font-weight="bold">MAGIC Pay</text>
    </svg>`)}`
  },
  {
    id: 'post-5',
    title: 'Cross-Platform Desktop Apps with Tauri',
    content: `![Tauri Logo](data:image/svg+xml;base64,${btoa(`<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8e44ad;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7d3c98;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="300" fill="url(#grad5)"/>
      <rect x="100" y="80" width="120" height="90" fill="#ffffff" opacity="0.9" rx="15"/>
      <rect x="260" y="90" width="80" height="70" fill="#ffffff" opacity="0.8" rx="10"/>
      <rect x="380" y="85" width="100" height="80" fill="#ffffff" opacity="0.9" rx="12"/>
      <text x="160" y="110" text-anchor="middle" fill="#8e44ad" font-family="Arial" font-size="12" font-weight="bold">Windows</text>
      <text x="160" y="130" text-anchor="middle" fill="#8e44ad" font-family="Arial" font-size="20">🪟</text>
      <text x="300" y="115" text-anchor="middle" fill="#8e44ad" font-family="Arial" font-size="12" font-weight="bold">macOS</text>
      <text x="300" y="135" text-anchor="middle" fill="#8e44ad" font-family="Arial" font-size="20">🍎</text>
      <text x="430" y="115" text-anchor="middle" fill="#8e44ad" font-family="Arial" font-size="12" font-weight="bold">Linux</text>
      <text x="430" y="135" text-anchor="middle" fill="#8e44ad" font-family="Arial" font-size="20">🐧</text>
      <text x="300" y="220" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="16" font-weight="bold">⚡ Rust + Web ⚡</text>
      <text x="300" y="50" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="24" font-weight="bold">Tauri Desktop Apps</text>
      <text x="300" y="270" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="14">One Codebase, All Platforms</text>
    </svg>`)}`)

Building desktop applications that work seamlessly across **Windows, macOS, and Linux** has historically required separate codebases or heavyweight frameworks. **Tauri** changes this equation by combining Rust's performance with web technologies' flexibility.

## Why Choose Tauri?

Unlike Electron, which bundles an entire Chromium instance, Tauri leverages the system's native webview. This results in dramatically smaller bundle sizes, better performance, and improved security through Rust's memory safety guarantees.

### Development Benefits

🚀 **10x smaller bundle sizes** compared to Electron  
⚡ **Native performance** through Rust backend  
🔒 **Secure IPC communication**  
🌐 **Web technology** frontend flexibility  
📦 **Built-in updater** and installer  

### Quick Start Example

\`\`\`rust
// src-tauri/src/main.rs
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
\`\`\`

![Tauri Architecture](data:image/svg+xml;base64,${btoa(`<svg width="500" height="250" xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="250" fill="#9b59b6"/>
      <rect x="50" y="60" width="100" height="80" fill="#ffffff" opacity="0.9" rx="10"/>
      <text x="100" y="85" text-anchor="middle" fill="#9b59b6" font-family="Arial" font-size="12" font-weight="bold">HTML/CSS</text>
      <text x="100" y="105" text-anchor="middle" fill="#9b59b6" font-family="Arial" font-size="12" font-weight="bold">JavaScript</text>
      <text x="100" y="125" text-anchor="middle" fill="#9b59b6" font-family="Arial" font-size="20">🌐</text>
      <text x="250" y="100" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="24" font-weight="bold">+</text>
      <rect x="350" y="60" width="100" height="80" fill="#ffffff" opacity="0.9" rx="10"/>
      <text x="400" y="85" text-anchor="middle" fill="#9b59b6" font-family="Arial" font-size="12" font-weight="bold">Rust</text>
      <text x="400" y="105" text-anchor="middle" fill="#9b59b6" font-family="Arial" font-size="12" font-weight="bold">Backend</text>
      <text x="400" y="125" text-anchor="middle" fill="#9b59b6" font-family="Arial" font-size="20">🦀</text>
      <text x="250" y="180" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="24" font-weight="bold">=</text>
      <rect x="200" y="200" width="100" height="40" fill="#ffffff" opacity="0.9" rx="8"/>
      <text x="250" y="225" text-anchor="middle" fill="#9b59b6" font-family="Arial" font-size="14" font-weight="bold">Desktop App</text>
      <text x="250" y="30" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="18" font-weight="bold">Web + Rust = Desktop</text>
    </svg>`)}`)

> For applications like Rhapsold, Tauri provides the perfect balance of development efficiency and runtime performance.`,
    author: 'Eve Johnson',
    timestamp: '2025-01-24T11:10:00Z',
    readTime: '7 min read',
    tags: ['tauri', 'desktop', 'rust', 'cross-platform'],
    featuredImage: `data:image/svg+xml;base64,${btoa(`<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#8e44ad"/>
      <rect x="50" y="50" width="80" height="60" fill="#ffffff" opacity="0.9" rx="8"/>
      <text x="90" y="75" text-anchor="middle" fill="#8e44ad" font-family="Arial" font-size="10" font-weight="bold">Web</text>
      <text x="90" y="95" text-anchor="middle" fill="#8e44ad" font-family="Arial" font-size="16">🌐</text>
      <text x="200" y="80" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="20" font-weight="bold">+</text>
      <rect x="270" y="50" width="80" height="60" fill="#ffffff" opacity="0.9" rx="8"/>
      <text x="310" y="75" text-anchor="middle" fill="#8e44ad" font-family="Arial" font-size="10" font-weight="bold">Rust</text>
      <text x="310" y="95" text-anchor="middle" fill="#8e44ad" font-family="Arial" font-size="16">🦀</text>
      <rect x="160" y="130" width="80" height="50" fill="#ffffff" opacity="0.9" rx="6"/>
      <text x="200" y="155" text-anchor="middle" fill="#8e44ad" font-family="Arial" font-size="12" font-weight="bold">Desktop</text>
      <text x="200" y="170" text-anchor="middle" fill="#8e44ad" font-family="Arial" font-size="14">💻</text>
      <text x="200" y="25" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="16" font-weight="bold">Tauri App</text>
    </svg>`)}`
  }
];

const TELEPORTED_CONTENT = [
  {
    id: 'tp-1',
    type: 'link',
    title: 'Planet Nine Ecosystem Overview',
    description: 'Comprehensive guide to the decentralized web infrastructure',
    url: 'https://planet-nine.org/overview',
    source: 'planet-nine.org',
    timestamp: '2025-01-28T08:00:00Z'
  },
  {
    id: 'tp-2', 
    type: 'image',
    title: 'Allyabase Architecture Diagram',
    description: 'Visual representation of the microservices ecosystem',
    imageUrl: `data:image/svg+xml;base64,${btoa(`<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" fill="#3498db"/>
      <rect x="50" y="50" width="100" height="60" fill="#ffffff" opacity="0.9" rx="8"/>
      <rect x="200" y="80" width="80" height="50" fill="#ffffff" opacity="0.8" rx="6"/>
      <rect x="320" y="60" width="120" height="70" fill="#ffffff" opacity="0.9" rx="10"/>
      <rect x="480" y="90" width="70" height="40" fill="#ffffff" opacity="0.8" rx="5"/>
      <text x="100" y="85" text-anchor="middle" fill="#3498db" font-family="Arial" font-size="10" font-weight="bold">BDO</text>
      <text x="240" y="110" text-anchor="middle" fill="#3498db" font-family="Arial" font-size="10" font-weight="bold">Sanora</text>
      <text x="380" y="100" text-anchor="middle" fill="#3498db" font-family="Arial" font-size="10" font-weight="bold">Dolores</text>
      <text x="515" y="115" text-anchor="middle" fill="#3498db" font-family="Arial" font-size="10" font-weight="bold">Addie</text>
      <line x1="150" y1="80" x2="200" y2="100" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
      <line x1="280" y1="105" x2="320" y2="95" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
      <line x1="440" y1="95" x2="480" y2="110" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
      <text x="300" y="350" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="20" font-weight="bold">Allyabase Architecture</text>
    </svg>`)}`
    source: 'engineering.allyabase.com',
    timestamp: '2025-01-27T15:30:00Z'
  },
  {
    id: 'tp-3',
    type: 'video',
    title: 'Sessionless Demo: Authentication Without Passwords',
    description: '5-minute technical demonstration',
    videoUrl: 'https://example.com/sessionless-demo.mp4',
    thumbnail: `data:image/svg+xml;base64,${btoa(`<svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="225" fill="#e74c3c"/>
      <circle cx="200" cy="112" r="40" fill="#ffffff" opacity="0.9"/>
      <polygon points="185,100 185,124 210,112" fill="#e74c3c"/>
      <rect x="50" y="50" width="60" height="40" fill="#ffffff" opacity="0.7" rx="5"/>
      <rect x="290" y="60" width="60" height="40" fill="#ffffff" opacity="0.7" rx="5"/>
      <text x="80" y="75" text-anchor="middle" fill="#e74c3c" font-family="Arial" font-size="10" font-weight="bold">Key</text>
      <text x="320" y="85" text-anchor="middle" fill="#e74c3c" font-family="Arial" font-size="10" font-weight="bold">Auth</text>
      <path d="M110 70 Q200 40 290 80" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.6"/>
      <text x="200" y="200" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="16" font-weight="bold">Video Demo</text>
    </svg>`)}`
    source: 'tech.sessionless.org',
    duration: '5:23',
    timestamp: '2025-01-26T12:45:00Z'
  },
  {
    id: 'tp-4',
    type: 'link',
    title: 'SVG Animation Techniques',
    description: 'Advanced techniques for smooth SVG animations',
    url: 'https://svg-tricks.dev/animations',
    source: 'svg-tricks.dev',
    timestamp: '2025-01-25T14:20:00Z'
  },
  {
    id: 'tp-5',
    type: 'code',
    title: 'Rust + Tauri Boilerplate',
    description: 'Starter template for cross-platform apps',
    codePreview: 'fn main() {\n    tauri::Builder::default()\n        .run(tauri::generate_context!())\n        .expect("error while running tauri application");\n}',
    source: 'github.com/tauri-apps',
    language: 'rust',
    timestamp: '2025-01-24T16:15:00Z'
  }
];

// Application state
const appState = {
  currentScreen: 'main', // main, new-post, reading, base
  currentTheme: {
    colors: {
      primary: '#2c3e50',
      secondary: '#7f8c8d', 
      accent: '#3498db',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#2c3e50',
      border: '#ecf0f1'
    },
    typography: {
      fontFamily: 'Georgia, serif',
      fontSize: 16,
      lineHeight: 1.6,
      headerSize: 32,
      postTitleSize: 24
    }
  },
  currentPost: null,
  posts: [],
  isLoading: true,
  connected: false,
  allyabaseClient: null,
  formInstances: {},
  layeredUI: null
};

/**
 * Simple markdown parser
 */
function parseMarkdown(text) {
  if (!text) return '';
  
  let html = text;
  
  // Images: ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;">');
  
  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3 style="color: #2c3e50; margin: 20px 0 10px 0; font-size: 18px;">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 style="color: #2c3e50; margin: 24px 0 12px 0; font-size: 20px;">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 style="color: #2c3e50; margin: 28px 0 14px 0; font-size: 24px;">$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 12px; margin: 12px 0; overflow-x: auto; font-family: \'Courier New\', monospace; font-size: 14px; line-height: 1.4;"><code>$2</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background: #f1f3f4; padding: 2px 6px; border-radius: 3px; font-family: \'Courier New\', monospace; font-size: 0.9em;">$1</code>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #3498db; margin: 12px 0; padding: 8px 16px; background: #f8f9fa; font-style: italic; color: #555;">$1</blockquote>');
  
  // Lists
  html = html.replace(/^- (.*$)/gm, '<li style="margin: 4px 0;">$1</li>');
  html = html.replace(/(<li.*<\/li>)/s, '<ul style="margin: 12px 0; padding-left: 20px;">$1</ul>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p style="margin: 12px 0; line-height: 1.6;">');
  html = '<p style="margin: 12px 0; line-height: 1.6;">' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*><\/p>/g, '');
  
  return html;
}

/**
 * Simple SVG utilities (inline)
 */
function createSVGContainer(config = {}) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', config.width || '100%');
  svg.setAttribute('height', config.height || 'auto');
  svg.setAttribute('viewBox', config.viewBox || `0 0 ${config.width || 800} ${config.height || 600}`);
  return svg;
}

function createSVGElement(tag, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

/**
 * Create teleported content item
 */
function createTeleportedItem(item) {
  const container = document.createElement('div');
  container.className = 'teleported-item';
  container.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    border-left: 4px solid ${appState.currentTheme.colors.accent};
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  // Type indicator
  const typeIcon = {
    'link': '🔗',
    'image': '🖼️', 
    'video': '📹',
    'code': '💻'
  };

  // Header with type and source
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  header.innerHTML = `
    <span>${typeIcon[item.type] || '📄'} ${item.type}</span>
    <span>${new Date(item.timestamp).toLocaleDateString()}</span>
  `;

  // Title
  const title = document.createElement('h4');
  title.textContent = item.title;
  title.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: bold;
    color: ${appState.currentTheme.colors.primary};
    line-height: 1.3;
  `;

  // Description
  const description = document.createElement('p');
  description.textContent = item.description;
  description.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 12px;
    color: ${appState.currentTheme.colors.text};
    line-height: 1.4;
  `;

  // Source
  const source = document.createElement('div');
  source.textContent = item.source;
  source.style.cssText = `
    font-size: 11px;
    color: ${appState.currentTheme.colors.secondary};
    font-style: italic;
  `;

  // Add special content based on type
  if (item.type === 'image' && item.imageUrl) {
    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.style.cssText = `
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 4px;
      margin: 8px 0;
    `;
    container.appendChild(img);
  }

  if (item.type === 'video' && item.thumbnail) {
    const videoContainer = document.createElement('div');
    videoContainer.style.cssText = `
      position: relative;
      margin: 8px 0;
    `;
    
    const thumbnail = document.createElement('img');
    thumbnail.src = item.thumbnail;
    thumbnail.style.cssText = `
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    `;
    
    const playButton = document.createElement('div');
    playButton.innerHTML = '▶️';
    playButton.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.7);
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    `;
    
    if (item.duration) {
      const duration = document.createElement('div');
      duration.textContent = item.duration;
      duration.style.cssText = `
        position: absolute;
        bottom: 4px;
        right: 4px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
      `;
      videoContainer.appendChild(duration);
    }
    
    videoContainer.appendChild(thumbnail);
    videoContainer.appendChild(playButton);
    container.appendChild(videoContainer);
  }

  if (item.type === 'code' && item.codePreview) {
    const codeBlock = document.createElement('pre');
    codeBlock.textContent = item.codePreview;
    codeBlock.style.cssText = `
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 8px;
      margin: 8px 0;
      font-size: 10px;
      font-family: 'Courier New', monospace;
      overflow-x: auto;
      white-space: pre;
    `;
    container.appendChild(codeBlock);
  }

  // Hover effects
  container.addEventListener('mouseenter', () => {
    container.style.transform = 'translateY(-2px)';
    container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
  });

  container.addEventListener('mouseleave', () => {
    container.style.transform = 'translateY(0)';
    container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });

  // Click handler
  container.addEventListener('click', () => {
    console.log('Teleported item clicked:', item.title);
    if (item.url) {
      // In a real app, this would open the link
      alert(`Would open: ${item.url}`);
    }
  });

  container.appendChild(header);
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(source);

  return container;
}

/**
 * Simple text component
 */
function createTextComponent(config = {}) {
  const finalConfig = {
    text: 'Sample Text',
    fontSize: 16,
    fontFamily: 'Arial, sans-serif',
    color: '#333333',
    width: 300,
    height: 50,
    x: 0,
    y: 20,
    ...config
  };

  const svg = createSVGContainer(finalConfig);
  
  const text = createSVGElement('text', {
    x: finalConfig.x,
    y: finalConfig.y,
    fill: finalConfig.color,
    'font-family': finalConfig.fontFamily,
    'font-size': finalConfig.fontSize
  });
  
  text.textContent = finalConfig.text;
  svg.appendChild(text);
  
  return svg;
}

/**
 * Create blog post card with enhanced metadata
 */
function createBlogPost(post) {
  const postContainer = document.createElement('div');
  postContainer.className = 'blog-post';
  postContainer.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  
  // Post metadata header
  const metaHeader = document.createElement('div');
  metaHeader.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  
  const authorDate = document.createElement('span');
  authorDate.textContent = `by ${post.author} • ${new Date(post.timestamp).toLocaleDateString()}`;
  
  const readTime = document.createElement('span');
  readTime.textContent = post.readTime;
  
  metaHeader.appendChild(authorDate);
  metaHeader.appendChild(readTime);
  
  // Create title
  const titleElement = document.createElement('h2');
  titleElement.textContent = post.title;
  titleElement.style.cssText = `
    margin: 0 0 12px 0;
    color: ${appState.currentTheme.colors.primary};
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.postTitleSize}px;
    line-height: 1.3;
  `;
  
  // Featured image if available
  if (post.featuredImage) {
    const imageElement = document.createElement('img');
    imageElement.src = post.featuredImage;
    imageElement.style.cssText = `
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 16px;
    `;
    postContainer.appendChild(imageElement);
  }
  
  // Create content preview (first 150 characters, strip markdown)
  const strippedContent = post.content.replace(/!\[.*?\]\(.*?\)/g, '').replace(/[#*`>\-]/g, '').trim();
  const contentPreview = strippedContent.length > 150 
    ? strippedContent.substring(0, 150) + '...'
    : strippedContent;
    
  const contentElement = document.createElement('div');
  contentElement.textContent = contentPreview;
  contentElement.style.cssText = `
    color: ${appState.currentTheme.colors.text};
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 12px;
  `;
  
  // Tags
  if (post.tags && post.tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.style.cssText = `
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    `;
    
    post.tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.textContent = `#${tag}`;
      tagElement.style.cssText = `
        background: ${appState.currentTheme.colors.background};
        color: ${appState.currentTheme.colors.accent};
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      `;
      tagsContainer.appendChild(tagElement);
    });
    
    postContainer.appendChild(tagsContainer);
  }
  
  // Add click handler to view in reading mode
  postContainer.addEventListener('click', () => {
    appState.currentPost = post;
    navigateToScreen('reading');
  });
  
  postContainer.addEventListener('mouseenter', () => {
    postContainer.style.transform = 'translateY(-2px)';
    postContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
  });
  
  postContainer.addEventListener('mouseleave', () => {
    postContainer.style.transform = 'translateY(0)';
    postContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });
  
  postContainer.appendChild(metaHeader);
  postContainer.appendChild(titleElement);
  postContainer.appendChild(contentElement);
  
  return postContainer;
}

/**
 * Create simple blog form
 */
function createBlogForm() {
  const formContainer = document.createElement('div');
  formContainer.className = 'blog-form';
  formContainer.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 30px;
    margin: 20px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  
  // Title input
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = 'Post title...';
  titleInput.id = 'post-title';
  titleInput.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 4px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.postTitleSize}px;
    font-weight: bold;
  `;
  
  // Content textarea
  const contentTextarea = document.createElement('textarea');
  contentTextarea.placeholder = 'Write your post content here...\n\nMarkdown supported:\n• **bold** and *italic*\n• # Headers\n• ![Image](url)\n• `code` and ```code blocks```\n• > blockquotes\n• - lists';
  contentTextarea.id = 'post-content';
  contentTextarea.rows = 10;
  contentTextarea.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 4px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.fontSize}px;
    line-height: ${appState.currentTheme.typography.lineHeight};
    resize: vertical;
  `;
  
  // Markdown help text
  const markdownHelp = document.createElement('div');
  markdownHelp.style.cssText = `
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
    margin-bottom: 15px;
    font-style: italic;
  `;
  markdownHelp.innerHTML = `
    💡 <strong>Markdown supported:</strong> **bold**, *italic*, # headers, ![images](url), \`code\`, > quotes, - lists
  `;
  
  // Submit button
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Create Post';
  submitButton.style.cssText = `
    background: ${appState.currentTheme.colors.accent};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 16px;
    cursor: pointer;
    margin-right: 10px;
  `;
  
  // Clear button
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear';
  clearButton.style.cssText = `
    background: ${appState.currentTheme.colors.secondary};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 16px;
    cursor: pointer;
  `;
  
  // Add event handlers
  submitButton.addEventListener('click', function() {
    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();
    
    if (!title || !content) {
      alert('Please fill in both title and content');
      return;
    }
    
    // Create post data object
    const postData = {
      id: Date.now().toString(),
      title: title,
      content: content,
      author: 'You',
      timestamp: new Date().toISOString(),
      readTime: Math.ceil(content.split(' ').length / 200) + ' min read',
      tags: ['user-generated']
    };
    
    // Save to localStorage
    const currentPosts = JSON.parse(localStorage.getItem('rhapsold-posts') || '[]');
    currentPosts.unshift(postData);
    localStorage.setItem('rhapsold-posts', JSON.stringify(currentPosts));
    
    // Clear form
    titleInput.value = '';
    contentTextarea.value = '';
    
    // Navigate back to main screen (this will reload the posts)
    navigateToScreen('main');
    
    console.log('✅ Post created:', postData);
  });
  
  clearButton.addEventListener('click', function() {
    titleInput.value = '';
    contentTextarea.value = '';
  });
  
  // Append elements
  formContainer.appendChild(titleInput);
  formContainer.appendChild(contentTextarea);
  formContainer.appendChild(markdownHelp);
  formContainer.appendChild(submitButton);
  formContainer.appendChild(clearButton);
  
  return formContainer;
}

/**
 * Create HUD Navigation
 */
function createHUD() {
  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid ${appState.currentTheme.colors.border};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    z-index: 1000;
    font-family: ${appState.currentTheme.typography.fontFamily};
  `;
  
  // Left side - Logo
  const logo = document.createElement('div');
  logo.style.cssText = `
    font-size: 24px;
    font-weight: bold;
    color: ${appState.currentTheme.colors.primary};
  `;
  logo.textContent = '🎭 Rhapsold';
  
  // Center - Navigation buttons
  const nav = document.createElement('div');
  nav.style.cssText = `
    display: flex;
    gap: 10px;
  `;
  
  const screens = [
    { id: 'main', label: '📄 Main', title: 'Blog List' },
    { id: 'reading', label: '📖 Reading', title: 'Reading Mode' },
    { id: 'new-post', label: '✏️ New Post', title: 'Create Post' },
    { id: 'base', label: '🌐 Base', title: 'Server Management' }
  ];
  
  screens.forEach(screen => {
    const button = document.createElement('button');
    button.id = `nav-${screen.id}`;
    button.textContent = screen.label;
    button.title = screen.title;
    button.style.cssText = `
      padding: 8px 16px;
      border: 1px solid ${appState.currentTheme.colors.border};
      border-radius: 4px;
      background: ${appState.currentScreen === screen.id ? appState.currentTheme.colors.accent : 'white'};
      color: ${appState.currentScreen === screen.id ? 'white' : appState.currentTheme.colors.text};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    
    button.addEventListener('click', () => navigateToScreen(screen.id));
    button.addEventListener('mouseenter', () => {
      if (appState.currentScreen !== screen.id) {
        button.style.background = appState.currentTheme.colors.background;
      }
    });
    button.addEventListener('mouseleave', () => {
      if (appState.currentScreen !== screen.id) {
        button.style.background = 'white';
      }
    });
    
    nav.appendChild(button);
  });
  
  // Right side - Status
  const status = document.createElement('div');
  status.id = 'hud-status';
  status.style.cssText = `
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  status.textContent = 'Ready';
  
  hud.appendChild(logo);
  hud.appendChild(nav);
  hud.appendChild(status);
  
  return hud;
}

/**
 * Navigate to a specific screen
 */
function navigateToScreen(screenId) {
  console.log(`🧭 Navigating to screen: ${screenId}`);
  
  appState.currentScreen = screenId;
  updateHUDButtons();
  renderCurrentScreen();
}

/**
 * Update HUD button states
 */
function updateHUDButtons() {
  const screens = ['main', 'new-post', 'reading', 'base'];
  
  screens.forEach(screen => {
    const button = document.getElementById(`nav-${screen}`);
    if (button) {
      const isActive = appState.currentScreen === screen;
      button.style.background = isActive ? appState.currentTheme.colors.accent : 'white';
      button.style.color = isActive ? 'white' : appState.currentTheme.colors.text;
    }
  });
}

/**
 * Create Main Screen (Blog List with Teleported Column)
 */
function createMainScreen() {
  const screen = document.createElement('div');
  screen.id = 'main-screen';
  screen.className = 'screen';
  screen.style.cssText = `
    display: flex;
    gap: 20px;
    height: calc(100vh - 80px);
    overflow: hidden;
  `;
  
  // Left column - Blog posts (2/3 width)
  const postsColumn = document.createElement('div');
  postsColumn.className = 'posts-column';
  postsColumn.style.cssText = `
    flex: 2;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;
  
  // Posts header
  const postsHeader = document.createElement('div');
  postsHeader.style.cssText = `
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid ${appState.currentTheme.colors.background};
  `;
  postsHeader.innerHTML = `
    <h1 style="
      margin: 0 0 8px 0;
      color: ${appState.currentTheme.colors.primary};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 2rem;
      font-weight: 600;
    ">Latest Posts</h1>
    <p style="
      margin: 0;
      color: ${appState.currentTheme.colors.secondary};
      font-size: 16px;
    ">Discover the latest thoughts and insights from the community</p>
  `;
  
  // Posts container with scrolling
  const postsContainer = document.createElement('div');
  postsContainer.id = 'posts-container';
  postsContainer.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
  `;
  
  // Custom scrollbar styling
  const scrollbarStyle = document.createElement('style');
  scrollbarStyle.textContent = `
    #posts-container::-webkit-scrollbar {
      width: 8px;
    }
    #posts-container::-webkit-scrollbar-track {
      background: ${appState.currentTheme.colors.background};
      border-radius: 4px;
    }
    #posts-container::-webkit-scrollbar-thumb {
      background: ${appState.currentTheme.colors.secondary};
      border-radius: 4px;
    }
    #posts-container::-webkit-scrollbar-thumb:hover {
      background: ${appState.currentTheme.colors.primary};
    }
  `;
  document.head.appendChild(scrollbarStyle);
  
  postsColumn.appendChild(postsHeader);
  postsColumn.appendChild(postsContainer);
  
  // Right column - Teleported content (1/3 width)
  const teleportedColumn = document.createElement('div');
  teleportedColumn.className = 'teleported-column';
  teleportedColumn.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    background: ${appState.currentTheme.colors.background};
    border-radius: 12px;
    padding: 20px;
    overflow: hidden;
  `;
  
  // Teleported header
  const teleportedHeader = document.createElement('div');
  teleportedHeader.style.cssText = `
    margin-bottom: 20px;
    padding-bottom: 15px;  
    border-bottom: 2px solid ${appState.currentTheme.colors.border};
  `;
  teleportedHeader.innerHTML = `
    <h2 style="
      margin: 0 0 8px 0;
      color: ${appState.currentTheme.colors.primary};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 1.5rem;
      font-weight: 600;
    ">🌐 Teleported</h2>
    <p style="
      margin: 0;
      color: ${appState.currentTheme.colors.secondary};
      font-size: 14px;
    ">Content discovered across the network</p>
  `;
  
  // Teleported container with scrolling
  const teleportedContainer = document.createElement('div');
  teleportedContainer.id = 'teleported-container';
  teleportedContainer.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
  `;
  
  teleportedColumn.appendChild(teleportedHeader);
  teleportedColumn.appendChild(teleportedContainer);
  
  screen.appendChild(postsColumn);
  screen.appendChild(teleportedColumn);
  
  return screen;
}

/**
 * Create New Post Screen
 */
function createNewPostScreen() {
  const screen = document.createElement('div');
  screen.id = 'new-post-screen';
  screen.className = 'screen';
  
  // Create header
  const header = document.createElement('header');
  header.innerHTML = `
    <h1 style="
      text-align: center;
      color: ${appState.currentTheme.colors.primary};
      margin-bottom: 20px;
      font-size: 2rem;
    ">Create New Post</h1>
    <p style="
      text-align: center;
      color: ${appState.currentTheme.colors.secondary};
      margin-bottom: 30px;
    ">Write and publish your blog post</p>
  `;
  
  // Create form
  const formContainer = createBlogForm();
  
  screen.appendChild(header);
  screen.appendChild(formContainer);
  
  return screen;
}

/**
 * Create Reading Screen
 */
function createReadingScreen() {
  const screen = document.createElement('div');
  screen.id = 'reading-screen';
  screen.className = 'screen';
  
  if (appState.currentPost) {
    // Display the selected post
    const postContainer = document.createElement('div');
    postContainer.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.8;
    `;
    
    // Post metadata
    if (appState.currentPost.author) {
      const metadata = document.createElement('div');
      metadata.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid ${appState.currentTheme.colors.background};
        font-size: 14px;
        color: ${appState.currentTheme.colors.secondary};
      `;
      
      const authorDate = document.createElement('span');
      authorDate.textContent = `by ${appState.currentPost.author} • ${new Date(appState.currentPost.timestamp).toLocaleDateString()}`;
      
      const readTime = document.createElement('span');
      readTime.textContent = appState.currentPost.readTime || '5 min read';
      
      metadata.appendChild(authorDate);
      metadata.appendChild(readTime);
      postContainer.appendChild(metadata);
    }
    
    // Post title
    const title = document.createElement('h1');
    title.textContent = appState.currentPost.title;
    title.style.cssText = `
      color: ${appState.currentTheme.colors.primary};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: ${appState.currentTheme.typography.headerSize}px;
      margin-bottom: 30px;
      line-height: 1.3;
    `;
    
    // Post content (with markdown parsing)
    const content = document.createElement('div');
    content.innerHTML = parseMarkdown(appState.currentPost.content);
    content.style.cssText = `
      color: ${appState.currentTheme.colors.text};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 18px;
      line-height: 1.8;
      margin-bottom: 30px;
    `;
    
    // Tags if available
    if (appState.currentPost.tags && appState.currentPost.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.style.cssText = `
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 30px;
      `;
      
      appState.currentPost.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.textContent = `#${tag}`;
        tagElement.style.cssText = `
          background: ${appState.currentTheme.colors.background};
          color: ${appState.currentTheme.colors.accent};
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        `;
        tagsContainer.appendChild(tagElement);
      });
      
      postContainer.appendChild(tagsContainer);
    }
    
    // Back button
    const backButton = document.createElement('button');
    backButton.textContent = '← Back to Main';
    backButton.style.cssText = `
      background: ${appState.currentTheme.colors.secondary};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 16px;
      margin-top: 20px;
    `;
    backButton.addEventListener('click', () => {
      appState.currentPost = null;
      navigateToScreen('main');
    });
    
    postContainer.appendChild(title);
    postContainer.appendChild(content);
    postContainer.appendChild(backButton);
    screen.appendChild(postContainer);
  } else {
    // No post selected
    screen.innerHTML = `
      <div style="
        text-align: center;
        padding: 100px 20px;
        color: ${appState.currentTheme.colors.secondary};
      ">
        <h1 style="
          color: ${appState.currentTheme.colors.primary};
          margin-bottom: 20px;
          font-size: 2rem;
        ">📖 Reading Mode</h1>
        <p style="margin-bottom: 20px;">Select a post from the Main screen to read it here.</p>
        <p style="font-size: 14px;">This screen provides an immersive reading experience with distraction-free viewing.</p>
      </div>
    `;
  }
  
  return screen;
}

/**
 * Create Base Screen (Server Management)
 */
function createBaseScreen() {
  const screen = document.createElement('div');
  screen.id = 'base-screen';
  screen.className = 'screen';
  screen.style.cssText = `
    padding: 20px;
    overflow-y: auto;
  `;
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    text-align: center;
    margin-bottom: 40px;
  `;
  header.innerHTML = `
    <h1 style="
      color: ${appState.currentTheme.colors.primary};
      margin-bottom: 12px;
      font-size: 2rem;
      font-family: ${appState.currentTheme.typography.fontFamily};
    ">🌐 Base Server Management</h1>
    <p style="
      color: ${appState.currentTheme.colors.secondary};
      font-size: 16px;
      margin: 0;
    ">Connect to allyabase servers across the decentralized network</p>
  `;
  
  // Bases container
  const basesContainer = document.createElement('div');
  basesContainer.style.cssText = `
    max-width: 800px;
    margin: 0 auto;
    display: grid;
    gap: 20px;
  `;
  
  // Placeholder base data
  const placeholderBases = [
    {
      name: 'Local Development',
      url: 'http://localhost:7243',
      status: 'connected',
      type: 'development',
      services: ['sanora', 'bdo', 'dolores', 'addie', 'fount'],
      description: 'Local development environment for testing',
      users: 1,
      uptime: '99.9%'
    },
    {
      name: 'Planet Nine Alpha',
      url: 'https://alpha.allyabase.com',
      status: 'connected', 
      type: 'production',
      services: ['sanora', 'bdo', 'dolores', 'addie', 'fount', 'julia'],
      description: 'Main Planet Nine production cluster',
      users: 15420,
      uptime: '99.8%'
    },
    {
      name: 'Community Beta',
      url: 'https://beta.community.allyabase.com',
      status: 'available',
      type: 'community',
      services: ['sanora', 'bdo', 'dolores'],
      description: 'Community-run server for beta testing',
      users: 892,
      uptime: '98.5%'
    },
    {
      name: 'Privacy-First Base',
      url: 'https://privacy.allyabase.org',
      status: 'available',
      type: 'privacy',
      services: ['sanora', 'bdo', 'julia'],
      description: 'Enhanced privacy and encryption focus',
      users: 3241,
      uptime: '99.2%'
    },
    {
      name: 'Academic Research',
      url: 'https://research.edu.allyabase.net',
      status: 'limited',
      type: 'research', 
      services: ['bdo', 'dolores'],
      description: 'University research cluster (restricted access)',
      users: 156,
      uptime: '97.1%'
    }
  ];
  
  placeholderBases.forEach(base => {
    const baseCard = createBaseCard(base);
    basesContainer.appendChild(baseCard);
  });
  
  screen.appendChild(header);
  screen.appendChild(basesContainer);
  
  return screen;
}

/**
 * Create base server card
 */
function createBaseCard(base) {
  const card = document.createElement('div');
  card.className = 'base-card';
  card.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-left: 4px solid ${getStatusColor(base.status)};
    transition: all 0.2s ease;
    cursor: pointer;
  `;
  
  // Status indicator
  const statusEmoji = {
    'connected': '🟢',
    'available': '🟡', 
    'limited': '🟠',
    'offline': '🔴'
  };
  
  // Type emoji
  const typeEmoji = {
    'development': '🛠️',
    'production': '🏭',
    'community': '👥',
    'privacy': '🔒',
    'research': '🔬'
  };
  
  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">${typeEmoji[base.type] || '🌐'}</span>
        <div>
          <h3 style="
            margin: 0 0 4px 0;
            color: ${appState.currentTheme.colors.primary};
            font-size: 18px;
            font-weight: 600;
          ">${base.name}</h3>
          <p style="
            margin: 0;
            color: ${appState.currentTheme.colors.secondary};
            font-size: 12px;
            font-family: monospace;
          ">${base.url}</p>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          font-size: 14px;
          font-weight: 500;
          color: ${getStatusColor(base.status)};
        ">
          ${statusEmoji[base.status]} ${base.status.toUpperCase()}
        </div>
        <div style="
          font-size: 11px;
          color: ${appState.currentTheme.colors.secondary};
        ">
          ${base.users.toLocaleString()} users
        </div>
      </div>
    </div>
    
    <p style="
      margin: 0 0 16px 0;
      color: ${appState.currentTheme.colors.text};
      font-size: 14px;
      line-height: 1.4;
    ">${base.description}</p>
    
    <div style="
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    ">
      ${base.services.map(service => `
        <span style="
          background: ${appState.currentTheme.colors.background};
          color: ${appState.currentTheme.colors.accent};
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        ">${service}</span>
      `).join('')}
    </div>
    
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid ${appState.currentTheme.colors.background};
    ">
      <div style="
        font-size: 12px;
        color: ${appState.currentTheme.colors.secondary};
      ">
        Uptime: ${base.uptime}
      </div>
      <button style="
        background: ${base.status === 'connected' ? appState.currentTheme.colors.secondary : appState.currentTheme.colors.accent};
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        font-weight: 500;
      ">
        ${base.status === 'connected' ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  `;
  
  // Hover effects
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-2px)';
    card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  });
  
  // Click handler
  card.addEventListener('click', () => {
    console.log('Base clicked:', base.name);
    alert(`Would ${base.status === 'connected' ? 'disconnect from' : 'connect to'} ${base.name}`);
  });
  
  return card;
}

/**
 * Get status color
 */
function getStatusColor(status) {
  const colors = {
    'connected': '#10b981',
    'available': '#f59e0b',
    'limited': '#f97316', 
    'offline': '#ef4444'
  };
  return colors[status] || '#6b7280';
}

/**
 * Render the current screen
 */
function renderCurrentScreen() {
  const contentContainer = document.getElementById('screen-content');
  if (!contentContainer) return;
  
  // Clear existing content
  contentContainer.innerHTML = '';
  
  // Create the appropriate screen
  let screen;
  switch (appState.currentScreen) {
    case 'main':
      screen = createMainScreen();
      // Load posts after screen is added to DOM
      setTimeout(() => {
        loadExistingPosts(); // Load posts for main screen
        createDemoPost(); // Create demo if needed
      }, 10);
      break;
    case 'new-post':
      screen = createNewPostScreen();
      break;
    case 'reading':
      screen = createReadingScreen();
      break;
    case 'base':
      screen = createBaseScreen();
      break;
    default:
      screen = createMainScreen();
      appState.currentScreen = 'main';
  }
  
  contentContainer.appendChild(screen);
  
  // Update status
  const status = document.getElementById('hud-status');
  if (status) {
    const screenNames = {
      'main': 'Blog List',
      'new-post': 'Creating Post',
      'reading': 'Reading Mode',
      'base': 'Server Management'
    };
    status.textContent = screenNames[appState.currentScreen] || 'Ready';
  }
}

/**
 * Load posts and teleported content
 */
function loadExistingPosts() {
  console.log('📄 Loading posts and teleported content...');
  
  try {
    // Load blog posts (use placeholder data + localStorage)
    const localPosts = JSON.parse(localStorage.getItem('rhapsold-posts') || '[]');
    const allPosts = [...PLACEHOLDER_POSTS, ...localPosts];
    
    const postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
      // Clear existing content
      postsContainer.innerHTML = '';
      
      allPosts.forEach(postData => {
        // Convert localStorage format to placeholder format if needed
        const post = postData.author ? postData : {
          id: postData.id || Date.now().toString(),
          title: postData.title,
          content: postData.content,
          author: 'Anonymous',
          timestamp: postData.timestamp || new Date().toISOString(),
          readTime: '3 min read',
          tags: ['user-generated']
        };
        
        const postElement = createBlogPost(post);
        postsContainer.appendChild(postElement);
      });
      
      console.log(`📄 Loaded ${allPosts.length} blog posts`);
    }
    
    // Load teleported content
    const teleportedContainer = document.getElementById('teleported-container');
    if (teleportedContainer) {
      // Clear existing content
      teleportedContainer.innerHTML = '';
      
      TELEPORTED_CONTENT.forEach(item => {
        const teleportedElement = createTeleportedItem(item);
        teleportedContainer.appendChild(teleportedElement);
      });
      
      console.log(`🌐 Loaded ${TELEPORTED_CONTENT.length} teleported items`);
    }
    
  } catch (error) {
    console.warn('⚠️ Could not load content:', error);
  }
}

/**
 * Create demo post if no posts exist
 */
function createDemoPost() {
  const savedPosts = JSON.parse(localStorage.getItem('rhapsold-posts') || '[]');
  if (savedPosts.length > 0) return;
  
  console.log('📄 Creating demo post...');
  
  const demoPost = {
    id: 'demo-' + Date.now(),
    title: 'Welcome to Rhapsold',
    content: `This is a demonstration of Rhapsold's simplified interface.

The platform now features:
• Simple HTML-based interface (no ES6 modules)
• Local storage for your posts
• Clean, readable design
• Responsive layout

Try creating your own post using the form above!`,
    timestamp: new Date().toISOString()
  };
  
  // Save to localStorage
  const newPosts = [demoPost];
  localStorage.setItem('rhapsold-posts', JSON.stringify(newPosts));
  
  // Note: Demo post is handled by loadExistingPosts() function
  
  console.log('✅ Demo post created');
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.opacity = '0';
    setTimeout(() => {
      loadingElement.style.display = 'none';
      appState.isLoading = false;
    }, 500);
  }
}

/**
 * Initialize the application
 */
async function init() {
  try {
    console.log('🎭 Initializing Rhapsold (Simple Mode)...');
    
    // Get the main app container
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container not found');
    }
    
    // Clear existing content
    appContainer.innerHTML = '';
    
    // Create HUD
    const hud = createHUD();
    document.body.appendChild(hud);
    
    // Create main layout with screen system
    const mainLayout = document.createElement('div');
    mainLayout.style.cssText = `
      max-width: 800px;
      margin: 80px auto 20px auto; /* Top margin for HUD */
      padding: 20px;
      font-family: ${appState.currentTheme.typography.fontFamily};
    `;
    
    // Create screen content container
    const screenContent = document.createElement('div');
    screenContent.id = 'screen-content';
    screenContent.className = 'screen-content';
    
    mainLayout.appendChild(screenContent);
    appContainer.appendChild(mainLayout);
    
    // Initialize with main screen
    renderCurrentScreen();
    
    // Hide loading screen
    hideLoadingScreen();
    
    console.log('✅ Rhapsold initialized successfully (Simple Mode)');
    
  } catch (error) {
    console.error('❌ Failed to initialize Rhapsold:', error);
    
    // Show error message
    const appContainer = document.getElementById('app') || document.body;
    appContainer.innerHTML = `
      <div style="
        max-width: 600px;
        margin: 50px auto;
        padding: 30px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #e74c3c;
        font-family: Arial, sans-serif;
      ">
        <h2 style="color: #e74c3c; margin-bottom: 15px;">⚠️ Initialization Error</h2>
        <p style="margin-bottom: 15px;">Failed to initialize Rhapsold.</p>
        <p style="font-size: 0.9em; color: #666; font-family: monospace; word-break: break-all;">
          Error: ${error.message}
        </p>
        <button onclick="location.reload()" style="
          margin-top: 20px;
          padding: 12px 24px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        ">🔄 Retry</button>
      </div>
    `;
    
    hideLoadingScreen();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export for debugging
window.rhapsold = {
  appState,
  init,
  createTextComponent,
  createBlogPost,
  createBlogForm
};

console.log('🎭 Rhapsold main module loaded (Simple Mode)');