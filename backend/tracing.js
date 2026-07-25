const { metrics } = require('@opentelemetry/api');
const { logs } = require('@opentelemetry/api-logs');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const {
  OTLPMetricExporter,
  AggregationTemporalityPreference,
} = require('@opentelemetry/exporter-metrics-otlp-http');
const { LoggerProvider, BatchLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://localhost:4318/v1/metrics',
      temporalityPreference: AggregationTemporalityPreference.DELTA,
    }),
    exportIntervalMillis: 10000,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'craft-my-plate-backend',
});

sdk.start();

const logExporter = new OTLPLogExporter({
  url: 'http://localhost:4318/v1/logs',
});
const loggerProvider = new LoggerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'craft-my-plate-backend',
  }),
  processors: [new BatchLogRecordProcessor({ exporter: logExporter })],
});
logs.setGlobalLoggerProvider(loggerProvider);

function getLogger() {
  return logs.getLogger('craft-my-plate-backend');
}

// Counters must be created AFTER sdk.start() or they use a no-op meter.
const meter = metrics.getMeter('craft-my-plate-backend');

const rbacDeniedTotal = meter.createCounter('rbac_denied_total', {
  description: 'RBAC access denials',
});

const inventoryConflictTotal = meter.createCounter('inventory_conflict_total', {
  description: 'Order attempts blocked by insufficient stock',
});

const ordersPlacedTotal = meter.createCounter('orders_placed_total', {
  description: 'Order placement outcomes',
});

const menuItemsCreatedTotal = meter.createCounter('menu_items_created_total', {
  description: 'Menu items created by admins',
});

module.exports = {
  getLogger,
  rbacDeniedTotal,
  inventoryConflictTotal,
  ordersPlacedTotal,
  menuItemsCreatedTotal,
};
