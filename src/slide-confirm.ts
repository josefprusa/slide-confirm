import { CSSResult, LitElement } from 'lit';
import { html, TemplateResult } from 'lit/development';
import { state } from 'lit/decorators/state';
import { property } from 'lit/decorators/property';
import { query } from 'lit/decorators/query';
import { slideConfirmStyles } from './card.styles';

export interface SlideConfirmButtonConfig {
	name: string;
	label?: string;
	icon?: string;
	entity: string;
	// Icons for different states
	icon_when_on?: string;
	icon_when_off?: string;
	// Text for different states  
	text_when_on?: string;    // Text shown when entity is ON
	text_when_off?: string;   // Text shown when entity is OFF
	// Colors for different states
	color_when_on?: string;   // Color when entity is ON
	color_when_off?: string;  // Color when entity is OFF
	// Actions for different states
	action_when_on?: {        // Action to execute when sliding while entity is ON
		action: string;
		service: string;
		target?: {
			entity_id?: string | string[];
			device_id?: string | string[];
			area_id?: string | string[];
		};
		data?: Record<string, any>;
	};
	action_when_off?: {       // Action to execute when sliding while entity is OFF  
		action: string;
		service: string;
		target?: {
			entity_id?: string | string[];
			device_id?: string | string[];
			area_id?: string | string[];
		};
		data?: Record<string, any>;
	};
};

export class SlideConfirmButton extends LitElement {
	@property({ attribute: false })
	public hass!: any;

	@property({ attribute: false })
	public config!: SlideConfirmButtonConfig;

	@state()
	private _confirmed = false;

	@state()
	private _isDragging = false;

	@query(".slide-confirm")
	private _container;

	@query(".slide-confirm-handle")
	private _handle;

	static styles: CSSResult = slideConfirmStyles;

	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();
	}

	updated(changedProperties: Map<string | number | symbol, unknown>) {
		super.updated(changedProperties);
		
		// Check if entity state actually changed when hass updates
		if (changedProperties.has('hass') && this.hass && this.config?.entity) {
			const currentState = this.hass.states[this.config.entity]?.state;
			
			// Check if this is the first time we're setting the state
			const isFirstLoad = this._lastKnownState === undefined;
			
			// Only update if state actually changed AND we're not currently dragging
			if (currentState !== this._lastKnownState && !this._isDragging) {
				this._lastKnownState = currentState;
				
				// Update handle position when entity state changes
				if (this._handle && this._container) {
					// Use setTimeout to allow DOM to settle first
					setTimeout(() => {
						// Animate only if it's NOT the first load
						this._updateHandlePosition(!isFirstLoad);
					}, isFirstLoad ? 50 : 10);
				}
			}
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	private _lastKnownState: string | undefined;

	private _updateHandlePosition(animate: boolean = false) {
		// Don't update position while dragging
		if (!this._handle || !this._container || this._isDragging) return;
		
		// Control animation via CSS class instead of inline styles
		if (!animate) {
			this._handle.classList.add('no-transition');
		} else {
			this._handle.classList.remove('no-transition');
		}
		
		// Get current entity state directly from hass every time
		const currentState = this.hass?.states?.[this.config?.entity]?.state;
		const isOn = currentState === 'on';
		
		if (isOn) {
			// Entity is ON, position handle at right
			const maxX = this._container.clientWidth - this._handle.clientWidth;
			this._handle.style.transform = `translateX(${maxX}px)`;
		} else {
			// Entity is OFF, position handle at left
			this._handle.style.transform = `translateX(0px)`;
		}
		
		// Force reflow to ensure the position is set without animation
		if (!animate) {
			this._handle.offsetHeight; // Force reflow
			setTimeout(() => {
				if (this._handle) {
					this._handle.classList.remove('no-transition');
				}
			}, 50);
		}
	}

	private get _isEntityOn(): boolean {
		// Always get fresh state from hass
		const currentState = this.hass?.states?.[this.config?.entity]?.state;
		
		// Simple but effective: most entities use 'on'/'off'
		// For other types, we can extend this later if needed
		return currentState === 'on';
	}

	private get _currentAction() {
		// Return the appropriate action based on entity state
		if (this._isEntityOn) {
			return this.config.action_when_on;
		} else {
			return this.config.action_when_off;
		}
	}

	private get _currentText(): string {
		if (this._isEntityOn) {
			return this.config.text_when_on || 'Slide to turn off';
		} else {
			return this.config.text_when_off || 'Slide to turn on';
		}
	}

	private get _currentIcon(): string {
		if (this._isEntityOn) {
			return this.config.icon_when_on || 'mdi:lightbulb-on';
		} else {
			return this.config.icon_when_off || 'mdi:lightbulb-off';
		}
	}

	private get _currentColor(): string | undefined {
		if (this._isEntityOn) {
			return this.config.color_when_on;
		} else {
			return this.config.color_when_off;
		}
	}

	private get _sliderPosition(): 'left' | 'right' {
		// Links = uit, rechts = aan
		return this._isEntityOn ? 'right' : 'left';
	}

	dragStart(e) {
		if (this._confirmed) return;
		
		this._isDragging = true;
		this._handle.classList.add("dragging");
		this._handle.onpointermove = this.drag.bind(this);
		this._handle.setPointerCapture(e.pointerId);
		
		// Remove any transition for immediate drag response
		this._handle.style.transition = '';
		
		// Set initial position based on entity state
		// Links = uit (OFF), rechts = aan (ON)
		if (this._isEntityOn) {
			// Entity is ON, handle starts at right position
			const maxX = this._container.clientWidth - this._handle.clientWidth;
			this._handle.style.transform = `translateX(${maxX}px)`;
		} else {
			// Entity is OFF, handle starts at left position
			this._handle.style.transform = `translateX(0px)`;
		}
	}

	dragEnd(e) {
		let x = this._calculateX(e);
		let confirmed = false;
		
		// Clean up drag state FIRST
		this._handle.classList.remove("dragging");
		this._handle.onpointermove = null;
		this._handle.releasePointerCapture(e.pointerId);
		this._isDragging = false;
		
		// Determine if action should be triggered based on slide direction and entity state
		if (this._isEntityOn) {
			// Entity is ON, slide from right to left to turn OFF
			confirmed = x <= 0;
		} else {
			// Entity is OFF, slide from left to right to turn ON
			confirmed = x + e.target.clientWidth >= this._container.clientWidth;
		}
		
		if (confirmed && !this._confirmed) {
			this._confirmed = true;
			this._container.classList.add("confirmed");
			
			const actionToExecute = this._currentAction;
			if (actionToExecute) {
				const payload = {
					detail: actionToExecute,
					bubbles: true,
					composed: true
				};
				this.dispatchEvent(new CustomEvent("call-action", payload));
			}

			setTimeout(() => {
				this._container.classList.remove("confirmed");
				this._confirmed = false;
				// Wait a bit for the entity state to update, then reset handle position with animation
				setTimeout(() => {
					this._updateHandlePosition(true);
				}, 100);
			}, 1500);
		} else {
			// Reset handle to current entity state position immediately with animation
			this._updateHandlePosition(true);
		}
	}

	private _calculateX(e) {
		let bounds = this._container.getBoundingClientRect();
		let x = e.clientX - bounds.x - (e.target.clientWidth / 2);

		// Keep the handle within the container
		if (x < 0) {
			x = 0;
		} else if (x + e.target.clientWidth >= this._container.clientWidth) {
			x = this._container.clientWidth - e.target.clientWidth;
		}

		return x;
	}

	drag(e) {
		// Remove any existing transition during drag
		this._handle.style.transition = '';
		this._handle.style.transform = `translateX(${this._calculateX(e)}px)`;
	}

	render() {
		let content: TemplateResult;

		// Get current state and display values
		const entityState = this.hass?.states?.[this.config?.entity]?.state || 'unknown';
		const isOn = this._isEntityOn;
		const currentText = this._currentText;
		const currentIcon = this._currentIcon;
		const currentColor = this._currentColor;
		const sliderPosition = this._sliderPosition;

		content = html`
			${this.config.icon ? html`<ha-icon icon="${this.config.icon}" />` : ''}
			${this.config.name ? html`<span class="slide-name">${this.config.name}</span>` : ''}
			${this.config.label ? html`<span class="slide-label">${this.config.label}</span>` : ''}
			<div class="slide-confirm ${isOn ? 'entity-on' : 'entity-off'}" 
			     data-position="${sliderPosition}"
			     style="${currentColor ? `--slider-color: ${currentColor};` : ''}">
				<div class="slide-confirm-track"></div>
				<div class="slide-confirm-text unconfirmed">${currentText}</div>
				<div class="slide-confirm-text confirmed">Action completed!</div>
				<div class="slide-confirm-handle"
				     @touchstart="${e => this.dragStart(e)}"
				     @touchend="${e => this.dragEnd(e)}"
				     @pointerdown="${e => this.dragStart(e)}"
				     @pointerup="${e => this.dragEnd(e)}" >
					<div class="slide-confirm-icon">
						<ha-icon icon="${currentIcon}" />
					</div>
				</div>
			</div>
		`;

		return content;
	}
}
