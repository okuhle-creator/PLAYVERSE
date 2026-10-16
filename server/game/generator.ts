/**
 * GLITCH HUNT — Puzzle Generation Engine
 * Deterministic, explainable anomaly generation across 10 technical categories.
 */

export type SeverityLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRIT';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface TelemetryEvent {
  id: string;
  source: string;
  level: SeverityLevel;
  timestamp: string;
  message: string;
  metric: string;
  value: string;
}

export interface GeneratedPuzzle {
  events: TelemetryEvent[];
  anomalyId: string;
  explanation: string;
  category: string;
  difficulty: Difficulty;
}

// Deterministic PRNG: Mulberry32
export class SeededPRNG {
  private state: number;

  constructor(seedStr: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619) >>> 0;
    }
    this.state = h;
  }

  // Returns number in [0, 1)
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

interface PuzzleScenarioTemplate {
  category: string;
  difficulty: Difficulty;
  build: (prng: SeededPRNG, baseTime: Date) => {
    normalEvents: Omit<TelemetryEvent, 'id'>[];
    anomalousEvent: Omit<TelemetryEvent, 'id'>;
    explanation: string;
  };
}

const TEMPLATES: PuzzleScenarioTemplate[] = [
  // 1. Timestamp Inconsistency (Easy)
  {
    category: 'Timestamp Inconsistency',
    difficulty: 'easy',
    build: (prng, base) => {
      const t0 = base.getTime();
      return {
        normalEvents: [
          {
            source: 'api-edge-router',
            level: 'INFO',
            timestamp: new Date(t0).toISOString(),
            message: 'Inbound TLS handshake established on edge listener',
            metric: 'handshake_time',
            value: `${prng.nextInt(12, 28)} ms`
          },
          {
            source: 'auth-gateway',
            level: 'INFO',
            timestamp: new Date(t0 + 40).toISOString(),
            message: 'Bearer token signature validated against JWKS cache',
            metric: 'auth_duration',
            value: '4.2 ms'
          },
          {
            source: 'session-store',
            level: 'INFO',
            timestamp: new Date(t0 + 85).toISOString(),
            message: 'Active session lease retrieved from distributed Redis cluster',
            metric: 'redis_lookup',
            value: '1.8 ms'
          },
          {
            source: 'payments-edge',
            level: 'INFO',
            timestamp: new Date(t0 + 130).toISOString(),
            message: 'Idempotency key checked; dispatching transaction settlement',
            metric: 'idempotency_state',
            value: 'KEY_FRESH'
          }
        ],
        anomalousEvent: {
          source: 'db-shard-primary',
          level: 'INFO',
          timestamp: new Date(t0 - 3600000).toISOString(), // 1 hour in the past!
          message: 'Transaction commit finalized on ACID write ahead log',
          metric: 'wal_sync',
          value: '0.9 ms'
        },
        explanation:
          'The primary database event reports a commit timestamp 60 minutes before the upstream ingress edge router received the initial connection request.'
      };
    }
  },

  // 2. Mismatched Status Code and Message (Easy)
  {
    category: 'Status Code Contradiction',
    difficulty: 'easy',
    build: (prng, base) => {
      const t0 = base.getTime();
      return {
        normalEvents: [
          {
            source: 'edge-reverse-proxy',
            level: 'INFO',
            timestamp: new Date(t0).toISOString(),
            message: 'Forwarding authenticated query to downstream order-svc',
            metric: 'http_status',
            value: '200 OK'
          },
          {
            source: 'order-svc',
            level: 'INFO',
            timestamp: new Date(t0 + 50).toISOString(),
            message: 'Order payload parsed and inventory reservations confirmed',
            metric: 'items_reserved',
            value: `${prng.nextInt(1, 4)} items`
          },
          {
            source: 'inventory-svc',
            level: 'INFO',
            timestamp: new Date(t0 + 95).toISOString(),
            message: 'Stock reservation lock acquired on partition rack-04',
            metric: 'lock_wait_time',
            value: '2.1 ms'
          },
          {
            source: 'audit-logger',
            level: 'INFO',
            timestamp: new Date(t0 + 140).toISOString(),
            message: 'Immutable audit entry recorded in Kafka topic orders.v1',
            metric: 'topic_offset',
            value: `offset_${prng.nextInt(10000, 99999)}`
          }
        ],
        anomalousEvent: {
          source: 'auth-gateway',
          level: 'INFO',
          timestamp: new Date(t0 + 20).toISOString(),
          message: 'Credentials rejected: invalid client cryptographic signature',
          metric: 'http_status',
          value: '200 OK'
        },
        explanation:
          'The authentication gateway reports HTTP status 200 OK while declaring credentials rejected due to an invalid cryptographic signature.'
      };
    }
  },

  // 3. Failed Request with Contradictory Success Indicator (Easy)
  {
    category: 'Settlement State Contradiction',
    difficulty: 'easy',
    build: (prng, base) => {
      const t0 = base.getTime();
      return {
        normalEvents: [
          {
            source: 'checkout-ingress',
            level: 'INFO',
            timestamp: new Date(t0).toISOString(),
            message: 'Cart checkout pipeline initiated by user session',
            metric: 'cart_value_usd',
            value: '$149.50'
          },
          {
            source: 'fraud-guard-v2',
            level: 'INFO',
            timestamp: new Date(t0 + 30).toISOString(),
            message: 'Heuristic risk score computed below threshold; cleared',
            metric: 'risk_score',
            value: '0.04 / 1.00'
          },
          {
            source: 'ledger-sync',
            level: 'INFO',
            timestamp: new Date(t0 + 120).toISOString(),
            message: 'Double-entry balance verification completed across ledgers',
            metric: 'ledger_diff',
            value: '$0.00'
          },
          {
            source: 'notification-dispatcher',
            level: 'INFO',
            timestamp: new Date(t0 + 180).toISOString(),
            message: 'Order confirmation queued for email delivery pipeline',
            metric: 'queue_depth',
            value: `${prng.nextInt(3, 15)} msgs`
          }
        ],
        anomalousEvent: {
          source: 'payments-edge',
          level: 'ERROR',
          timestamp: new Date(t0 + 75).toISOString(),
          message: 'Settlement failed: account has insufficient credit funds',
          metric: 'funds_deducted',
          value: 'TRUE ($149.50)'
        },
        explanation:
          'The payments edge marks the transaction as failed with insufficient funds, yet simultaneously reports funds_deducted as TRUE.'
      };
    }
  },

  // 4. Impossible Metric Relationship: Cache Hit Ratio vs Latency (Normal)
  {
    category: 'Metric Inconsistency',
    difficulty: 'normal',
    build: (_prng, base) => {
      const t0 = base.getTime();
      return {
        normalEvents: [
          {
            source: 'cdn-fastly-edge',
            level: 'INFO',
            timestamp: new Date(t0).toISOString(),
            message: 'Static asset bundle cache evaluated at regional PoP',
            metric: 'cache_hit_rate',
            value: '98.4%'
          },
          {
            source: 'edge-balancer',
            level: 'INFO',
            timestamp: new Date(t0 + 15).toISOString(),
            message: 'Routing cache-miss query to regional origin cluster',
            metric: 'origin_hops',
            value: '1 hop'
          },
          {
            source: 'session-store',
            level: 'INFO',
            timestamp: new Date(t0 + 40).toISOString(),
            message: 'Memory tier hit; zero SSD paging observed',
            metric: 'lookup_latency',
            value: '0.8 ms'
          },
          {
            source: 'api-gateway',
            level: 'INFO',
            timestamp: new Date(t0 + 90).toISOString(),
            message: 'Origin response compressed and dispatched to edge',
            metric: 'transfer_size',
            value: '42.1 KB'
          }
        ],
        anomalousEvent: {
          source: 'cache-west-02',
          level: 'WARN',
          timestamp: new Date(t0 + 25).toISOString(),
          message: 'L1 in-memory cache hit; serving payload directly from RAM',
          metric: 'fetch_latency',
          value: '4,850 ms'
        },
        explanation:
          'Cache-west-02 reports an in-memory L1 cache hit served directly from RAM, yet logs an impossible fetch latency of 4,850 ms.'
      };
    }
  },

  // 5. Impossible Concurrency vs Queue Depth (Normal)
  {
    category: 'Queue Concurrency Contradiction',
    difficulty: 'normal',
    build: (prng, base) => {
      const t0 = base.getTime();
      return {
        normalEvents: [
          {
            source: 'job-scheduler',
            level: 'INFO',
            timestamp: new Date(t0).toISOString(),
            message: 'Batch reconciliation trigger scheduled on cron tick',
            metric: 'scheduled_jobs',
            value: '12 tasks'
          },
          {
            source: 'worker-node-01',
            level: 'INFO',
            timestamp: new Date(t0 + 80).toISOString(),
            message: 'Worker polled Redis queue and consumed 4 job messages',
            metric: 'active_threads',
            value: '4 / 8'
          },
          {
            source: 'worker-node-02',
            level: 'INFO',
            timestamp: new Date(t0 + 110).toISOString(),
            message: 'Worker running thumbnail generation batch',
            metric: 'cpu_usage',
            value: `${prng.nextInt(45, 65)}%`
          },
          {
            source: 'blob-storage',
            level: 'INFO',
            timestamp: new Date(t0 + 190).toISOString(),
            message: 'Processed output blobs persisted with SHA-256 integrity tag',
            metric: 'io_throughput',
            value: '84 MB/s'
          }
        ],
        anomalousEvent: {
          source: 'worker-queue',
          level: 'INFO',
          timestamp: new Date(t0 + 40).toISOString(),
          message: 'Queue reported completely empty with zero pending or inflight tasks',
          metric: 'active_consumers',
          value: '450 concurrent workers'
        },
        explanation:
          'The worker queue reports 0 pending or inflight tasks in an empty queue, while concurrently reporting 450 active processing consumers.'
      };
    }
  },

  // 6. Sudden Latency Spike Contradicting Fast Downstream Bus (Normal)
  {
    category: 'Trace Latency Disconnect',
    difficulty: 'normal',
    build: (_prng, base) => {
      const t0 = base.getTime();
      return {
        normalEvents: [
          {
            source: 'internal-rpc-mesh',
            level: 'INFO',
            timestamp: new Date(t0 + 20).toISOString(),
            message: 'gRPC stream healthy across cluster mesh',
            metric: 'mesh_latency',
            value: '1.2 ms'
          },
          {
            source: 'db-shard-primary',
            level: 'INFO',
            timestamp: new Date(t0 + 45).toISOString(),
            message: 'Indexed B-Tree lookup executed on customer record',
            metric: 'query_time',
            value: '2.4 ms'
          },
          {
            source: 'search-indexer',
            level: 'INFO',
            timestamp: new Date(t0 + 70).toISOString(),
            message: 'Elasticsearch query node retrieved 10 hits',
            metric: 'took_ms',
            value: '4.8 ms'
          },
          {
            source: 'egress-proxy',
            level: 'INFO',
            timestamp: new Date(t0 + 95).toISOString(),
            message: 'Streaming response stream flushed to client socket',
            metric: 'socket_buffer',
            value: '0 bytes'
          }
        ],
        anomalousEvent: {
          source: 'media-proxy',
          level: 'CRIT',
          timestamp: new Date(t0 + 10).toISOString(),
          message: 'Proxy thread stalled awaiting internal cluster RPC response',
          metric: 'elapsed_duration',
          value: '28,900 ms'
        },
        explanation:
          'The media-proxy claims it stalled for 28,900 ms awaiting cluster response, but the entire downstream trace across the RPC mesh and DB shards completed in under 100 ms.'
      };
    }
  },

  // 7. Circuit Breaker State Contradiction (Normal)
  {
    category: 'State Machine Inconsistency',
    difficulty: 'normal',
    build: (prng, base) => {
      const t0 = base.getTime();
      return {
        normalEvents: [
          {
            source: 'rate-limiter',
            level: 'INFO',
            timestamp: new Date(t0).toISOString(),
            message: 'Token bucket checked: client within normal quota',
            metric: 'tokens_remaining',
            value: '192 / 200'
          },
          {
            source: 'load-balancer',
            level: 'WARN',
            timestamp: new Date(t0 + 35).toISOString(),
            message: 'Health probes marked upstream billing service as degraded',
            metric: 'unhealthy_nodes',
            value: '3 / 4'
          },
          {
            source: 'billing-adapter',
            level: 'INFO',
            timestamp: new Date(t0 + 80).toISOString(),
            message: 'Graceful fallback plan executed: transactions deferred to offline ledger',
            metric: 'deferred_count',
            value: '1'
          },
          {
            source: 'audit-logger',
            level: 'INFO',
            timestamp: new Date(t0 + 120).toISOString(),
            message: 'Degraded mode telemetry recorded for ops monitoring',
            metric: 'incident_flag',
            value: 'ACTIVE'
          }
        ],
        anomalousEvent: {
          source: 'circuit-breaker-billing',
          level: 'INFO',
          timestamp: new Date(t0 + 50).toISOString(),
          message: 'Circuit state verified: OPEN (all inbound traffic short-circuited)',
          metric: 'passed_requests',
          value: `${prng.nextInt(850, 1200)} req/s forwarded`
        },
        explanation:
          'The circuit breaker declares its state as OPEN (which by definition drops/short-circuits all calls), yet reports forwarding hundreds of requests per second directly downstream.'
      };
    }
  },

  // 8. Security Policy & TLS Mismatch (Hard)
  {
    category: 'Security Policy Contradiction',
    difficulty: 'hard',
    build: (_prng, base) => {
      const t0 = base.getTime();
      return {
        normalEvents: [
          {
            source: 'policy-enforcer',
            level: 'INFO',
            timestamp: new Date(t0).toISOString(),
            message: 'Strict compliance policy enforced: TLS 1.3 required; legacy ciphers disabled',
            metric: 'min_tls_version',
            value: 'TLSv1.3'
          },
          {
            source: 'waf-edge',
            level: 'INFO',
            timestamp: new Date(t0 + 20).toISOString(),
            message: 'Payload scanned: zero SQLi or XSS patterns detected',
            metric: 'rules_evaluated',
            value: '148'
          },
          {
            source: 'auth-gateway',
            level: 'INFO',
            timestamp: new Date(t0 + 60).toISOString(),
            message: 'Client mTLS client certificate verified against internal Root CA',
            metric: 'cert_fingerprint',
            value: 'SHA256:7f9a...3c21'
          },
          {
            source: 'session-store',
            level: 'INFO',
            timestamp: new Date(t0 + 100).toISOString(),
            message: 'Session entropy verified; cookie assigned Secure and HttpOnly flags',
            metric: 'cookie_flags',
            value: 'SECURE_SAMESITE_STRICT'
          }
        ],
        anomalousEvent: {
          source: 'api-edge-router',
          level: 'INFO',
          timestamp: new Date(t0 + 15).toISOString(),
          message: 'Client ingress connection accepted and cipher negotiated',
          metric: 'negotiated_protocol',
          value: 'TLSv1.0 (DES-CBC3-SHA)'
        },
        explanation:
          'The edge router accepted a deprecated TLSv1.0 connection with weak 3DES cipher, directly violating the active organization policy that strictly requires TLS 1.3.'
      };
    }
  },

  // 9. Resource Utilization vs Throughput Paradox (Hard)
  {
    category: 'Resource Contradiction',
    difficulty: 'hard',
    build: (_prng, base) => {
      const t0 = base.getTime();
      return {
        normalEvents: [
          {
            source: 'cluster-autoscaler',
            level: 'INFO',
            timestamp: new Date(t0).toISOString(),
            message: 'Cluster size calculated based on ingress traffic trends',
            metric: 'node_count',
            value: '6 nodes'
          },
          {
            source: 'telemetry-ingest',
            level: 'INFO',
            timestamp: new Date(t0 + 40).toISOString(),
            message: 'Aggregated ingress metric stream received across all nodes',
            metric: 'network_in',
            value: '0.12 MB/s'
          },
          {
            source: 'worker-queue',
            level: 'INFO',
            timestamp: new Date(t0 + 70).toISOString(),
            message: 'Queue idle; all pending jobs drained 14 minutes ago',
            metric: 'pending_tasks',
            value: '0'
          },
          {
            source: 'db-shard-primary',
            level: 'INFO',
            timestamp: new Date(t0 + 110).toISOString(),
            message: 'Database query pool idle; zero open connections',
            metric: 'pool_utilization',
            value: '2.0%'
          }
        ],
        anomalousEvent: {
          source: 'worker-node-03',
          level: 'INFO',
          timestamp: new Date(t0 + 55).toISOString(),
          message: 'Worker reporting process loop statistics; zero active processes',
          metric: 'cpu_usage',
          value: '99.8% (all 16 cores)'
        },
        explanation:
          'Worker node 03 reports 0 active processes with no queue tasks and negligible network input, yet records 99.8% CPU saturation across all 16 cores with no workload assigned.'
      };
    }
  },

  // 10. Geographic & Token TTL Anomaly (Hard)
  {
    category: 'Auth Time & Geo Inconsistency',
    difficulty: 'hard',
    build: (_prng, base) => {
      const t0 = base.getTime();
      return {
        normalEvents: [
          {
            source: 'auth-gateway-us-east',
            level: 'INFO',
            timestamp: new Date(t0).toISOString(),
            message: 'User authentication issued via WebAuthn passkey',
            metric: 'issued_at_geo',
            value: 'US-East (Virginia)'
          },
          {
            source: 'user-profile-svc',
            level: 'INFO',
            timestamp: new Date(t0 + 30).toISOString(),
            message: 'User permissions loaded from read replica in region us-east-1',
            metric: 'roles_loaded',
            value: 'role:operator'
          },
          {
            source: 'audit-logger',
            level: 'INFO',
            timestamp: new Date(t0 + 60).toISOString(),
            message: 'Session establishment event recorded in master security index',
            metric: 'audit_status',
            value: 'COMMITTED'
          },
          {
            source: 'dashboard-gateway',
            level: 'INFO',
            timestamp: new Date(t0 + 90).toISOString(),
            message: 'Operator console UI rendered for active session',
            metric: 'render_duration',
            value: '18 ms'
          }
        ],
        anomalousEvent: {
          source: 'token-refresher-ap-south',
          level: 'INFO',
          timestamp: new Date(t0 + 40).toISOString(), // 40 milliseconds later!
          message: 'Physical token refresh completed from edge kiosk terminal',
          metric: 'geo_location',
          value: 'AP-South (Singapore)'
        },
        explanation:
          'A physical token refresh was logged in Singapore only 40 milliseconds after an authentication in Virginia, USA—an impossible physical distance to traverse in 40ms without credential sharing or spoofing.'
      };
    }
  }
];

/**
 * Generate a puzzle either deterministically (from a string seed) or randomly.
 */
export function generatePuzzle(seed?: string, requestedDifficulty?: Difficulty): GeneratedPuzzle {
  const effectiveSeed = seed || `${Date.now()}-${Math.random()}`;
  const prng = new SeededPRNG(effectiveSeed);

  // Filter templates by difficulty if requested, or match
  let candidates = TEMPLATES;
  if (requestedDifficulty) {
    const matched = TEMPLATES.filter((t) => t.difficulty === requestedDifficulty);
    if (matched.length > 0) {
      candidates = matched;
    }
  }

  const template = prng.pick(candidates);
  const baseTime = new Date('2026-10-13T10:30:00.000Z');
  // Add some jitter to baseTime based on seed
  baseTime.setSeconds(baseTime.getSeconds() + prng.nextInt(0, 10000));

  const { normalEvents, anomalousEvent, explanation } = template.build(prng, baseTime);

  // Generate unique event IDs
  const idPrefix = `evt-${prng.nextInt(1000, 9999).toString(16)}`;
  
  const anomalyFullEvent: TelemetryEvent = {
    ...anomalousEvent,
    id: `${idPrefix}-x`
  };

  const normalFullEvents: TelemetryEvent[] = normalEvents.map((evt, idx) => ({
    ...evt,
    id: `${idPrefix}-${idx + 1}`
  }));

  // Combine and shuffle the 5 events so anomaly position is unpredictable
  const allEvents = prng.shuffle([anomalyFullEvent, ...normalFullEvents]);

  // Ensure exactly 5 events
  if (allEvents.length !== 5) {
    throw new Error(`Expected exactly 5 telemetry events, got ${allEvents.length}`);
  }

  return {
    events: allEvents,
    anomalyId: anomalyFullEvent.id,
    explanation,
    category: template.category,
    difficulty: template.difficulty
  };
}

/**
 * Deterministic generator for UTC Daily Challenge.
 */
export function generateDailyChallenge(dateStr?: string): GeneratedPuzzle {
  // If not provided, use today's UTC date 'YYYY-MM-DD'
  const todayUtc = dateStr || new Date().toISOString().slice(0, 10);
  const dailySeed = `daily-challenge-seed-${todayUtc}`;
  return generatePuzzle(dailySeed, 'normal');
}
