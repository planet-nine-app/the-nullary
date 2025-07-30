# StackChat - P2P Messaging Platform

## Overview

StackChat is a peer-to-peer messaging application built on the Planet Nine ecosystem, featuring RPG-style dialog interfaces and space-flight message animations. It leverages the covenant service to establish joint BDO (Big Dumb Object) storage between users, enabling secure, decentralized messaging without central servers. The app combines classic RPG aesthetics with modern P2P communication technology.

## Architecture

### Three-Screen Messaging Platform

1. **Connections Screen**: Manage covenant connections with other users
2. **Messaging Screen**: RPG-style dialog interface for conversations  
3. **Planet Nine Screen**: Ecosystem overview highlighting P2P messaging capabilities

### Technology Stack

- **Frontend**: Tauri v2.x application with gaming-inspired UI (1000x700 default window)
- **Backend**: Rust with covenant service and joint BDO integration
- **UI Design**: RPG-style dialog boxes with CSS animations and space-flight effects
- **Services**: Covenant (connections), BDO (shared storage), Sessionless (authentication)

## Key Features

### RPG-Style Messaging Interface

- **Dialog Boxes**: Classic RPG-style message containers with borders and corners
- **Received Messages**: Display at top of screen with slide-in animations
- **Sent Messages**: Differentiated styling with green color scheme
- **Input Dialog**: Fixed bottom position with purple gradient styling
- **Space Animation**: Messages fly off to space when sent with rocket trail effects

### Covenant Connection Management

- **P2P Connections**: Direct user-to-user connections via covenant service
- **Joint BDO Storage**: Shared message storage between connected users
- **Connection Status**: Active, Pending, and Blocked states with visual indicators
- **Unread Counters**: Visual badges showing unread message counts
- **Accept/Block Actions**: Manage incoming connection requests

### Secure Messaging

- **End-to-End Storage**: Messages stored in joint BDO accessible only to participants
- **Sessionless Authentication**: Cryptographic key-based access control
- **No Central Server**: Messages stored in shared, decentralized storage
- **Connection Privacy**: Direct connections without intermediary servers

## Service Integration

StackChat integrates with core Planet Nine services:

### Covenant Service Integration (`covenant-rs`)

- **Connection Creation**: Establish P2P relationships between users
- **Joint BDO Setup**: Automatic shared storage provisioning
- **Connection Management**: Accept, block, and manage relationships
- **Status Tracking**: Real-time connection state management

### BDO Integration (Joint Storage)

- **Shared Message Storage**: Messages stored in joint BDO instances
- **Dual Access**: Both participants can read/write to shared storage
- **Message Persistence**: Conversation history maintained across sessions
- **Offline Sync**: Messages available when both users are online

### Data Flow Architecture

```
User Authentication (sessionless) → Covenant Creation → Joint BDO Setup → Message Exchange
```

## Component Structure

### RPG Dialog System

Each message is rendered as a classic RPG dialog box:

- **Border Design**: 3px solid borders with rounded corners
- **Corner Indicators**: Triangular speech bubble pointers
- **Color Coding**: Green for sent, blue-gray for received messages
- **Header Information**: Sender name, timestamp, and styling
- **Content Area**: Message text with text shadows and typography
- **Animation System**: Slide-in effects for message appearance

### Space Flight Animation

When sending messages:

1. **Input Capture**: Form submission triggers animation sequence
2. **Element Cloning**: Input content cloned for animation
3. **Flight Path**: Message flies upward with rotation and scaling
4. **Rocket Trail**: Emoji rocket follows with spinning animation
5. **Fade Out**: Complete disappearance after 2-second animation

### Connection Cards

Connection management interface includes:

- **Partner Information**: Name, status, and creation date
- **Activity Indicators**: Last message time and unread counts
- **Status Badges**: Visual indicators for connection states
- **Action Buttons**: Accept, block, and message actions
- **Click Navigation**: Direct conversation access

## Development Patterns

### No-Modules Architecture

StackChat follows The Nullary's no-modules approach:

```javascript
// Inline service integration instead of imports
const appState = {
    currentScreen: 'connections',
    currentConversation: null,
    connections: [],
    messages: []
};
```

### Service Integration Pattern

Backend integrates with Planet Nine services for messaging:

```rust
// Covenant service for connection management
let covenant_client = CovenantClient::new(covenant_url)?;
let covenant = covenant_client.create_covenant(sessionless, covenant_data).await?;

// Joint BDO for message storage
let bdo_client = BdoClient::new(joint_bdo_url, sessionless)?;
let messages = bdo_client.get_object(messages_key).await?;
```

### Animation Implementation

Space flight effects use CSS keyframes:

```css
@keyframes spaceFlightSend {
    0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
    50% { transform: translateY(-100px) rotate(180deg) scale(0.8); }
    100% { transform: translateY(-500px) rotate(360deg) scale(0.2); opacity: 0; }
}
```

## File Structure

```
stackchat/
├── src/
│   ├── main.js          # Main messaging application (no modules)
│   └── index.html       # RPG-styled HTML with CSS animations
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs       # Backend covenant/BDO integration  
│   │   ├── main.rs      # Tauri application entry
│   │   └── build.rs     # Build configuration
│   ├── Cargo.toml       # Rust dependencies including covenant-rs
│   └── tauri.conf.json  # Tauri desktop configuration
├── CLAUDE.md           # This documentation
└── package.json        # Frontend dependencies
```

## Key Dependencies

### Rust Backend

- `tauri`: Cross-platform application framework
- `serde`: Serialization/deserialization with datetime support
- `covenant-rs`: Covenant service client for P2P connections
- `bdo-rs`: Big Dumb Object storage client for joint storage
- `sessionless`: Authentication protocol
- `chrono`: DateTime handling for message timestamps
- `uuid`: Unique identifier generation

### JavaScript Frontend

- `@tauri-apps/api`: Tauri JavaScript API
- Vanilla JavaScript (no external dependencies)
- CSS3 with keyframe animations and gradients
- RPG-inspired styling with dialog box designs

## Data Models

### Message Structure

```javascript
{
    uuid: "msg-uuid",
    sender_uuid: "user-uuid", 
    sender_name: "Alice Developer",
    recipient_uuid: "recipient-uuid",
    content: "Hello from StackChat!",
    timestamp: "2024-01-15T10:30:00Z",
    covenant_uuid: "covenant-uuid",
    read: false
}
```

### Covenant Connection Structure

```javascript
{
    uuid: "covenant-uuid",
    partner_uuid: "partner-uuid",
    partner_name: "Bob Creator",
    partner_public_key: "03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd",
    joint_bdo_url: "http://localhost:3006",
    created_at: "2024-01-10T09:00:00Z",
    last_message_at: "2024-01-15T10:25:00Z",
    unread_count: 2,
    status: "Active" | "Pending" | "Blocked"
}
```

### Conversation Structure

```javascript
{
    connection: CovenantConnection,
    messages: [Message],
    total_count: 25
}
```

## User Experience

### Connection Flow

1. **Connection Discovery**: Find users through public keys or invitations
2. **Covenant Creation**: Establish P2P connection via covenant service
3. **Joint BDO Setup**: Automatic shared storage provisioning  
4. **Connection Acceptance**: Partner accepts or blocks connection request
5. **Active Messaging**: Real-time messaging through shared storage

### Messaging Experience

1. **Conversation Access**: Click connection card to open messaging
2. **RPG Interface**: Classic dialog boxes for sent and received messages
3. **Message Composition**: Bottom input dialog with RPG styling
4. **Space Animation**: Messages fly off to space when sent
5. **Real-time Updates**: New messages appear with slide-in animations

### Visual Design Language

- **RPG Aesthetics**: Dialog boxes, borders, and classic gaming typography
- **Space Theme**: Rocket emojis, flight animations, and cosmic backgrounds
- **Color Coding**: Green for sent, blue for received, purple for input
- **Smooth Animations**: Slide-ins, space flights, and hover effects

## Development Workflow

1. **Start Development**: `npm run tauri dev`
2. **Build Application**: `npm run tauri build`
3. **Backend Changes**: Modify `src-tauri/src/lib.rs`
4. **Frontend Changes**: Modify `src/main.js` or `src/index.html`
5. **Covenant Service**: Ensure covenant service running on `localhost:3008`
6. **BDO Service**: Ensure BDO service running on `localhost:3006`

## Integration Points

### With Covenant Service

- **Connection Management**: Create, accept, and manage P2P connections
- **Joint BDO Provisioning**: Automatic shared storage setup
- **Authentication**: Sessionless-based secure connection operations
- **Status Synchronization**: Real-time connection state updates

### With The Nullary Ecosystem

- **Shared Architecture**: Consistent with other Nullary applications
- **Service Integration**: Unified approach to Planet Nine services
- **Design Consistency**: Cohesive styling and interaction patterns
- **No-Modules Pattern**: Tauri-compatible JavaScript architecture

### With BDO Service

- **Shared Storage**: Joint BDO instances for message persistence
- **Dual Access**: Both users can read/write messages
- **Authentication**: Sessionless keys for storage access
- **Offline Sync**: Message availability across sessions

## Security Considerations

### P2P Security

- **Sessionless Authentication**: Cryptographic key-based access
- **Joint Storage Access**: Only connection participants can access messages
- **No Central Server**: Messages never pass through central servers
- **Connection Privacy**: Direct user-to-user relationships

### Message Security

- **Access Control**: Joint BDO accessible only to connected users
- **Data Isolation**: Each conversation in separate storage instance
- **Authentication Required**: All operations require valid sessionless signatures
- **Connection Verification**: Covenant service validates relationships

## Performance Considerations

### Message Loading

- **Lazy Loading**: Messages loaded on conversation open
- **Scroll Optimization**: Efficient rendering of message history
- **Animation Performance**: CSS-based animations for smooth effects
- **State Management**: Minimal global state for fast updates

### Connection Management

- **Connection Caching**: Frequent connections cached locally
- **Status Updates**: Efficient real-time status synchronization
- **Batch Operations**: Optimized covenant service calls
- **UI Responsiveness**: Non-blocking operations with loading states

## Future Enhancements

### Immediate Roadmap

- **Connection Creation UI**: Complete interface for creating new connections
- **Rich Media Messages**: Support for images, files, and emojis
- **Message Search**: Find messages within conversations
- **Notification System**: Desktop notifications for new messages
- **Connection Invitations**: Shareable invitation links

### Advanced Features

- **Group Conversations**: Multi-user covenant connections
- **Message Encryption**: Client-side encryption for additional security
- **Voice Messages**: Audio message support with RPG styling
- **Message Reactions**: Emoji reactions to messages
- **Custom Themes**: User-selectable RPG theme variations

### Enhanced Animations

- **Message Types**: Different animations for different message types
- **Custom Effects**: User-selectable send animations
- **Sound Effects**: RPG-style audio feedback
- **Particle Systems**: Enhanced space-flight visual effects
- **Transition Improvements**: Smoother screen transitions

## Testing

Testing follows Planet Nine patterns:

- **Backend Logic**: Rust unit tests for covenant/BDO integration
- **Frontend Testing**: Tauri development environment testing
- **Integration Testing**: Against development covenant/BDO services
- **Animation Testing**: CSS animation performance and compatibility
- **P2P Testing**: Multi-user conversation scenarios

## Accessibility

### RPG Interface Accessibility

- **Screen Reader Support**: Proper semantic markup for dialog boxes
- **Keyboard Navigation**: Full keyboard accessibility for messaging
- **Focus Management**: Clear focus indicators and navigation paths
- **High Contrast**: Support for high contrast viewing modes
- **Text Scaling**: Responsive text sizing for message readability

### Animation Accessibility

- **Motion Sensitivity**: Respect user preferences for reduced motion
- **Animation Controls**: Optional animation disable settings
- **Focus During Animation**: Maintain keyboard focus during effects
- **Screen Reader Friendly**: Animations don't interfere with assistive technology

StackChat represents a unique approach to P2P messaging, combining the security and decentralization of the Planet Nine ecosystem with the nostalgic appeal of RPG-style interfaces and playful space-themed animations. It demonstrates how modern cryptographic protocols can be wrapped in engaging, user-friendly experiences that make decentralized communication both fun and secure.