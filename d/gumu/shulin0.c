#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "小树林");
        set("long", @LONG
走在林中，你只闻铮铮琴声，一股淡淡白烟，带着极甜的
花香，自密林深处传出。一群乳白色的蜜蜂在你身旁飞来飞去。
只见一块石碑(shibei)立在当眼ㄦ处。往东是一块空地。其它
方向尽是茂密的树林。
LONG
        );
        set("outdoors", "quanzhen");
        set("item_desc", ([
                "shibei" : HIC
"
                        终南古墓，
                        外人止步。

\n" NOR,
        ]));
        set("exits", ([
                "southup" : __DIR__"shulin1",
                "north" : __DIR__"shulin4",
                "west"  : __DIR__"shulin5",
                "east"  : __DIR__"shulin6",
        ]));

        setup();
        replace_program(ROOM);
}
