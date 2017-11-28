// Room: /d/shaolin/hanshuim.c

#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "汉水");
        set("long", @LONG
这是汉水的货运渡船，波涛翻滚的江水将船摇得一晃一晃的。
但是船夫们将船操得稳稳的，不出一点岔子。
LONG );

        set("no_fight", 1);
        set("outdoors", "nanyang");
        setup();
        replace_program(ROOM);
}
