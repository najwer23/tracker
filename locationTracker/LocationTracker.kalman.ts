// kalman.ts
export class SimpleKalmanFilter {
  private R: number; // If your measurements are very noisy or unreliable, R will be large. If your measurements are usually accurate, R will be small. So, R tells the Kalman filter how much to trust the measurements.
  private Q: number; // If the car’s movement is very unpredictable, Q is large. If the car moves very predictably, Q is small. So, Q tells the Kalman filter how much to trust your model of the system’s behavior.
  private A: number;
  private B: number;
  private C: number;
  private cov: number | null;
  private x: number | null;

  constructor(R = 6, Q = 0.3) {
    this.R = R;
    this.Q = Q;
    this.A = 1;
    this.B = 0;
    this.C = 1;
    this.cov = null;
    this.x = null;
  }

  filter(z: number, u = 0): number {
    if (this.x === null) {
      this.x = (1 / this.C) * z;
      this.cov = (1 / this.C) * this.Q * (1 / this.C);
    } else {
      // Prediction
      const predX = this.A * this.x + this.B * u;
      const predCov = (this.A * (this.cov as number) * this.A) + this.R;

      // Kalman gain
      const K = predCov * this.C / (this.C * predCov * this.C + this.Q);

      // Correction
      this.x = predX + K * (z - this.C * predX);
      this.cov = predCov - K * this.C * predCov;
    }
    return this.x;
  }

  lastMeasurement(): number | null {
    return this.x;
  }
}
