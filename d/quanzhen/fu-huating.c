#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "花厅");
        set("long", @LONG
这里是这户人家喝酒赏月的所在，一个小亭子建造在厅的
中央，四周围绕着一些葡萄藤(teng)。一阵微风吹过，空气中
似乎有隐隐的花香飘来，中人欲醉。
LONG);
        set("outdoors", "wugong");
        set("exits", ([
                "south" : __DIR__"fu-ceting",
                "west" : __DIR__"fu-xiaoyuan",
        ]));
        set("item_desc", ([
            "teng": GRN "这些藤好象长得有些日子了，密不透风，夏天"
                    "呆在藤下肯定阴凉极了。\n" NOR,
        ]));
        setup();
        replace_program(ROOM);
}
