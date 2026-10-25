import { demoGameService, DemoService } from './demo-service';

// Export single active game service instance.
// For production backend integration (Socket.IO / WebSocket), replace demoGameService
// with socketGameService implementing the same DemoService interface.
export const gameService: DemoService = demoGameService;
export type { RoomState, Player, RoomSettings, GamePhase, ChatMessage } from './demo-service';
