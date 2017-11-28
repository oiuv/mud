#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "后山山洞");
        set("long", @LONG
这里是全真教开山祖师王重阳真人静修的山洞。洞虽不大
但却布置得很是雅致，便似大户人家的客厅一样。洞壁上悬挂
着副画(hua)，桌椅茶几都很精致。
LONG);
        set("exits", ([
                "out" : __DIR__"xiaolu3",
        ]));
        set("item_desc", ([
        	"hua": YEL "\n画中是一个中年道士的背影，看不出什么相"
                       "貌，画中道人一手\n指着天，画角题着「" HIR "活"
                       "死人像" NOR + YEL "」几个字。\n" NOR,
        ]) );

        set("objects", ([
                CLASS_D("quanzhen") + "/wang" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
