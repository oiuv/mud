#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "后厅");
        set("long", @LONG
这里是孤山梅庄的后厅，后厅内相当的宽敞明亮，四周的墙上悬
挂满了各朝名人的真迹，正堂坐着一个极高极瘦的黑衣老者，那老者
眉清目秀，只是脸色泛白，似乎是一具僵尸模样，令人一见之下，心
中便感到一阵凉意。大厅往南是一条走廊。
LONG
        );
        set("exits", ([
            "south" : __DIR__"zoulang3",
        ]));

        set("objects", ([
                CLASS_D("meizhuang") + "/heibai" : 1,
        ]));

        set("no_clean_up", 0);
        set("valid_startroom", 1);
        setup();
        "/clone/board/meizhuang_b"->foo();
        replace_program(ROOM);
}
