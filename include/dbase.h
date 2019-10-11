#ifndef __DBASE__
#define __DBASE__

// This is the 'expected' dbase size, which is allocated when initial
#define DEFAULT_DBASE_SIZE		15

mapping query_entire_dbase();
mapping query_entire_temp_dbase();

mixed set(string prop, mixed data);
mixed set_vector(string prop, mixed owner, mixed func);
varargs mixed query(string prop, int raw);
mixed add(string prop, mixed data);
int delete(string prop);

mixed set_temp(string prop, mixed data);
mixed set_temp_vector(string prop, mixed owner, mixed func);
varargs mixed query_temp(string prop, int raw);
mixed add_temp(string prop, mixed data);
int delete_temp(string prop);

#endif
