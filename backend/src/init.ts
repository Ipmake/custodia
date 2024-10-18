import { prisma } from "."; 
import crypto from "crypto";

export default async function init() {
    console.log('Initializing server...');

    console.log('Updating token...');
    await prisma.config.upsert({
        where: { key: 'token' },
        update: { value: crypto.randomBytes(64).toString('hex') },
        create: { key: 'token', value: crypto.randomBytes(64).toString('hex') }
    });
    console.log('Token updated!');

    console.log('Checking whether user exists...'); 
    await prisma.config.upsert({
        where: { key: 'password' },
        update: {},
        create: { key: 'password', value: crypto.createHash('sha256').update(`custodia admin custodia`).digest('hex') }
    });
    console.log('User checked!');
    console.log('The default password is "admin"!');

    console.log('Checking whether general data exists...');
    await prisma.config.upsert({
        where: { key: 'title' },
        update: {},
        create: { key: 'title', value: 'Custodia' }
    });
    await prisma.config.upsert({
        where: { key: 'subtitle' },
        update: {},
        create: { key: 'subtitle', value: 'Welcome to Custodia' }
    });
    console.log('General data checked!');

    console.log('Initializing server done!');
}