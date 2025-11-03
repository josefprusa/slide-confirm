import { css } from "lit";

export const slideConfirmStyles = css`
  /* Dark mode detection and theme support */
  :host {
    --slide-text-color: var(--primary-text-color, var(--text-color, #212121));
    --slide-background: var(--card-background-color, var(--primary-background-color, #fafafa));
    --slide-border-color: var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  /* Dark mode specific overrides */
  @media (prefers-color-scheme: dark) {
    :host {
      --slide-text-color: var(--primary-text-color, var(--text-color, #ffffff));
      --slide-background: var(--card-background-color, var(--primary-background-color, #121212));
      --slide-border-color: var(--divider-color, rgba(255, 255, 255, 0.12));
    }
  }

  .entity-state {
    font-size: 0.8em;
    color: var(--secondary-text-color);
    margin: 4px 0;
  }

  .slide-confirm{
    color: var(--slide-text-color);
    border-radius:30px;
    padding:0;
    font-size:.75em;
    position:relative;
    user-select:none;
    -moz-user-select:none;
    -webkit-user-select:none;
    margin: 8px 0;
    /* Dark mode support */
    background: transparent;
  }
  
  .slide-confirm-track {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: var(--slider-color, var(--switch-unchecked-track-color, #e0e0e0));
    transition: background-color 500ms;
    opacity: 0.38;
    border-radius: 30px;
  }

  .slide-confirm-text{
    display: inline-block;
    position: absolute;
    left: 0;
    width: 100%;
    top: 50%;
    text-align: center;
    transform: translateY(-50%);
    font-size: 1rem;
    color: var(--slide-text-color);
    /* Ensure text is readable in dark mode */
    text-shadow: none;
  }
  .slide-confirm-handle{
    position:relative;
    top:0;
    left:0;
    width:50px;
    height:50px;
    border-radius:25px;
    border: 1px solid var(--slider-color, var(--switch-unchecked-button-color, #e0e0e0));
    background-color: var(--slider-color, var(--switch-unchecked-button-color, #fafafa));
    /* Enhanced shadow for better visibility in dark mode */
    box-shadow: 
      rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, 
      rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, 
      rgba(0, 0, 0, 0.12) 0px 1px 5px 0px,
      0 0 0 1px rgba(255, 255, 255, 0.1);
    box-sizing:border-box;
    text-align:center;
    font-size:20px;
    line-height: 1;
    font-family:serif;
    color: var(--slide-text-color);
    user-select: none;
    touch-action: none;
    transition: transform 300ms, background-color 300ms, border-color 300ms;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .slide-confirm-handle.dragging {
    transition: none;
  }
  
  .slide-confirm-handle.no-transition {
    transition: none !important;
  }
  
  .slide-confirm-handle:hover {
    cursor:-webkit-grab;
    cursor:grab
  }
  .slide-confirm-handle:active {
    cursor:-webkit-grabbing;
    cursor:grabbing
  }

  .slide-confirm.confirmed {
    color: var(--slide-text-color);
  }
  
  .slide-confirm.confirmed .slide-confirm-track {
    background-color: var(--slider-color, var(--switch-checked-track-color, #4caf50));
    opacity: 0.54;
  }
  
  .slide-confirm.confirmed .slide-confirm-handle {
    border: 1px solid var(--slider-color, var(--switch-checked-button-color, #4caf50));
    background-color: var(--slider-color, var(--switch-checked-button-color, #4caf50));
    color: var(--text-on-primary-color, var(--primary-background-color, white));
  }
  
  .slide-confirm .unconfirmed {
    display: block;
  }
  
  .slide-confirm .confirmed {
    display: none;
  }
  
  .slide-confirm.confirmed .unconfirmed {
    display: none;
  }
  
  .slide-confirm.confirmed .confirmed {
    display: block;
  }
`;
