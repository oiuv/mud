#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这里是一座大山的山麓，抬头仰望，山上积雪皑皑，在日光
下映得闪烁生辉。山上云海迷茫，雪峰林立，阳光交辉在白云与
飞雪之间，隐隐能看见有一座城在山顶。路旁有一块木板(sign)。
LONG );

        set("item_desc", ([
        	"sign": HIW "\n\n    万  古  凌  霄  一  羽  毛\n\n" NOR "\n"
        ]) );
        set("exits",([
                "southeast"  : "/d/xuedao/sroad1",
                "westup"  : __DIR__"sroad1",
        ]));
        set("objects", ([
                __DIR__"npc/dizi" : 2,
        ]));
        set("outdoors", "lingxiao");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

