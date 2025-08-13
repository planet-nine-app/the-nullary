# P2P Connection Testing Guide

## Current State

The P2P connection system is functional but requires manual steps since the real julia service isn't integrated yet.

## How P2P Connections Work

### In Production (with julia service):
1. **App A** generates connection URL → Creates outgoing connection request
2. **App B** processes URL → Creates incoming connection request  
3. **App B** accepts → julia service notifies App A
4. **Both apps** have active connections → Can exchange messages via julia

### Current Testing Setup (without julia service):
1. **App A** generates URL → Creates "Outgoing" connection (shows "Awaiting Connection")
2. **App B** processes URL → Creates "Pending" connection
3. **App B** accepts → Connection becomes "Active" on App B only
4. **App A** still shows "Outgoing" status (no julia service to notify)

## Testing Workaround

To establish bidirectional connections for testing:

### Option 1: Manual Reciprocal Connection
After App B accepts the connection, you can manually create the reciprocal connection in App A's browser console:

```javascript
// In App A's console (the one that generated the URL)
await invoke('create_reciprocal_connection', {
    partnerPublicKey: 'PUBLIC_KEY_FROM_APP_B',
    partnerName: 'StackChat User'
});
```

### Option 2: Exchange URLs Both Ways
1. App A generates URL → shares with App B
2. App B processes URL and accepts
3. App B generates its own URL → shares with App A  
4. App A processes App B's URL and accepts
5. Both apps now have active connections

## Connection States

- **Outgoing**: Connection request sent, awaiting partner response
- **Pending**: Incoming connection request, needs accept/decline
- **Active**: Connection established, messaging enabled
- **Blocked**: Connection rejected

## Known Limitations

1. **No Real-Time Updates**: Without julia service, connection status changes don't propagate between apps
2. **Messages Don't Sync**: Messages are stored locally only (no shared BDO yet)
3. **Manual Connection Setup**: Requires workarounds for bidirectional connections

## Testing Messages

Once both apps have "Active" connections:
1. Click the "Message" button on the connection card
2. Type a message in the input field
3. Press Enter to send

Note: Messages are currently logged but not actually transmitted between apps (requires julia service integration).

## Logs to Watch

```
📤 Created outgoing connection request: julia-outgoing-xxx
✅ Created julia association: JuliaConnection {...}
🤝 Accepting julia association: julia-assoc-xxx
📤 Sending message to julia association: julia-assoc-xxx
✅ Message ready for julia service: [your message]
```

## Next Steps for Full Integration

1. Integrate julia-rs client for real P2P messaging
2. Implement shared BDO storage for message persistence
3. Add WebSocket/polling for real-time updates
4. Handle connection state synchronization