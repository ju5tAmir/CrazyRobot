export default interface MoveDetails {
  engine: boolean;
  move: {
    isMoving: boolean;
    value: string;
  };
  direction: {
    isTurning: boolean;
    value: string;
  };
  speed: number;
}
