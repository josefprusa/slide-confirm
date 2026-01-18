# Slide Confirm Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)

This is a custom card for [Home Assistant](https://www.home-assistant.io) designed to prevent accidental button presses by requiring the user perform a successful sliding action to trigger a service.

**NEW: State-Aware Functionality** - The slider now shows the current entity state and adapts its behavior accordingly. Left position = OFF, Right position = ON.

Use case: You have switches, lights, or other entities that you want to control with confirmation, and you want to see their current state. The slider position reflects the entity state and you can slide to change it.

## Installation

### HACS (recommended)
1. In Home Assistant, go to **HACS → Frontend → + Explore & Add Repositories**.
2. Search for **Slide Confirm Card** (or add this repository as a custom repository under **Frontend**).
3. Install the repository and refresh your browser.

HACS will automatically add a Lovelace resource pointing to:

```
/hacsfiles/slide-confirm-card/slide-confirm-card.js
```

### Manual
1. Download `slide-confirm-card.js` from the latest release.
2. Copy it to your Home Assistant config directory:

```
www/community/slide-confirm-card/slide-confirm-card.js
```

3. In Home Assistant, go to **Settings → Dashboards → Resources** and add:

```
/local/community/slide-confirm-card/slide-confirm-card.js
```

Set the resource type to **JavaScript Module**.

## Usage
After installation, edit your dashboard and click the "Add Card" button. Choose the "Manual" box at the very bottom. The card must be configured manually as shown here (no visual editor support yet):

```yaml
# REQUIRED: Specify the card
type: custom:slide-confirm-card
# REQUIRED: A list of sliders to display
sliders:
  # State-aware slider example
  - name: Living Room Light
    icon: mdi:lightbulb
    # REQUIRED: Entity to monitor state
    entity: light.living_room
    # Text shown when entity is OFF
    text_when_off: "Slide to turn on"
    # Text shown when entity is ON  
    text_when_on: "Slide to turn off"
    # Icons for different states
    icon_when_off: mdi:lightbulb-off
    icon_when_on: mdi:lightbulb-on
    # Action when sliding while entity is OFF (will turn ON)
    action_when_off:
      action: call-service
      service: light.turn_on
      target:
        entity_id: light.living_room
    # Action when sliding while entity is ON (will turn OFF)
    action_when_on:
      action: call-service
      service: light.turn_off
      target:
        entity_id: light.living_room

  # Switch example with custom colors
  - name: Smart Switch
    icon: mdi:power
    entity: switch.smart_switch
    text_when_off: "Slide to turn on"
    text_when_on: "Slide to turn off"
    icon_when_off: mdi:power-off
    icon_when_on: mdi:power-on
    color_when_off: "#ff5722"  # Orange for OFF state
    color_when_on: "#4caf50"   # Green for ON state
    action_when_off:
      action: call-service
      service: switch.turn_on
      target:
        entity_id: switch.smart_switch
    action_when_on:
      action: call-service
      service: switch.turn_off
      target:
        entity_id: switch.smart_switch
```

## Configuration Options

### Card Configuration
- `type`: `custom:slide-confirm-card` (required)
- `sliders`: Array of slider configurations (required)

### Slider Configuration
- `name`: Display name for the slider (required)
- `entity`: Home Assistant entity ID to monitor for state (required)
- `icon`: Icon to display next to the name
- `text_when_off`: Text shown when entity is OFF
- `text_when_on`: Text shown when entity is ON
- `icon_when_off`: Icon shown when entity is OFF
- `icon_when_on`: Icon shown when entity is ON
- `color_when_off`: Custom color for slider when entity is OFF (e.g., "#ff5722", "orange", "rgb(255, 87, 34)")
- `color_when_on`: Custom color for slider when entity is ON (e.g., "#4caf50", "green", "rgb(76, 175, 80)")
- `action_when_off`: Action to execute when sliding while entity is OFF
- `action_when_on`: Action to execute when sliding while entity is ON

### Action Configuration
- `action`: Currently only `call-service` is supported
- `service`: Home Assistant service to call (e.g., `light.turn_on`, `switch.turn_off`)
- `target`: Target for the service call
  - `entity_id`: Target specific entity(ies)
  - `device_id`: Target specific device(ies)  
  - `area_id`: Target specific area(s)
- `data`: Additional data to pass to the service

## Color Customization

You can customize the slider colors for different states:

```yaml
- name: Colorful Light
  entity: light.bedroom
  text_when_off: "Slide to turn on"
  text_when_on: "Slide to turn off"
  color_when_off: "#ff5722"     # Orange when OFF
  color_when_on: "#4caf50"      # Green when ON
  action_when_off:
    action: call-service
    service: light.turn_on
    target:
      entity_id: light.bedroom
  action_when_on:
    action: call-service
    service: light.turn_off
    target:
      entity_id: light.bedroom
```

Colors can be specified in any CSS format:
- Hex colors: `#ff5722`, `#4caf50`
- Named colors: `red`, `green`, `blue`
- RGB values: `rgb(255, 87, 34)`
- CSS variables: `var(--primary-color)`

If no custom colors are specified, the slider will use your Home Assistant theme's default colors.

## Dark Mode Support

The card automatically adapts to your Home Assistant theme, including dark mode:

- **Automatic Detection**: Follows your HA theme settings (light/dark mode)
- **Theme Integration**: Uses HA CSS variables for consistent styling
- **Custom Colors**: Your custom colors work in both light and dark themes
- **Fallback Support**: Graceful fallbacks if theme variables are missing

The slider will automatically adjust text colors, backgrounds, and shadows to ensure optimal visibility in both light and dark themes.

## Development

Build the production bundle into `dist/slide-confirm-card.js`:

```bash
npm install
npm run build
```

## How It Works

1. **State Detection**: The card monitors the specified entity's state
2. **Visual Position**: 
   - Left position = Entity is OFF
   - Right position = Entity is ON
3. **Slide Actions**:
   - When OFF: Slide left to right → Execute `action_when_off`
   - When ON: Slide right to left → Execute `action_when_on`
4. **Real-time Updates**: The slider position updates automatically when the entity state changes
