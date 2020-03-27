const assert = require('assert');
var timeseries = require("../src/timeseries-analysis");

/**
 * Datasets for testing
 */
const STOCK_DATA = [{
    date: '2020-03-26T03:00:00.000Z',
    high: 27.48,
    low: 26.36,
}, {
    date: '2020-03-27T03:00:00.000Z',
    high: 27.11,
    low: 26.4,
}, {
    date: '2020-03-28T03:00:00.000Z',
    high: 27.2,
    low: 26.39,
}];

const DATA_WITH_NULLS = [{
    date: '2020-03-26T03:00:00.000Z',
    high: 27.48,
    low: 26.36,
}, {
    date: '2020-03-27T03:00:00.000Z',
    high: 27.11,
    low: 26.4,
}, {
    date: '2020-03-28T03:00:00.000Z',
    high: 27.2,
    low: 26.39,
}, {
    date: '2020-03-31T03:00:00.000Z',
    high: NaN,
    low: NaN,
}, {
    date: '2020-04-01T03:00:00.000Z',
    high: 27.35,
    low: 26.49,
}, {
    date: '2020-04-02T03:00:00.000Z',
    high: NaN,
    low: NaN,
}, {
    date: '2020-04-03T03:00:00.000Z',
    high: NaN,
    low: NaN,
}];

const ARRAY_DATA = [12,16,14,13,11,10,9,11,23];

/**
 * Unit Tests
 */
describe('When loading data', () => {

    it('Should load data and values via an adapter', () => {

        const ts = new timeseries.main(timeseries.adapter.fromDB(STOCK_DATA, {
            date:   'date',
            value:  'high',
        }));
        assert.equal(ts.data.length, STOCK_DATA.length);
        
        // Check the data values match
        STOCK_DATA.map((datum, index) => {
            assert.equal(ts.data[index][1], datum.high);
        });
    });

    it('Should load data directly from an array', () => {

        const ts = new timeseries.main(timeseries.adapter.fromArray(ARRAY_DATA));
        assert.equal(ts.data.length, ARRAY_DATA.length);
        
        // Check the data values match
        ARRAY_DATA.map((datum, index) => {
            assert.equal(ts.data[index][1], datum);
        });
    });
});

describe('When getting basic statistics', () => {
    const ts = new timeseries.main(timeseries.adapter.fromDB(STOCK_DATA, {
        date:  'date',
        value: 'high',
    }));

    const ts_w_NaN = new timeseries.main(timeseries.adapter.fromDB(DATA_WITH_NULLS, {
        date: 'date',
        value: 'high',
    }));

    it('Should get the correct minimum', () => {
        assert.equal(ts.min(), 27.11);
        assert.equal(ts.max(), 27.48);
    });

    it('Should indicate the presence of NaN', () => {
        assert.equal(ts.hasNaN(), false);
        assert.equal(ts_w_NaN.hasNaN(), true);
    });

    it('Should handle NaN values', () => {
        const res = ts_w_NaN.mean();
        assert.equal(ts_w_NaN.min(), 27.11);
        assert.equal(ts_w_NaN.max(), 27.48);

        const meanDelta = Math.abs(ts_w_NaN.mean() - 27.285);
        assert.equal(meanDelta < 1E-10, true);
        assert.equal(isNaN(ts_w_NaN.stdev()), true);
    });

    it('Should count the number of NaN values', () => {
        assert.equal(ts_w_NaN.countNaN(), 3);
    })
});