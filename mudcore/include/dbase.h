/*****************************************************************************
Copyright: 2019, Mud.Ren
File name: dbase.h
Description: dbase.c 函数声明
Author: xuefeng
Version: v1.0
Date: 2019-03-15
*****************************************************************************/
#ifndef DBASE_H
#define DBASE_H

mapping query_entire_dbase();
mapping query_entire_temp_dbase();

mixed set(string prop, mixed data);
varargs mixed query(string prop, int raw);
mixed add(string prop, mixed data);
int delete(string prop);

mixed set_temp(string prop, mixed data);
varargs mixed query_temp(string prop, int raw);
mixed add_temp(string prop, mixed data);
int delete_temp(string prop);

nomask void set_dbase(mapping data);
nomask void set_temp_dbase(mapping data);

#endif
