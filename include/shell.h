// shell.h
#ifndef __SHELL_H
#define __SHELL_H
#define BINARIES_D(x)   ("/shell" + x[0..<2] + "b")

#define MAX_VAR_COUNT   10

#define SHELL_CHAR      '`'
#define SHELL_STR       "`"

#define VAR_CHAR        '@'

int delete_var(string prop);
mixed set_var(string prop, mixed data);
mapping query_all_vars();
int query_var_count();
mixed query_var(string prop);

string process_shell_string(string arg);
mixed evaluate_shell(string arg, int novalue);
string parse_shell(string arg);

#endif

