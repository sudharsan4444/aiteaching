require('dotenv').config();
console.log('Testing imports...');
try {
    console.log('1. Requiring auth route...');
    require('./routes/auth');
    console.log('2. Requiring admin route...');
    require('./routes/admin');
    console.log('3. Requiring upload route...');
    require('./routes/upload');
    console.log('4. Requiring ai route...');
    require('./routes/ai');
    console.log('5. Requiring assessment route...');
    require('./routes/assessment');
    console.log('6. Requiring submission route...');
    require('./routes/submission');
    console.log('7. Requiring files route...');
    require('./routes/files');
    console.log('✅ All imports successful!');
} catch (error) {
    console.error('❌ Import failed:', error);
}
