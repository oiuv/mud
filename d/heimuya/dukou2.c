#include <ansi.h>
inherit RIVER;

void create()
{
        set ("short", "龙门渡口");
        set ("long", @LONG
渡口前就是汹涌澎湃的黄河 (river)了。浊流滚滚，泥沙
俱下，声震数里。两岸渡船来来往往，在波谷中穿行，甚为凶
险。过了黄河，就是陕西了。
LONG);
        set("arrive_room", "/d/heimuya/dukou1");
        set("exits", ([
                "southwest" : "/d/huanghe/huanghe_1",
        ]));

        set("resource/fish", ({ "/clone/fish/liyu",
                                "/clone/fish/jiyu",
                                "/clone/fish/qingyu",
                                "/clone/fish/caoyu",
        }));

        set("outdoors", "heimuya");
        setup();
        replace_program(RIVER);
}