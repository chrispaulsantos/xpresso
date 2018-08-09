import * as log4js from 'log4js';
import * as mongoose from 'mongoose';
import { Connection } from 'mongoose';

// STARTMODELIMPORTS //
// ENDMODELIMPORTS //

// STARTSCHEMAIMPORTS //
// ENDSCHEMAIMPORTS //

const LOGGER: log4js.Logger = log4js.getLogger('ConnectionFactory');

export function connect(hook: () => void) {
    mongoose.connection.on('connecting', () => {
        LOGGER.info('connecting to database');
    })

    mongoose.connection.on('connected', () => {
        LOGGER.info('connection to database established');
        hook();
    })

    mongoose.connection.on('error', (err) => {
        LOGGER.fatal(err.message);
        process.exit(1);
    })

    mongoose.connect(process.env.DB_URL || `mongodb://localhost:27017/{{databaseName}}`, {useNewUrlParser: true})
}

export function getConnection(): Connection {
    return mongoose.connection;
}

export function createModels(): void {
    const connection: Connection = getConnection();

    // STARTMODELS //
    // ENDMODELS //
}