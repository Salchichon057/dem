# Configuration Files

Centralized configuration for different modules of the application.

## audits.config.ts

Configuration for the Audits (Auditorías) module, including:

### Form Templates
- `CONSOLIDATED_BOARD_2025`: ID for the 2025 Consolidated Audits Board form

### Traffic Light (Semáforo)
- Values: `RED`, `YELLOW`, `GREEN`
- Colors: Hex codes for each status
- Utilities: Helper functions for styling and display

### Usage Examples

```typescript
import { 
  getConsolidatedBoardFormId,
  getTrafficLightBadgeClasses,
  getTrafficLightEmoji,
  AUDITS_CONFIG
} from '@/lib/config/audits.config'

// Get the active form ID
const formId = getConsolidatedBoardFormId()

// Get styling for a traffic light badge
const classes = getTrafficLightBadgeClasses(trafficLight)

// Get emoji representation
const emoji = getTrafficLightEmoji(trafficLight)

// Access constants directly
const redStatus = AUDITS_CONFIG.TRAFFIC_LIGHT.RED
const greenColor = AUDITS_CONFIG.TRAFFIC_LIGHT_COLORS.GREEN
```

### Benefits
- **Single source of truth**: Change form IDs in one place
- **Type safety**: TypeScript ensures correct usage
- **Consistency**: Same values across frontend and backend
- **Maintainability**: Easy to update when forms change
