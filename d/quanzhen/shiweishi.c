#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "事为室");
        set("long", @LONG
这里是全真七子之首马钰的居室。房间很小，只摆放一张
床、一张书桌和一把椅子。书桌上放着本老子，床上被褥折叠
得整整齐齐。
LONG);
        set("exits", ([
                "south" : __DIR__"cetang",
        ]));

        set("objects", ([
                CLASS_D("quanzhen") + "/ma" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
