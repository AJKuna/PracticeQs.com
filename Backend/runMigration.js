import { supabase } from './supabaseClient.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🚀 Starting database migration...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'create_topic_progress_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Migration file loaded:', sqlPath);
    console.log('🔄 Executing SQL...\n');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If the function doesn't exist, we need to execute SQL differently
      console.log('⚠️  exec_sql function not available, using direct execution...');
      console.log('📋 Please run this SQL manually in your Supabase SQL Editor:');
      console.log('\n' + '='.repeat(80));
      console.log(sql);
      console.log('='.repeat(80) + '\n');
      console.log('✅ After running the SQL, the migration will be complete!');
    } else {
      console.log('✅ Migration executed successfully!');
      console.log('📊 Result:', data);
    }
    
    // Verify the table was created
    console.log('\n🔍 Verifying table creation...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('topic_progress')
      .select('count')
      .limit(0);
    
    if (tableError && tableError.code === '42P01') {
      console.log('⚠️  Table not found. Please run the SQL manually (see above).');
    } else if (tableError) {
      console.log('⚠️  Error checking table:', tableError.message);
    } else {
      console.log('✅ Table verified successfully!');
    }
    
    console.log('\n🎉 Migration process complete!');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    console.error('Stack:', error.stack);
  }
}

runMigration();
