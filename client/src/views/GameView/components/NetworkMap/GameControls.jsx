import { PHASES, useGameContext } from "../../../../contexts/GameContext";
import { useTimer } from "../../../../hooks/useTimer";

/**
 * Renders the top control bar inside the NetworkMap.
 * Handles the game start button, the countdown timer during planning,
 * the route submission button, and the map maximize/minimize toggle.
 * 
 * @param {object} props
 * @param {boolean} props.isExpanded - Whether the map is currently expanded/maximized.
 * @param {function} props.setIsExpanded - Callback to toggle the map expansion state.
 * @param {function} props.onSubmit - Callback triggered when the user finishes planning and submits the route.
 */
function GameControls({ isExpanded, setIsExpanded, onSubmit }) {
    const { phase, currentGame, gameActions } = useGameContext();
    const { startGame, resetToSetup } = gameActions;
    const { timeLeft, start: startTimer } = useTimer(phase === PHASES.PLANNING, () => {
        onSubmit(true);
    });

    const handleStartGame = async () => {
        const game = await startGame();
        if (game) {
            startTimer(90);
        }
    };

    const getTitle = () => {
        switch (phase) {
            case PHASES.SETUP: return 'Game Setup';
            case PHASES.PLANNING: return 'Route Planning';
            case PHASES.EXECUTION: return 'Journey Execution';
            case PHASES.RESULT: return 'Final Results';
            default: return '';
        }
    };

    const getSubTitle = () => {
        if (phase === PHASES.PLANNING && currentGame) {
            return `Go from ${currentGame.start.name} to ${currentGame.destination.name}`;
        }
        if (phase === PHASES.SETUP) {
            return "Click on START RACE button to play!";
        }
        if (phase === PHASES.EXECUTION) {
            return "Good Luck!"
        }
        return 'Nice Play!';
    };
    return (
        <header className="map-header">
            <div className="header-left">
                <div className="header-titles">
                    <h3>{getTitle()}</h3>
                    <p className="header-subtitle">{getSubTitle()}</p>
                </div>
            </div>
            <div className="header-right">
                {phase === PHASES.SETUP && (
                    <button onClick={handleStartGame} className="expand-button action-btn-blue">START RACE</button>
                )}

                {phase === PHASES.PLANNING && (
                    <>
                        <div className={`timer-compact ${timeLeft < 20 ? 'timer-urgent' : 'timer-normal'}`}>
                            {String(timeLeft).padStart(2, '0')}s
                        </div>
                        <button onClick={onSubmit} className="expand-button action-btn-green">FINISH PLAN</button>
                    </>
                )}

                {phase === PHASES.RESULT && (
                    <button onClick={resetToSetup} className="expand-button action-btn-blue">NEW GAME</button>
                )}

                <button onClick={() => setIsExpanded(!isExpanded)} className="expand-button">
                    {isExpanded ? '⏹ Minimize' : '⛶ Maximize'}
                </button>
            </div>
        </header>
    )
}

export default GameControls