const Thing = require('Grow.js');

// A rough GrowFile example... first draft, it's crude.
// Feel free to make suggestions though.
module.exports = new Thing({
	properties: {
		name: "Grow File example",
		version: '0.2.0',
		phases: {
			vegetative: {
				cycles: {
					day: {
						// Note: you may want to run the lights a little longer, adjust accordingly.
						start: 'after 6:00am',
						targets: {
							temperature: 24,
							humidity: {
								min: 51,
								max: 61
							},
							// Protip: C02 emitter should be timed in relation to exhaust fan so that C02 is not sucked out of room.
							co2: {
								min: 900,
								max: 1600
							}
						}
					},
					night: {
						start: 'after 9:00pm',
						targets: {
							temperature: 20,
							co2: 400,
							humidity: {
								min: 51,
								max: 61
							},
						}
					}
				}
			},

			bloom: {
				cycles: {
					day: {
						start: 'after 7:00am',
						targets: {
							temperature: 24,
							humidity: {
								min: 51,
								max: 59
							},
						}
					},
					night: {
						start: 'after 7:00pm',
						targets: {
							temperature: 20,
							co2: 400
						},
						humidity: {
							min: 51,
							max: 59
						},
					}
				}
			}
		}
	}
});
