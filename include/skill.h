// skill.h
#ifndef __SKILL__
#define __SKILL__

string query_skill_mapped(string skill);
mapping query_skills();
varargs void map_skill(string skill, string mapped_to);
varargs int query_skill(string skill, int raw);
varargs void improve_skill(string skill, int amount, int weak_mode);

mapping query_skill_prepare();
mapping query_wprepare();

#endif
