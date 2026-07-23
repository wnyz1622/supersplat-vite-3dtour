import { now } from "../../../core/time.js";
import { math } from "../../../core/math/math.js";
import { Color } from "../../../core/math/color.js";
import { Vec4 } from "../../../core/math/vec4.js";
import { GraphNode } from "../../../scene/graph-node.js";
import { Component } from "../component.js";
import { BUTTON_TRANSITION_MODE_SPRITE_CHANGE, BUTTON_TRANSITION_MODE_TINT } from "./constants.js";
import { ELEMENTTYPE_GROUP } from "../element/constants.js";
const VisualState = {
	DEFAULT: "DEFAULT",
	HOVER: "HOVER",
	PRESSED: "PRESSED",
	INACTIVE: "INACTIVE"
};
const STATES_TO_TINT_NAMES = {};
STATES_TO_TINT_NAMES[VisualState.DEFAULT] = "_defaultTint";
STATES_TO_TINT_NAMES[VisualState.HOVER] = "hoverTint";
STATES_TO_TINT_NAMES[VisualState.PRESSED] = "pressedTint";
STATES_TO_TINT_NAMES[VisualState.INACTIVE] = "inactiveTint";
const STATES_TO_SPRITE_ASSET_NAMES = {};
STATES_TO_SPRITE_ASSET_NAMES[VisualState.DEFAULT] = "_defaultSpriteAsset";
STATES_TO_SPRITE_ASSET_NAMES[VisualState.HOVER] = "hoverSpriteAsset";
STATES_TO_SPRITE_ASSET_NAMES[VisualState.PRESSED] = "pressedSpriteAsset";
STATES_TO_SPRITE_ASSET_NAMES[VisualState.INACTIVE] = "inactiveSpriteAsset";
const STATES_TO_SPRITE_FRAME_NAMES = {};
STATES_TO_SPRITE_FRAME_NAMES[VisualState.DEFAULT] = "_defaultSpriteFrame";
STATES_TO_SPRITE_FRAME_NAMES[VisualState.HOVER] = "hoverSpriteFrame";
STATES_TO_SPRITE_FRAME_NAMES[VisualState.PRESSED] = "pressedSpriteFrame";
STATES_TO_SPRITE_FRAME_NAMES[VisualState.INACTIVE] = "inactiveSpriteFrame";
class ButtonComponent extends Component {
	static EVENT_MOUSEDOWN = "mousedown";
	static EVENT_MOUSEUP = "mouseup";
	static EVENT_MOUSEENTER = "mouseenter";
	static EVENT_MOUSELEAVE = "mouseleave";
	static EVENT_CLICK = "click";
	static EVENT_TOUCHSTART = "touchstart";
	static EVENT_TOUCHEND = "touchend";
	static EVENT_TOUCHCANCEL = "touchcancel";
	static EVENT_TOUCHLEAVE = "touchleave";
	static EVENT_SELECTSTART = "selectstart";
	static EVENT_SELECTEND = "selectend";
	static EVENT_SELECTENTER = "selectenter";
	static EVENT_SELECTLEAVE = "selectleave";
	static EVENT_HOVERSTART = "hoverstart";
	static EVENT_HOVEREND = "hoverend";
	static EVENT_PRESSEDSTART = "pressedstart";
	static EVENT_PRESSEDEND = "pressedend";
	_active = true;
	_hitPadding = new Vec4();
	_transitionMode = BUTTON_TRANSITION_MODE_TINT;
	_hoverTint = new Color(0.75, 0.75, 0.75);
	_pressedTint = new Color(0.5, 0.5, 0.5);
	_inactiveTint = new Color(0.25, 0.25, 0.25);
	_fadeDuration = 0;
	_hoverSpriteAsset = null;
	_hoverSpriteFrame = 0;
	_pressedSpriteAsset = null;
	_pressedSpriteFrame = 0;
	_inactiveSpriteAsset = null;
	_inactiveSpriteFrame = 0;
	_visualState = VisualState.DEFAULT;
	_isHovering = false;
	_hoveringCounter = 0;
	_isPressed = false;
	_hasHitElementListeners = false;
	_isApplyingTint = false;
	_isApplyingSprite = false;
	_tweenInfo = null;
	_defaultTint = new Color(1, 1, 1, 1);
	_defaultSpriteAsset = null;
	_defaultSpriteFrame = 0;
	_imageEntity = null;
	_evtElementAdd = null;
	_evtImageEntityElementAdd = null;
	_evtImageEntityElementRemove = null;
	_evtImageEntityElementColor = null;
	_evtImageEntityElementOpacity = null;
	_evtImageEntityElementSpriteAsset = null;
	_evtImageEntityElementSpriteFrame = null;
	constructor(system, entity) {
		super(system, entity);
		this._evtElementAdd = this.entity.on("element:add", this._onElementComponentAdd, this);
	}
	set active(arg) {
		if (this._active === arg) {
			return;
		}
		this._active = arg;
		this._updateVisualState();
	}
	get active() {
		return this._active;
	}
	set imageEntity(arg) {
		let newEntity;
		if (arg instanceof GraphNode) {
			newEntity = arg;
		} else if (typeof arg === "string") {
			newEntity = this.system.app.getEntityFromIndex(arg) ?? null;
		} else {
			newEntity = null;
		}
		if (this._imageEntity === newEntity) {
			return;
		}
		if (this._imageEntity) {
			this._imageEntityUnsubscribe();
		}
		this._imageEntity = newEntity;
		if (newEntity) {
			this._imageEntitySubscribe();
		}
	}
	get imageEntity() {
		return this._imageEntity;
	}
	set hitPadding(arg) {
		if (!arg) {
			this._hitPadding = arg;
		} else if (arg instanceof Vec4) {
			this._hitPadding = arg.clone();
		} else {
			this._hitPadding = new Vec4(arg[0], arg[1], arg[2], arg[3]);
		}
	}
	get hitPadding() {
		return this._hitPadding;
	}
	set transitionMode(arg) {
		if (this._transitionMode === arg) {
			return;
		}
		const oldMode = this._transitionMode;
		this._transitionMode = arg;
		this._cancelTween();
		this._resetToDefaultVisualState(oldMode);
		this._forceReapplyVisualState();
	}
	get transitionMode() {
		return this._transitionMode;
	}
	set hoverTint(arg) {
		this._setTint("_hoverTint", arg);
	}
	get hoverTint() {
		return this._hoverTint;
	}
	set pressedTint(arg) {
		this._setTint("_pressedTint", arg);
	}
	get pressedTint() {
		return this._pressedTint;
	}
	set inactiveTint(arg) {
		this._setTint("_inactiveTint", arg);
	}
	get inactiveTint() {
		return this._inactiveTint;
	}
	set fadeDuration(arg) {
		this._fadeDuration = arg;
	}
	get fadeDuration() {
		return this._fadeDuration;
	}
	set hoverSpriteAsset(arg) {
		this._setTransitionValue("_hoverSpriteAsset", arg);
	}
	get hoverSpriteAsset() {
		return this._hoverSpriteAsset;
	}
	set hoverSpriteFrame(arg) {
		this._setTransitionValue("_hoverSpriteFrame", arg);
	}
	get hoverSpriteFrame() {
		return this._hoverSpriteFrame;
	}
	set pressedSpriteAsset(arg) {
		this._setTransitionValue("_pressedSpriteAsset", arg);
	}
	get pressedSpriteAsset() {
		return this._pressedSpriteAsset;
	}
	set pressedSpriteFrame(arg) {
		this._setTransitionValue("_pressedSpriteFrame", arg);
	}
	get pressedSpriteFrame() {
		return this._pressedSpriteFrame;
	}
	set inactiveSpriteAsset(arg) {
		this._setTransitionValue("_inactiveSpriteAsset", arg);
	}
	get inactiveSpriteAsset() {
		return this._inactiveSpriteAsset;
	}
	set inactiveSpriteFrame(arg) {
		this._setTransitionValue("_inactiveSpriteFrame", arg);
	}
	get inactiveSpriteFrame() {
		return this._inactiveSpriteFrame;
	}
	_setTint(name, arg) {
		const oldValue = this[name];
		let value;
		if (!arg) {
			value = arg;
		} else if (arg instanceof Color) {
			value = arg.clone();
		} else {
			value = new Color(arg[0], arg[1], arg[2], arg[3]);
		}
		this[name] = value;
		if (oldValue === value || oldValue instanceof Color && value instanceof Color && oldValue.equals(value)) {
			return;
		}
		this._forceReapplyVisualState();
	}
	_setTransitionValue(name, arg) {
		if (this[name] === arg) {
			return;
		}
		this[name] = arg;
		this._forceReapplyVisualState();
	}
	_imageEntitySubscribe() {
		this._evtImageEntityElementAdd = this._imageEntity.on("element:add", this._onImageElementGain, this);
		if (this._imageEntity.element) {
			this._onImageElementGain();
		}
	}
	_imageEntityUnsubscribe() {
		this._evtImageEntityElementAdd?.off();
		this._evtImageEntityElementAdd = null;
		if (this._imageEntity?.element) {
			this._onImageElementLose();
		}
	}
	_imageEntityElementSubscribe() {
		const element = this._imageEntity.element;
		this._evtImageEntityElementRemove = element.once("beforeremove", this._onImageElementLose, this);
		this._evtImageEntityElementColor = element.on("set:color", this._onSetColor, this);
		this._evtImageEntityElementOpacity = element.on("set:opacity", this._onSetOpacity, this);
		this._evtImageEntityElementSpriteAsset = element.on("set:spriteAsset", this._onSetSpriteAsset, this);
		this._evtImageEntityElementSpriteFrame = element.on("set:spriteFrame", this._onSetSpriteFrame, this);
	}
	_imageEntityElementUnsubscribe() {
		this._evtImageEntityElementRemove?.off();
		this._evtImageEntityElementRemove = null;
		this._evtImageEntityElementColor?.off();
		this._evtImageEntityElementColor = null;
		this._evtImageEntityElementOpacity?.off();
		this._evtImageEntityElementOpacity = null;
		this._evtImageEntityElementSpriteAsset?.off();
		this._evtImageEntityElementSpriteAsset = null;
		this._evtImageEntityElementSpriteFrame?.off();
		this._evtImageEntityElementSpriteFrame = null;
	}
	_onElementComponentRemove() {
		this._toggleHitElementListeners("off");
	}
	_onElementComponentAdd() {
		this._toggleHitElementListeners("on");
	}
	_onImageElementLose() {
		this._imageEntityElementUnsubscribe();
		this._cancelTween();
		this._resetToDefaultVisualState(this.transitionMode);
	}
	_onImageElementGain() {
		this._imageEntityElementSubscribe();
		this._storeDefaultVisualState();
		this._forceReapplyVisualState();
	}
	_toggleHitElementListeners(onOrOff) {
		if (this.entity.element) {
			const isAdding = onOrOff === "on";
			if (isAdding && this._hasHitElementListeners) {
				return;
			}
			this.entity.element[onOrOff]("beforeremove", this._onElementComponentRemove, this);
			this.entity.element[onOrOff]("mouseenter", this._onMouseEnter, this);
			this.entity.element[onOrOff]("mouseleave", this._onMouseLeave, this);
			this.entity.element[onOrOff]("mousedown", this._onMouseDown, this);
			this.entity.element[onOrOff]("mouseup", this._onMouseUp, this);
			this.entity.element[onOrOff]("touchstart", this._onTouchStart, this);
			this.entity.element[onOrOff]("touchend", this._onTouchEnd, this);
			this.entity.element[onOrOff]("touchleave", this._onTouchLeave, this);
			this.entity.element[onOrOff]("touchcancel", this._onTouchCancel, this);
			this.entity.element[onOrOff]("selectstart", this._onSelectStart, this);
			this.entity.element[onOrOff]("selectend", this._onSelectEnd, this);
			this.entity.element[onOrOff]("selectenter", this._onSelectEnter, this);
			this.entity.element[onOrOff]("selectleave", this._onSelectLeave, this);
			this.entity.element[onOrOff]("click", this._onClick, this);
			this._hasHitElementListeners = isAdding;
		}
	}
	_storeDefaultVisualState() {
		const element = this._imageEntity?.element;
		if (!element || element.type === ELEMENTTYPE_GROUP) {
			return;
		}
		this._storeDefaultColor(element.color);
		this._storeDefaultOpacity(element.opacity);
		this._storeDefaultSpriteAsset(element.spriteAsset);
		this._storeDefaultSpriteFrame(element.spriteFrame);
	}
	_storeDefaultColor(color) {
		this._defaultTint.r = color.r;
		this._defaultTint.g = color.g;
		this._defaultTint.b = color.b;
	}
	_storeDefaultOpacity(opacity) {
		this._defaultTint.a = opacity;
	}
	_storeDefaultSpriteAsset(spriteAsset) {
		this._defaultSpriteAsset = spriteAsset;
	}
	_storeDefaultSpriteFrame(spriteFrame) {
		this._defaultSpriteFrame = spriteFrame;
	}
	_onSetColor(color) {
		if (!this._isApplyingTint) {
			this._storeDefaultColor(color);
			this._forceReapplyVisualState();
		}
	}
	_onSetOpacity(opacity) {
		if (!this._isApplyingTint) {
			this._storeDefaultOpacity(opacity);
			this._forceReapplyVisualState();
		}
	}
	_onSetSpriteAsset(spriteAsset) {
		if (!this._isApplyingSprite) {
			this._storeDefaultSpriteAsset(spriteAsset);
			this._forceReapplyVisualState();
		}
	}
	_onSetSpriteFrame(spriteFrame) {
		if (!this._isApplyingSprite) {
			this._storeDefaultSpriteFrame(spriteFrame);
			this._forceReapplyVisualState();
		}
	}
	_onMouseEnter(event) {
		this._isHovering = true;
		this._updateVisualState();
		this._fireIfActive("mouseenter", event);
	}
	_onMouseLeave(event) {
		this._isHovering = false;
		this._isPressed = false;
		this._updateVisualState();
		this._fireIfActive("mouseleave", event);
	}
	_onMouseDown(event) {
		this._isPressed = true;
		this._updateVisualState();
		this._fireIfActive("mousedown", event);
	}
	_onMouseUp(event) {
		this._isPressed = false;
		this._updateVisualState();
		this._fireIfActive("mouseup", event);
	}
	_onTouchStart(event) {
		this._isPressed = true;
		this._updateVisualState();
		this._fireIfActive("touchstart", event);
	}
	_onTouchEnd(event) {
		event.event.preventDefault();
		this._isPressed = false;
		this._updateVisualState();
		this._fireIfActive("touchend", event);
	}
	_onTouchLeave(event) {
		this._isPressed = false;
		this._updateVisualState();
		this._fireIfActive("touchleave", event);
	}
	_onTouchCancel(event) {
		this._isPressed = false;
		this._updateVisualState();
		this._fireIfActive("touchcancel", event);
	}
	_onSelectStart(event) {
		this._isPressed = true;
		this._updateVisualState();
		this._fireIfActive("selectstart", event);
	}
	_onSelectEnd(event) {
		this._isPressed = false;
		this._updateVisualState();
		this._fireIfActive("selectend", event);
	}
	_onSelectEnter(event) {
		this._hoveringCounter++;
		if (this._hoveringCounter === 1) {
			this._isHovering = true;
			this._updateVisualState();
		}
		this._fireIfActive("selectenter", event);
	}
	_onSelectLeave(event) {
		this._hoveringCounter--;
		if (this._hoveringCounter === 0) {
			this._isHovering = false;
			this._isPressed = false;
			this._updateVisualState();
		}
		this._fireIfActive("selectleave", event);
	}
	_onClick(event) {
		this._fireIfActive("click", event);
	}
	_fireIfActive(name, event) {
		if (this._active) {
			this.fire(name, event);
		}
	}
	_updateVisualState(force) {
		const oldVisualState = this._visualState;
		const newVisualState = this._determineVisualState();
		if ((oldVisualState !== newVisualState || force) && this.enabled) {
			this._visualState = newVisualState;
			if (oldVisualState === VisualState.HOVER) {
				this._fireIfActive("hoverend");
			}
			if (oldVisualState === VisualState.PRESSED) {
				this._fireIfActive("pressedend");
			}
			if (newVisualState === VisualState.HOVER) {
				this._fireIfActive("hoverstart");
			}
			if (newVisualState === VisualState.PRESSED) {
				this._fireIfActive("pressedstart");
			}
			switch (this.transitionMode) {
				case BUTTON_TRANSITION_MODE_TINT: {
					const tintName = STATES_TO_TINT_NAMES[this._visualState];
					const tintColor = this[tintName];
					this._applyTint(tintColor);
					break;
				}
				case BUTTON_TRANSITION_MODE_SPRITE_CHANGE: {
					const spriteAssetName = STATES_TO_SPRITE_ASSET_NAMES[this._visualState];
					const spriteFrameName = STATES_TO_SPRITE_FRAME_NAMES[this._visualState];
					const spriteAsset = this[spriteAssetName];
					const spriteFrame = this[spriteFrameName];
					this._applySprite(spriteAsset, spriteFrame);
					break;
				}
			}
		}
	}
	// Called when a property changes that mean the visual state must be reapplied,
	// even if the state enum has not changed. Examples of this are when the tint
	// value for one of the states is changed via the editor.
	_forceReapplyVisualState() {
		this._updateVisualState(true);
	}
	// Called before the image entity changes, in order to restore the previous
	// image back to its original tint. Note that this happens immediately, i.e.
	// without any animation.
	_resetToDefaultVisualState(transitionMode) {
		if (!this._imageEntity?.element) {
			return;
		}
		switch (transitionMode) {
			case BUTTON_TRANSITION_MODE_TINT:
				this._cancelTween();
				this._applyTintImmediately(this._defaultTint);
				break;
			case BUTTON_TRANSITION_MODE_SPRITE_CHANGE:
				this._applySprite(this._defaultSpriteAsset, this._defaultSpriteFrame);
				break;
		}
	}
	_determineVisualState() {
		if (!this.active) {
			return VisualState.INACTIVE;
		} else if (this._isPressed) {
			return VisualState.PRESSED;
		} else if (this._isHovering) {
			return VisualState.HOVER;
		}
		return VisualState.DEFAULT;
	}
	_applySprite(spriteAsset, spriteFrame) {
		const element = this._imageEntity?.element;
		if (!element) {
			return;
		}
		spriteFrame = spriteFrame || 0;
		this._isApplyingSprite = true;
		if (element.spriteAsset !== spriteAsset) {
			element.spriteAsset = spriteAsset;
		}
		if (element.spriteFrame !== spriteFrame) {
			element.spriteFrame = spriteFrame;
		}
		this._isApplyingSprite = false;
	}
	_applyTint(tintColor) {
		this._cancelTween();
		if (this.fadeDuration === 0) {
			this._applyTintImmediately(tintColor);
		} else {
			this._applyTintWithTween(tintColor);
		}
	}
	_applyTintImmediately(tintColor) {
		const element = this._imageEntity?.element;
		if (!tintColor || !element || element.type === ELEMENTTYPE_GROUP) {
			return;
		}
		const color3 = toColor3(tintColor);
		this._isApplyingTint = true;
		if (!color3.equals(element.color)) {
			element.color = color3;
		}
		if (element.opacity !== tintColor.a) {
			element.opacity = tintColor.a;
		}
		this._isApplyingTint = false;
	}
	_applyTintWithTween(tintColor) {
		const element = this._imageEntity?.element;
		if (!tintColor || !element || element.type === ELEMENTTYPE_GROUP) {
			return;
		}
		const color3 = toColor3(tintColor);
		const color = element.color;
		const opacity = element.opacity;
		if (color3.equals(color) && tintColor.a === opacity) return;
		this._tweenInfo = {
			startTime: now(),
			from: new Color(color.r, color.g, color.b, opacity),
			to: tintColor.clone(),
			lerpColor: new Color()
		};
	}
	_updateTintTween() {
		const elapsedTime = now() - this._tweenInfo.startTime;
		let elapsedProportion = this.fadeDuration === 0 ? 1 : elapsedTime / this.fadeDuration;
		elapsedProportion = math.clamp(elapsedProportion, 0, 1);
		if (Math.abs(elapsedProportion - 1) > 1e-5) {
			const lerpColor = this._tweenInfo.lerpColor;
			lerpColor.lerp(this._tweenInfo.from, this._tweenInfo.to, elapsedProportion);
			this._applyTintImmediately(
				new Color(lerpColor.r, lerpColor.g, lerpColor.b, lerpColor.a)
			);
		} else {
			this._applyTintImmediately(this._tweenInfo.to);
			this._cancelTween();
		}
	}
	_cancelTween() {
		this._tweenInfo = null;
	}
	onUpdate() {
		if (this._tweenInfo) {
			this._updateTintTween();
		}
	}
	onEnable() {
		this._isHovering = false;
		this._hoveringCounter = 0;
		this._isPressed = false;
		this._toggleHitElementListeners("on");
		this._forceReapplyVisualState();
	}
	onDisable() {
		this._toggleHitElementListeners("off");
		this._resetToDefaultVisualState(this.transitionMode);
	}
	onBeforeRemove() {
		this._imageEntityUnsubscribe();
		this._evtElementAdd?.off();
		this._evtElementAdd = null;
		this.onDisable();
	}
	resolveDuplicatedEntityReferenceProperties(oldButton, duplicatedIdsMap) {
		if (oldButton.imageEntity) {
			this.imageEntity = duplicatedIdsMap[oldButton.imageEntity.guid];
		}
	}
}
function toColor3(color4) {
	return new Color(color4.r, color4.g, color4.b);
}
export {
	ButtonComponent
};
