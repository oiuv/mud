#include <ansi.h> 
inherit ROOM;

void create()
{
        set("short", "磨针井");
        set("long", @LONG
相传当年真武进山修炼，日久思归，偶遇一老妇持铁杵研
磨。问磨杵为何？答以磨针。又问铁杵岂能磨针？答云功到自
然成。真武由此醒悟，终于修炼成仙。后人因建磨针井道观以
为纪念。殿前立大铁杵一根，殿旁有老母亭，亭正中有井。
LONG);
        set("exits", ([
                "west" : __DIR__"shanlu1",
        ]));
        set("item_desc",([ 
                "jing" : HIC "\n井沿古朴，水色悠蓝，可以装瓶饮用。\n\n" NOR,
        ]));
        set("resource/water", 1);
        set("outdoors", "wudang");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
