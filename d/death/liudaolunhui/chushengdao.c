#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", NOR + CYN "\n\n                畜        生        道" NOR);
        set("long", CYN "\n"
"飞禽走兽，弱肉强食。因学习邪见、邪法而生慢心的众生，喜\n"
"欢以邪见与人争论，因为怀着怨憎心，就会投生喜欢互相残害\n"
"的畜生道。性情怯弱，常怀惊恐的动物，也是因过去生惊吓他\n"
"人在先，而得出这样的果报。\n\n" NOR);
        setup();
}

