/**
 * Mobile VFX Performance Testing Utility
 *
 * This module provides tools for testing visual effects on low-end mobile devices.
 * It measures FPS, memory usage, and animation smoothness during pack opening.
 *
 * Usage:
 * 1. Open the app on a low-end device (iPhone SE 2020 or equivalent Android)
 * 2. Run the test suite by importing and executing testMobileVFX()
 * 3. Review the generated report for performance issues
 */

export interface PerformanceMetrics {
  fps: number;
  frameDrops: number;
  avgFrameTime: number;
  maxFrameTime: number;
  memoryUsage?: number;
  deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
  userAgent: string;
  isMobile: boolean;
  deviceMemory?: number;
  cores?: number;
  screenSize: { width: number; height: number };
  pixelRatio: number;
}

export interface VFXTestResult {
  testName: string;
  metrics: PerformanceMetrics;
  passed: boolean;
  issues: string[];
  recommendations: string[];
}

export class MobileVFXTester {
  private frameCount = 0;
  private startTime = 0;
  private frameTimes: number[] = [];
  private frameDrops = 0;
  private rafId: number | null = null;
  private isRecording = false;

  /**
   * Get device information
   */
  getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ),
      deviceMemory: 'deviceMemory' in navigator
        ? (navigator as Navigator & { deviceMemory: number }).deviceMemory
        : undefined,
      cores: navigator.hardwareConcurrency,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height,
      },
      pixelRatio: window.devicePixelRatio,
    };
  }

  /**
   * Start performance recording
   */
  startRecording(): void {
    if (this.isRecording) return;

    this.frameCount = 0;
    this.startTime = performance.now();
    this.frameTimes = [];
    this.frameDrops = 0;
    this.isRecording = true;

    this.measureFrame();
  }

  /**
   * Measure frame performance
   */
  private measureFrame(): void {
    if (!this.isRecording) return;

    const frameStart = performance.now();

    this.rafId = requestAnimationFrame(() => {
      const frameEnd = performance.now();
      const frameTime = frameEnd - frameStart;

      this.frameCount++;
      this.frameTimes.push(frameTime);

      // Track frame drops (frames longer than 20ms = <50fps)
      if (frameTime > 20) {
        this.frameDrops++;
      }

      this.measureFrame();
    });
  }

  /**
   * Stop recording and return metrics
   */
  stopRecording(): PerformanceMetrics {
    if (!this.isRecording) {
      throw new Error('Not currently recording');
    }

    this.isRecording = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const endTime = performance.now();
    const duration = endTime - this.startTime;

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const maxFrameTime = Math.max(...this.frameTimes);
    const fps = Math.round((this.frameCount * 1000) / duration);

    return {
      fps,
      frameDrops: this.frameDrops,
      avgFrameTime: Math.round(avgFrameTime * 100) / 100,
      maxFrameTime: Math.round(maxFrameTime * 100) / 100,
      memoryUsage: this.getMemoryUsage(),
      deviceInfo: this.getDeviceInfo(),
    };
  }

  /**
   * Get memory usage if available
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as Performance & {
        memory: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      }).memory;

      return Math.round((memory.usedJSHeapSize / 1048576) * 100) / 100; // Convert to MB
    }

    return undefined;
  }

  /**
   * Test particle effects performance
   */
  async testParticleEffects(
    particleCount: number,
    duration: number = 1500
  ): Promise<VFXTestResult> {
    const testName = `Particle Effects (${particleCount} particles)`;

    // Start recording
    this.startRecording();

    // Simulate particle animation
    await this.simulateParticleAnimation(particleCount, duration);

    // Stop recording and get metrics
    const metrics = this.stopRecording();

    // Analyze results
    const issues: string[] = [];
    const recommendations: string[] = [];
    let passed = true;

    // Check for frame drops
    if (metrics.fps < 55) {
      issues.push(`Low FPS: ${metrics.fps} (target: 60fps)`);
      passed = false;
    }

    if (metrics.frameDrops > 5) {
      issues.push(`Frame drops detected: ${metrics.frameDrops} frames`);
      passed = false;
    }

    if (metrics.maxFrameTime > 30) {
      issues.push(`Frame spike detected: ${metrics.maxFrameTime}ms`);
      passed = false;
    }

    // Generate recommendations
    if (metrics.fps < 50) {
      recommendations.push('Reduce particle count by 50% for low-end devices');
      recommendations.push('Use CSS containment for particle containers');
    }

    if (metrics.frameDrops > 3) {
      recommendations.push('Implement object pooling for particles');
      recommendations.push('Use requestAnimationFrame for all updates');
    }

    if (metrics.maxFrameTime > 25) {
      recommendations.push('Add GPU acceleration hints (will-change, transform: translateZ(0))');
    }

    return {
      testName,
      metrics,
      passed,
      issues,
      recommendations,
    };
  }

  /**
   * Test screen shake performance
   */
  async testScreenShake(duration: number = 300): Promise<VFXTestResult> {
    const testName = 'Screen Shake Effect';

    this.startRecording();

    // Simulate screen shake
    await this.simulateScreenShake(duration);

    const metrics = this.stopRecording();

    const issues: string[] = [];
    const recommendations: string[] = [];
    let passed = true;

    // Screen shake should be very lightweight
    if (metrics.fps < 58) {
      issues.push(`Screen shake causing jank: ${metrics.fps}fps`);
      passed = false;
    }

    if (metrics.maxFrameTime > 20) {
      issues.push(`Screen shake frame spike: ${metrics.maxFrameTime}ms`);
      passed = false;
    }

    if (!passed) {
      recommendations.push('Use CSS animations instead of JavaScript for shake');
      recommendations.push('Ensure shake animation uses transform only (no layout changes)');
    }

    return {
      testName,
      metrics,
      passed,
      issues,
      recommendations,
    };
  }

  /**
   * Test confetti effects performance
   */
  async testConfettiEffects(
    confettiCount: number,
    duration: number = 3000
  ): Promise<VFXTestResult> {
    const testName = `Confetti Effects (${confettiCount} particles)`;

    this.startRecording();

    await this.simulateConfetti(confettiCount, duration);

    const metrics = this.stopRecording();

    const issues: string[] = [];
    const recommendations: string[] = [];
    let passed = true;

    // Confetti is more expensive than particles
    if (metrics.fps < 50) {
      issues.push(`Confetti causing frame drops: ${metrics.fps}fps`);
      passed = false;
    }

    if (metrics.frameDrops > 10) {
      issues.push(`Significant frame drops: ${metrics.frameDrops} frames`);
      passed = false;
    }

    if (metrics.maxFrameTime > 35) {
      issues.push(`Confetti frame spike: ${metrics.maxFrameTime}ms`);
      passed = false;
    }

    if (!passed) {
      recommendations.push('Use canvas-based confetti (not DOM elements)');
      recommendations.push('Implement object pooling for confetti particles');
      recommendations.push('Reduce confetti count on low-end devices');
      recommendations.push('Use throttled RAF (30fps target) for low-end devices');
    }

    return {
      testName,
      metrics,
      passed,
      issues,
      recommendations,
    };
  }

  /**
   * Simulate particle animation for testing
   */
  private async simulateParticleAnimation(
    particleCount: number,
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      // Create a test container
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(container);

      // Create particles
      const particles: HTMLElement[] = [];
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
          position: absolute;
          left: 50%;
          top: 50%;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          will-change: transform, opacity;
          transform: translateZ(0);
        `;
        container.appendChild(particle);
        particles.push(particle);
      }

      // Animate particles
      const startTime = performance.now();
      const animate = () => {
        const elapsed = performance.now() - startTime;

        if (elapsed < duration) {
          particles.forEach((particle) => {
            const progress = elapsed / duration;
            const x = Math.sin(progress * Math.PI * 2) * 100;
            const y = Math.cos(progress * Math.PI * 2) * 100;
            const opacity = 1 - progress;

            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity.toString();
          });

          requestAnimationFrame(animate);
        } else {
          // Cleanup
          container.remove();
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Simulate screen shake for testing
   */
  private async simulateScreenShake(duration: number): Promise<void> {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        animation: shake ${duration}ms ease-in-out;
      `;
      document.body.appendChild(container);

      // Add shake keyframes
      const style = document.createElement('style');
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(2px, 2px); }
          20% { transform: translate(-2px, -2px); }
          30% { transform: translate(2px, -2px); }
          40% { transform: translate(-2px, 2px); }
          50% { transform: translate(2px, 2px); }
          60% { transform: translate(-2px, -2px); }
          70% { transform: translate(2px, -2px); }
          80% { transform: translate(-2px, 2px); }
          90% { transform: translate(2px, 2px); }
        }
      `;
      document.head.appendChild(style);

      setTimeout(() => {
        container.remove();
        style.remove();
        resolve();
      }, duration);
    });
  }

  /**
   * Simulate confetti for testing
   */
  private async simulateConfetti(confettiCount: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        canvas.remove();
        resolve();
        return;
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Confetti particles
      const confetti: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        rotation: number;
        color: string;
      }> = [];

      for (let i = 0; i < confettiCount; i++) {
        confetti.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 20,
          vy: (Math.random() - 0.5) * 20,
          rotation: Math.random() * 360,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        });
      }

      const startTime = performance.now();
      const animate = () => {
        const elapsed = performance.now() - startTime;

        if (elapsed < duration) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          confetti.forEach((particle) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.3; // gravity

            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate((particle.rotation * Math.PI) / 180);
            ctx.fillStyle = particle.color;
            ctx.fillRect(-5, -5, 10, 10);
            ctx.restore();
          });

          requestAnimationFrame(animate);
        } else {
          canvas.remove();
          resolve();
        }
      };

      animate();
    });
  }
}

/**
 * Run complete mobile VFX test suite
 */
export async function testMobileVFX(): Promise<{
  summary: string;
  results: VFXTestResult[];
  deviceInfo: DeviceInfo;
}> {
  const tester = new MobileVFXTester();
  const results: VFXTestResult[] = [];
  const deviceInfo = tester.getDeviceInfo();

  console.log('🧪 Starting Mobile VFX Performance Tests...');
  console.log('📱 Device Info:', deviceInfo);

  // Test 1: Particle effects (mythic rarity - 40 particles)
  console.log('🎆 Testing particle effects (40 particles)...');
  const particleTest = await tester.testParticleEffects(40);
  results.push(particleTest);
  console.log(`   Result: ${particleTest.passed ? '✅ PASS' : '❌ FAIL'} (${particleTest.metrics.fps}fps)`);

  // Test 2: Screen shake
  console.log('📳 Testing screen shake...');
  const shakeTest = await tester.testScreenShake();
  results.push(shakeTest);
  console.log(`   Result: ${shakeTest.passed ? '✅ PASS' : '❌ FAIL'} (${shakeTest.metrics.fps}fps)`);

  // Test 3: Confetti effects (mythic rarity - 150 particles)
  console.log('🎉 Testing confetti effects (150 particles)...');
  const confettiTest = await tester.testConfettiEffects(150);
  results.push(confettiTest);
  console.log(`   Result: ${confettiTest.passed ? '✅ PASS' : '❌ FAIL'} (${confettiTest.metrics.fps}fps)`);

  // Generate summary
  const passCount = results.filter((r) => r.passed).length;
  const summary = `Mobile VFX Tests: ${passCount}/${results.length} passed`;

  console.log('\n📊 Test Summary:', summary);

  results.forEach((result) => {
    if (!result.passed) {
      console.log(`\n❌ ${result.testName} Failed:`);
      result.issues.forEach((issue) => console.log(`   - ${issue}`));
      console.log('   Recommendations:');
      result.recommendations.forEach((rec) => console.log(`   - ${rec}`));
    }
  });

  return {
    summary,
    results,
    deviceInfo,
  };
}
