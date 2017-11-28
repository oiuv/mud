// action.h

#ifndef __ACTION__
#define __ACTION__

varargs void start_busy(mixed busy, mixed interrupt);

int  set_override(string index, function fun);
varargs void query_override(string index);
int  run_override(string index);
void delete_override(string index);

#endif
