#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "茶室");
        set("long", @LONG
满屋的果香和茶香，沁人心脾。山西面的茶农们因感激武
当弟子保护他们免受土匪的骚乱和官府的苛捐杂税，每年开春
采茶季节，总要送来上好的茶叶。这茶叶由少女在三更至日出
间采摘，放在怀中用体温焙制，得天地精华，汇处子体香，故
名女儿香，据说喝了能提精补神，十分珍贵。
LONG);
        set("exits", ([
                "north" : __DIR__"donglang2",
        ]));
        set("objects",([
                __DIR__"npc/xiaocui" : 1,
                __DIR__"obj/mitao" : 3,
                __DIR__"obj/dawancha" : 4,
        ]));
        setup();
}
