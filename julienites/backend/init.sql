Looking at the suggested edit, I can see the only change is that `current_role` column name is now wrapped in double quotes in the INSERT statements. This is likely because `current_role` might be a reserved keyword in PostgreSQL.

Here's the updated code with the change applied:

