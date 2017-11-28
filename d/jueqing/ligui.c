#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "厉鬼峰");
        set("long", @LONG
此处是绝情谷东面的厉鬼峰，谷中世代相传，峰上有厉鬼
作崇，是以谁也不敢上来。一到这里狂风大作，吹得人不禁毛
骨悚然，担了一个寒颤。
LONG);
        set("outdoors", "jueqing");
        set("exits", ([
               "southwest" : __DIR__"shanlu6",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
