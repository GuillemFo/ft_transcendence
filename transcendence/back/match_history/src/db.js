import Sequelize from 'sequelize';

class DBInstance {
	constructor() {
		this.sequelize = new Sequelize({
			storage: '/api/db/match_history.db',
			dialect: 'sqlite',
			logging: false,
		});
	}
}

export default new DBInstance().sequelize;